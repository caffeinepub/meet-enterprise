import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
    email: string;
    address: string;
    phone: string;
}
export interface Category {
    id: CategoryId;
    name: string;
}
export type Time = bigint;
export interface Order {
    id: OrderId;
    status: string;
    total: bigint;
    userId: UserId;
    createdAt: Time;
    items: Array<CartItem>;
}
export type UserId = Principal;
export type ProductPic = Uint8Array;
export type CategoryId = string;
export type ProductId = string;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
}
export interface Product {
    id: ProductId;
    title: string;
    description: string;
    stock: bigint;
    category: CategoryId;
    image: ProductPic;
    price: bigint;
}
export type OrderId = string;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string): Promise<void>;
    addProduct(title: string, description: string, price: bigint, category: CategoryId, stock: bigint, image: ProductPic): Promise<ProductId>;
    addRating(productId: ProductId, rating: bigint): Promise<void>;
    addToCart(productId: ProductId, quantity: bigint): Promise<void>;
    addToWishlist(productId: ProductId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bootstrapAdmin(activationCode: bigint): Promise<void>;
    checkout(): Promise<void>;
    /**
     * / New function to completely clear the admin activation and force a new activation flow!
     */
    clearAdminActivation(): Promise<void>;
    clearCart(): Promise<void>;
    getBestSellingProduct(): Promise<Product | null>;
    /**
     * / Utility - helpful for debugging, support tickets, and troubleshooting permission lags after upgrades.
     */
    getCallerPrincipal(): Promise<Principal>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCategories(): Promise<Array<Category>>;
    getOrder(orderId: OrderId): Promise<Order | null>;
    getOrders(): Promise<Array<Order>>;
    getProduct(productId: ProductId): Promise<Product>;
    getProductRating(productId: ProductId): Promise<bigint>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(categoryId: CategoryId): Promise<Array<Product>>;
    getProductsFilteredByPrice(minPrice: bigint, maxPrice: bigint): Promise<Array<Product>>;
    getProductsSortedByPrice(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWishlist(): Promise<Array<ProductId>>;
    isCallerAdmin(): Promise<boolean>;
    removeFromCart(productId: ProductId): Promise<void>;
    /**
     * / Allows admin to reset activation code for future processing, but keeps it 1-time only.
     */
    resetAdminActivationCode(newActivationCode: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchText: string): Promise<Array<Product>>;
    seedStore(): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: string): Promise<void>;
    uploadProductImage(image: ExternalBlob): Promise<ProductPic>;
}
