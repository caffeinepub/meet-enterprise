import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, Category, Order, CartItem, UserProfile, ProductId, OrderId, CategoryId, UserRole, Credentials, MerchantConfig, MerchantId } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductsByCategory(categoryId: CategoryId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      if (!actor || !categoryId) return [];
      return actor.getProductsByCategory(categoryId);
    },
    enabled: !!actor && !isFetching && !!categoryId,
  });
}

export function useGetProduct(productId: ProductId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor || !productId) return null;
      try {
        return await actor.getProduct(productId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useGetBestSellingProduct() {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['bestSellingProduct'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getBestSellingProduct();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchProducts(searchText: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'search', searchText],
    queryFn: async () => {
      if (!actor || !searchText) return [];
      return actor.searchProducts(searchText);
    },
    enabled: !!actor && !isFetching && searchText.length > 0,
  });
}

export function useGetProductRating(productId: ProductId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['rating', productId],
    queryFn: async () => {
      if (!actor || !productId) return 0;
      const rating = await actor.getProductRating(productId);
      return Number(rating);
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useAddRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, rating }: { productId: ProductId; rating: number }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addRating(productId, BigInt(rating));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rating', variables.productId] });
    },
  });
}

export function useGetCart() {
  const { actor, isFetching } = useActor();

  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCart();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: ProductId; quantity: number }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addToCart(productId, BigInt(quantity));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.checkout();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOrders();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrder(orderId: OrderId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      try {
        return await actor.getOrder(orderId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!orderId,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: OrderId; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

export function useGetWishlist() {
  const { actor, isFetching } = useActor();

  return useQuery<ProductId[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getWishlist();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToWishlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addToWishlist(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addCategory(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      price,
      category,
      size,
      image,
    }: {
      title: string;
      description: string;
      price: number;
      category: CategoryId;
      size: string;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const uploadedImage = await actor.uploadProductImage(image);
      return actor.addProduct(title, description, BigInt(price), category, size, uploadedImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Credentials Management Hooks

export function useSaveCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ password, salt }: { password: string; salt: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setCredentials(password, salt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      queryClient.invalidateQueries({ queryKey: ['isUsernamePasswordSet'] });
    },
  });
}

export function useGetCredentials() {
  const { actor, isFetching } = useActor();

  return useQuery<Credentials | null>({
    queryKey: ['credentials'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCredentials();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsUsernamePasswordSet() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isUsernamePasswordSet'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isUsernamePasswordSet();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Merchant Config Management Hooks

export function useGetMerchantConfig(merchantId: MerchantId) {
  const { actor, isFetching } = useActor();

  return useQuery<MerchantConfig | null>({
    queryKey: ['merchantConfig', merchantId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMerchantConfig(merchantId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!merchantId,
  });
}

export function useGetAllMerchantConfigs() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[MerchantId, MerchantConfig]>>({
    queryKey: ['merchantConfigs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllMerchantConfigs();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveMerchantConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ merchantId, config }: { merchantId: MerchantId; config: MerchantConfig }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveMerchantConfig(merchantId, config);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['merchantConfig', variables.merchantId] });
      queryClient.invalidateQueries({ queryKey: ['merchantConfigs'] });
    },
  });
}

export function useDeleteMerchantConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (merchantId: MerchantId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteMerchantConfig(merchantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantConfigs'] });
    },
  });
}
