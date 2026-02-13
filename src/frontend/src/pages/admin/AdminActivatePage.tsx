import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';

export default function AdminActivatePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to admin dashboard after a brief moment
    const timer = setTimeout(() => {
      navigate({ to: '/admin' });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-gold" />
            </div>
            <CardTitle className="text-2xl">Admin Panel Access</CardTitle>
            <CardDescription>
              The admin panel is now open and accessible to all users.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              You will be redirected to the admin dashboard automatically.
            </p>
            <Button onClick={() => navigate({ to: '/admin' })} className="w-full">
              Go to Admin Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
