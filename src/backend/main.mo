import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration"; // Add migration import

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use migration via 'with' for state changes
(with migration = Migration.run)
actor {
  // Access control & authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Types
  type ProductId = Text;
  type CategoryId = Text;
  type OrderId = Text;
  type UserId = Principal;
  type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };
  type ProductPic = Storage.ExternalBlob;

  type Credentials = {
    hashedPassword : Text;
    salt : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
  };

  type Product = {
    id : ProductId;
    title : Text;
    description : Text;
    price : Nat;
    category : CategoryId;
    size : Text;
    image : ProductPic;
  };

  type Category = {
    id : CategoryId;
    name : Text;
  };

  type Order = {
    id : OrderId;
    userId : UserId;
    items : [CartItem];
    total : Nat;
    status : Text;
    createdAt : Time.Time;
  };

  // Persistent state
  var nextProductId = 1;
  var nextOrderId = 1;

  let cartState = Map.empty<UserId, List.List<CartItem>>();
  let ratingState = Map.empty<ProductId, List.List<Nat>>();
  let productState = Map.empty<ProductId, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let wishlistState = Map.empty<UserId, List.List<ProductId>>();
  var adminActivationUsed = false;
  var adminActivationCode = 2537;

  let orders = List.empty<Order>();
  let categories = List.empty<Category>();
  let credentialsMap = Map.empty<UserId, Credentials>();

  var adminMode = false; // Default to strict mode (false)

  module Product {
    public func compareByPrice(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.price, p2.price);
    };
  };

  // Auth Management

  public shared ({ caller }) func setCredentials(password : Text, salt : Text) : async () {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin or #user) {
        if (password.size() < 10) {
          Runtime.trap("Password too short");
        };
        credentialsMap.add(caller, { hashedPassword = password; salt });
      };
      case (#guest) {
        if (password.size() < 10) {
          Runtime.trap("Password too short");
        };
        credentialsMap.add(caller, { hashedPassword = password; salt });
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
    };
  };

  public query ({ caller }) func getCredentials() : async ?Credentials {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get credentials");
    };
    credentialsMap.get(caller);
  };

  public query ({ caller }) func isUsernamePasswordSet() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check credentials status");
    };
    credentialsMap.containsKey(caller);
  };

  // Secure one-time backend-admin creation.
  public shared ({ caller }) func bootstrapAdmin(activationCode : Nat) : async () {
    if (adminActivationUsed) {
      Runtime.trap("Forbidden: Admin role has already been claimed");
    };

    if (activationCode != adminActivationCode) {
      Runtime.trap("Forbidden: Invalid admin activation code");
    };

    adminActivationUsed := true;
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin) {
        Runtime.trap("Bootstrap failed: Caller is already an admin");
      };
      case (#user or #guest) {
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
        ();
      };
    };
  };

  public shared ({ caller }) func resetAdminActivationCode(newActivationCode : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset activation code");
    };

    adminActivationCode := newActivationCode;
  };

  public shared ({ caller }) func clearAdminActivation() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear admin activation state");
    };

    adminActivationUsed := false;
  };

  public query ({ caller }) func getCallerPrincipal() : async Principal {
    caller;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Category Management
  public shared ({ caller }) func addCategory(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add categories");
    };

    let id = name;

    let category : Category = {
      id;
      name;
    };

    categories.add(category);
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.toArray();
  };

  // Product Management
  public shared ({ caller }) func uploadProductImage(image : Storage.ExternalBlob) : async ProductPic {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload product images");
    };
    image;
  };

  public shared ({ caller }) func addProduct(title : Text, description : Text, price : Nat, category : CategoryId, size : Text, image : ProductPic) : async ProductId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let productId = "prod" # nextProductId.toText();
    nextProductId += 1;

    let product : Product = {
      id = productId;
      title;
      description;
      price;
      category;
      size;
      image;
    };

    productState.add(productId, product);
    productId;
  };

  public query ({ caller }) func getProducts() : async [Product] {
    productState.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(categoryId : CategoryId) : async [Product] {
    productState.values().filter(
      func(product) { product.category == categoryId }
    ).toArray();
  };

  public query ({ caller }) func getProduct(productId : ProductId) : async Product {
    switch (productState.get(productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query ({ caller }) func getProductsFilteredByPrice(minPrice : Nat, maxPrice : Nat) : async [Product] {
    productState.values().filter(
      func(product) {
        product.price >= minPrice and product.price <= maxPrice
      }
    ).toArray();
  };

  public query ({ caller }) func getProductsSortedByPrice() : async [Product] {
    productState.values().toArray().sort(Product.compareByPrice);
  };

  public query ({ caller }) func searchProducts(searchText : Text) : async [Product] {
    productState.values().filter(
      func(product) {
        product.title.contains(#text(searchText)) or product.description.contains(#text(searchText)) or (product.category == searchText)
      }
    ).toArray();
  };

  public query ({ caller }) func getBestSellingProduct() : async ?Product {
    if (productState.isEmpty()) { return null };

    var maxSales = 0;
    var bestSellerId : ?ProductId = null;

    let productIds = productState.keys().toArray();
    for (id in productIds.values()) {
      let sales = cartState.values().filter(func(cart) { cart.toArray().any(func(item) { item.productId == id }) }).toArray().size();
      if (sales > maxSales) {
        maxSales := sales;
        bestSellerId := ?id;
      };
    };

    switch (bestSellerId) {
      case (?prodId) { productState.get(prodId) };
      case (null) { null };
    };
  };

  // Cart Management
  public shared ({ caller }) func addToCart(productId : ProductId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    assert (quantity > 0);

    switch (productState.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let currentCart = switch (cartState.get(caller)) {
          case (null) { List.empty<CartItem>() };
          case (?cart) { cart };
        };
        currentCart.add({ productId; quantity });
        cartState.add(caller, currentCart);
      };
    };
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (cartState.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    switch (cartState.get(caller)) {
      case (null) { () };
      case (?cart) {
        cartState.add(
          caller,
          cart.filter(
            func(item) { item.productId != productId }
          )
        );
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    cartState.remove(caller);
  };

  public shared ({ caller }) func checkout() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can checkout");
    };

    let cart = switch (cartState.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) {
        if (cart.size() == 0) { Runtime.trap("Cart is empty") };
        cart;
      };
    };

    let cartItems = cart.toArray();

    if (cartItems.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    var totalPrice = 0;
    for (item in cartItems.values()) {
      let product = switch (productState.get(item.productId)) {
        case (?product) { product };
        case (null) { Runtime.trap("Invalid product in cart") };
      };
      totalPrice += item.quantity * product.price;
    };

    let orderId = "order" # nextOrderId.toText();
    nextOrderId += 1;

    let order : Order = {
      id = orderId;
      userId = caller;
      items = cartItems;
      total = totalPrice;
      status = "pending";
      createdAt = Time.now();
    };

    orders.add(order);
    cartState.remove(caller);
  };

  // Order Management
  public query ({ caller }) func getOrders() : async [Order] {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      orders.toArray();
    } else if (AccessControl.hasPermission(accessControlState, caller, #user)) {
      orders.toArray().filter(func(order) { order.userId == caller });
    } else {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async ?Order {
    let ordersArray = orders.toArray();
    let orderOpt = ordersArray.find(
      func(order) { order.id == orderId }
    );

    switch (orderOpt) {
      case (null) { null };
      case (?order) {
        // Check authorization: user must own the order or be admin
        if (order.userId == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?order;
        } else {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let ordersArray = orders.toArray();
    let orderIndex = ordersArray.findIndex(
      func(order) { order.id == orderId }
    );

    switch (orderIndex) {
      case (null) { Runtime.trap("Order not found") };
      case (?idx) {
        let order = ordersArray[idx];
        let updatedOrder = {
          id = order.id;
          userId = order.userId;
          items = order.items;
          total = order.total;
          status;
          createdAt = order.createdAt;
        };

        orders.clear();
        let newOrdersArray = ordersArray;
        var i = 0;
        while (i < newOrdersArray.size()) {
          let currentOrder = if (i == idx) { updatedOrder } else { newOrdersArray[i] };
          orders.add(currentOrder);
          i += 1;
        };
      };
    };
  };

  // Review & Ratings
  public shared ({ caller }) func addRating(productId : ProductId, rating : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add ratings");
    };

    assert (rating >= 1 and rating <= 5);

    switch (productState.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let currentRatings = switch (ratingState.get(productId)) {
          case (null) { List.empty<Nat>() };
          case (?ratings) { ratings };
        };
        currentRatings.add(rating);
        ratingState.add(productId, currentRatings);
      };
    };
  };

  public query ({ caller }) func getProductRating(productId : ProductId) : async Nat {
    let ratings = switch (ratingState.get(productId)) {
      case (null) { List.empty<Nat>() };
      case (?ratings) { ratings };
    };

    if (ratings.size() == 0) {
      0;
    } else {
      let total = ratings.toArray().foldLeft(0, Nat.add);
      total / ratings.size();
    };
  };

  // Wishlist Management
  public shared ({ caller }) func addToWishlist(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to wishlist");
    };

    if (not productState.containsKey(productId)) {
      Runtime.trap("Product not found");
    };

    let currentWishlist = switch (wishlistState.get(caller)) {
      case (null) { List.empty<ProductId>() };
      case (?wishlist) { wishlist };
    };

    // Check if already in wishlist
    let alreadyExists = currentWishlist.toArray().any(func(id) { id == productId });
    if (not alreadyExists) {
      currentWishlist.add(productId);
      wishlistState.add(caller, currentWishlist);
    };
  };

  public query ({ caller }) func getWishlist() : async [ProductId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wishlist");
    };

    switch (wishlistState.get(caller)) {
      case (null) { [] };
      case (?wishlist) { wishlist.toArray() };
    };
  };

  public shared ({ caller }) func seedStore() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed store");
    };
  };
};
