import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct, useGetProductRating, useAddToCart, useAddToWishlist, useAddRating } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { useState } from 'react';
import RequireAuth from '../components/auth/RequireAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: product, isLoading } = useGetProduct(productId);
  const { data: rating = 0 } = useGetProductRating(productId);
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const addRatingMutation = useAddRating();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedRating, setSelectedRating] = useState<string>('5');

  useState(() => {
    if (product?.image && product.image.length > 0) {
      const blob = new Blob([new Uint8Array(product.image)], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button onClick={() => navigate({ to: '/catalog' })}>Browse Catalog</Button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity });
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!identity) {
      toast.error('Please sign in to purchase');
      return;
    }
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity });
      navigate({ to: '/checkout' });
    } catch (error) {
      toast.error('Failed to proceed to checkout');
    }
  };

  const handleAddToWishlist = async () => {
    if (!identity) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }
    try {
      await addToWishlist.mutateAsync(product.id);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const handleSubmitRating = async () => {
    try {
      await addRatingMutation.mutateAsync({ productId: product.id, rating: parseInt(selectedRating) });
      toast.success('Rating submitted successfully');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const inStock = Number(product.stock) > 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/catalog' })} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            {imageUrl ? (
              <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image Available
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <span className="font-medium">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className={inStock ? 'text-green-600' : 'text-destructive'}>
                {inStock ? `${Number(product.stock)} in stock` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div>
            <p className="text-4xl font-bold text-gold">₹{Number(product.price).toLocaleString()}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="px-4 font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.min(Number(product.stock), quantity + 1))}
                disabled={!inStock}
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 gap-2"
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock || addToCart.isPending}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleAddToWishlist}
              disabled={addToWishlist.isPending}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleBuyNow}
            disabled={!inStock}
          >
            Buy Now
          </Button>

          {/* Rating Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Customer Reviews</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Write a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rate this product</DialogTitle>
                    </DialogHeader>
                    <RequireAuth message="Please sign in to submit a review">
                      <div className="space-y-4">
                        <div>
                          <Label>Your Rating</Label>
                          <RadioGroup value={selectedRating} onValueChange={setSelectedRating} className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((r) => (
                              <div key={r} className="flex items-center space-x-2">
                                <RadioGroupItem value={r.toString()} id={`rating-${r}`} />
                                <Label htmlFor={`rating-${r}`} className="flex items-center gap-1 cursor-pointer">
                                  {r} <Star className="h-4 w-4 fill-gold text-gold" />
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                        <Button onClick={handleSubmitRating} disabled={addRatingMutation.isPending} className="w-full">
                          {addRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
                        </Button>
                      </div>
                    </RequireAuth>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= rating ? 'fill-gold text-gold' : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {rating > 0 ? `${rating.toFixed(1)} out of 5` : 'No reviews yet'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
