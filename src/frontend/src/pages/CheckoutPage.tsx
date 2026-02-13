import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useGetProducts, useCheckout, useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import RequireAuth from '../components/auth/RequireAuth';
import { ArrowLeft, Check } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart = [] } = useGetCart();
  const { data: allProducts = [] } = useGetProducts();
  const { data: profile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const checkout = useCheckout();

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');

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

  if (cartItems.length === 0) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate({ to: '/catalog' })}>Browse Products</Button>
        </div>
      </RequireAuth>
    );
  }

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Please enter a shipping address');
      return;
    }

    try {
      // Save address to profile
      if (profile) {
        await saveProfile.mutateAsync({
          ...profile,
          address: shippingAddress,
        });
      }

      await checkout.mutateAsync();
      toast.success('Order placed successfully!');
      navigate({ to: '/orders' });
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  return (
    <RequireAuth message="Please sign in to checkout">
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/cart' })} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-gold text-black' : 'bg-muted'}`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Address</span>
          </div>
          <div className="w-12 h-0.5 bg-muted mx-2" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-gold text-black' : 'bg-muted'}`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
          <div className="w-12 h-0.5 bg-muted mx-2" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-gold text-black' : 'bg-muted'}`}>
              3
            </div>
            <span className="text-sm font-medium">Review</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your complete address"
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={() => setStep(2)} disabled={!shippingAddress.trim()}>
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer">UPI</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">Debit/Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Label htmlFor="netbanking" className="flex-1 cursor-pointer">Net Banking</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">Cash on Delivery</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={() => setStep(3)}>Continue to Review</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{shippingAddress}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <p className="text-sm text-muted-foreground capitalize">{paymentMethod.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Order Items ({cartItems.length})</h3>
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span>{item.product!.title} × {Number(item.quantity)}</span>
                          <span>₹{(Number(item.product!.price) * Number(item.quantity)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button onClick={handlePlaceOrder} disabled={checkout.isPending} className="flex-1">
                      {checkout.isPending ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-gold">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
