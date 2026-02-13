import { useGetCart, useGetProducts, useRemoveFromCart, useClearCart } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import RequireAuth from '../components/auth/RequireAuth';
import { useMemo, useState, useEffect } from 'react';

export default function CartPage() {
  const { data: cart = [] } = useGetCart();
  const { data: allProducts = [] } = useGetProducts();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const navigate = useNavigate();

  const cartItems = useMemo(() => {
    return cart.map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      return { ...item, product };
    }).filter((item) => item.product);
  }, [cart, allProducts]);

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + Number(item.product!.price) * Number(item.quantity);
    }, 0);
  }, [cartItems]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  return (
    <RequireAuth message="Please sign in to view your cart">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some products to get started</p>
              <Button onClick={() => navigate({ to: '/catalog' })}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                return <CartItemCard key={item.productId} item={item} onRemove={handleRemove} isRemoving={removeFromCart.isPending} />;
              })}
              <Button variant="outline" onClick={handleClearCart} disabled={clearCart.isPending}>
                Clear Cart
              </Button>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-gold">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" onClick={() => navigate({ to: '/checkout' })}>
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}

function CartItemCard({ item, onRemove, isRemoving }: { item: any; onRemove: (id: string) => void; isRemoving: boolean }) {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (item.product!.image && item.product!.image.length > 0) {
      const blob = new Blob([new Uint8Array(item.product!.image)], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [item.product]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={item.product!.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{item.product!.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Quantity: {Number(item.quantity)}
            </p>
            <p className="text-lg font-bold text-gold">
              ₹{(Number(item.product!.price) * Number(item.quantity)).toLocaleString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.productId)}
            disabled={isRemoving}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
