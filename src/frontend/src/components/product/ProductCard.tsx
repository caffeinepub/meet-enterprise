import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Product } from '../../backend';
import { useAddToCart, useAddToWishlist, useGetProductRating } from '../../hooks/useQueries';
import { useAuthSession } from '../../hooks/useAuthSession';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { isSignedIn } = useAuthSession();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const { data: rating = 0 } = useGetProductRating(product.id);
  const [imageUrl, setImageUrl] = useState<string>('');

  useState(() => {
    if (product.image && product.image.length > 0) {
      const blob = new Blob([new Uint8Array(product.image)], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSignedIn) {
      toast.error('Please sign in to add items to cart');
      navigate({ to: '/account/signup' });
      return;
    }
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSignedIn) {
      toast.error('Please sign in to add items to wishlist');
      navigate({ to: '/account/signup' });
      return;
    }
    try {
      await addToWishlist.mutateAsync(product.id);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
      onClick={() => navigate({ to: '/product/$productId', params: { productId: product.id } })}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleAddToWishlist}
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold line-clamp-2 mb-2">{product.title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
        </div>
        <p className="text-2xl font-bold text-gold">₹{Number(product.price).toLocaleString()}</p>
        {product.size && (
          <p className="text-sm text-muted-foreground mt-1">Size: {product.size}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gap-2"
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
