import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { Package, ShoppingCart, Users, BarChart3, MessageCircle, CreditCard } from 'lucide-react';
import AdminGuard from '../../components/admin/AdminGuard';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const sections = [
    { icon: Package, title: 'Products', description: 'Manage your product catalog', path: '/admin/products' },
    { icon: ShoppingCart, title: 'Orders', description: 'View and manage orders', path: '/admin/orders' },
    { icon: Users, title: 'Customers', description: 'View customer information', path: '/admin/customers' },
    { icon: BarChart3, title: 'Analytics', description: 'Sales reports and insights', path: '/admin/analytics' },
    { icon: MessageCircle, title: 'Support', description: 'Manage support tickets', path: '/admin/support' },
    { icon: CreditCard, title: 'UPI Configuration', description: 'Configure UPI payment settings', path: '/admin/upi' },
  ];

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.path} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: section.path })}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-gold" />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminGuard>
  );
}
