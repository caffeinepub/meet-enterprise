import { useGetWishlist, useGetProducts } from '../hooks/useQueries';
import { useMemo } from 'react';
import ProductCard from '../components/product/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import RequireAuth from '../components/auth/RequireAuth';

export default function WishlistPage() {
  const { data: wishlist = [], isLoading } = useGetWishlist();
  const { data: allProducts = [] } = useGetProducts();
  const navigate = useNavigate();

  const wishlistProducts = useMemo(() => {
    return wishlist.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);
  }, [wishlist, allProducts]);

  return (
    <RequireAuth message="Please sign in to view your wishlist">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wishlist...</p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Save your favorite products here</p>
              <Button onClick={() => navigate({ to: '/catalog' })}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product!.id} product={product!} />
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
