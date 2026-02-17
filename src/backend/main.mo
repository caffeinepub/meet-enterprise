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

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  type MerchantId = Text;

  public type MerchantConfig = {
    upiId : Text;
    merchantName : Text;
    merchantCode : ?Text;
    qrImagePath : Text;
  };

  // Persistent state
  var nextProductId = 1;
  var nextOrderId = 1;

  let cartState = Map.empty<UserId, List.List<CartItem>>();
  let ratingState = Map.empty<ProductId, List.List<Nat>>();
  let productState = Map.empty<ProductId, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let wishlistState = Map.empty<UserId, List.List<ProductId>>();
  let merchantConfigs = Map.empty<MerchantId, MerchantConfig>();
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

  // Helper function to auto-upgrade guest to user
  func ensureUserRole(caller : Principal) {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#guest) {
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
      case (#user or #admin) { /* Already has sufficient permissions */ };
    };
  };

  // Auth Management
  public shared ({ caller }) func setCredentials(password : Text, salt : Text) : async () {
    // Auto-upgrade guest to user
    ensureUserRole(caller);

    if (password.size() < 10) {
      Runtime.trap("Password too short");
    };
    credentialsMap.add(caller, { hashedPassword = password; salt });
  };

  public query ({ caller }) func getCredentials() : async ?Credentials {
    // Allow all roles including guest to check credentials
    credentialsMap.get(caller);
  };

  public query ({ caller }) func isUsernamePasswordSet() : async Bool {
    // Allow all roles including guest to check if credentials are set
    credentialsMap.containsKey(caller);
  };

  // Merchant Config Management
  public shared ({ caller }) func saveMerchantConfig(merchantId : MerchantId, config : MerchantConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save merchant config");
    };

    merchantConfigs.add(merchantId, config);
  };

  public query ({ caller }) func getMerchantConfig(merchantId : MerchantId) : async MerchantConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view merchant config");
    };

    switch (merchantConfigs.get(merchantId)) {
      case (null) { Runtime.trap("Merchant config not found") };
      case (?config) { config };
    };
  };

  public query ({ caller }) func getAllMerchantConfigs() : async [(MerchantId, MerchantConfig)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view merchant configs");
    };

    merchantConfigs.toArray();
  };

  public shared ({ caller }) func deleteMerchantConfig(merchantId : MerchantId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete merchant config");
    };

    merchantConfigs.remove(merchantId);
  };

  public shared ({ caller }) func resetAdminActivationCode(newActivationCode : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset activation code");
    };

    adminActivationCode := newActivationCode;
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
    // Allow guest to view their own profile (may not exist yet)
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Auto-upgrade guest to user when saving profile
    ensureUserRole(caller);
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
    // Auto-upgrade guest to user when adding to cart
    ensureUserRole(caller);

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
    // Allow guest to view their cart (may be empty)
    switch (cartState.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    // Auto-upgrade guest to user when removing from cart
    ensureUserRole(caller);

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
    // Auto-upgrade guest to user when clearing cart
    ensureUserRole(caller);

    cartState.remove(caller);
  };

  public shared ({ caller }) func checkout() : async () {
    // Auto-upgrade guest to user when checking out
    ensureUserRole(caller);

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
    } else {
      // Allow guest/user to view their own orders
      orders.toArray().filter(func(order) { order.userId == caller });
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
    // Auto-upgrade guest to user when adding rating
    ensureUserRole(caller);

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
    // Auto-upgrade guest to user when adding to wishlist
    ensureUserRole(caller);

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
    // Allow guest to view their wishlist (may be empty)
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
