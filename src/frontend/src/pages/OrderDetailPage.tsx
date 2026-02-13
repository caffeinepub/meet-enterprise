import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder, useGetProducts } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Check } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);
  const { data: allProducts = [] } = useGetProducts();

  const orderItems = useMemo(() => {
    if (!order) return [];
    return order.items.map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      return { ...item, product };
    }).filter((item) => item.product);
  }, [order, allProducts]);

  const statusSteps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
  const currentStepIndex = order ? statusSteps.indexOf(order.status.toLowerCase()) : 0;

  const handleDownloadInvoice = () => {
    if (!order) return;
    
    const invoiceContent = `
MEET ENTERPRISE
Invoice

Order ID: ${order.id}
Date: ${new Date(Number(order.createdAt) / 1000000).toLocaleDateString()}

Items:
${orderItems.map((item) => `${item.product!.title} x ${Number(item.quantity)} - ₹${(Number(item.product!.price) * Number(item.quantity)).toLocaleString()}`).join('\n')}

Total: ₹${Number(order.total).toLocaleString()}
Status: ${order.status}

Thank you for shopping with Meet Enterprise!
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order...</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (!order) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Button onClick={() => navigate({ to: '/orders' })}>View All Orders</Button>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/orders' })} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <Button variant="outline" onClick={handleDownloadInvoice} className="gap-2">
            <Download className="h-4 w-4" />
            Download Invoice
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusSteps.map((status, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={status} className="flex items-start gap-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${isCompleted ? 'bg-gold text-black' : 'bg-muted'}`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium capitalize ${isCurrent ? 'text-gold' : ''}`}>{status}</p>
                          {isCurrent && <p className="text-sm text-muted-foreground">Current status</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <OrderItemCard key={item.productId} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{new Date(Number(order.createdAt) / 1000000).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{order.status}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-gold">₹{Number(order.total).toLocaleString()}</span>
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

function OrderItemCard({ item }: { item: any }) {
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
    <div className="flex gap-4 pb-4 border-b last:border-0">
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
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
        <p className="text-sm text-muted-foreground">Quantity: {Number(item.quantity)}</p>
        <p className="text-lg font-bold text-gold mt-1">
          ₹{(Number(item.product!.price) * Number(item.quantity)).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
