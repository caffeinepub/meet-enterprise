import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { UserCircle } from 'lucide-react';
import { guestSession } from '../../utils/guestSession';
import { useAuthSession } from '../../hooks/useAuthSession';
import { useQueryClient } from '@tanstack/react-query';

export default function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuthSession();

  const handleSignOut = async () => {
    // Clear all cached data
    queryClient.clear();
    // Clear guest session
    guestSession.clear();
    // Navigate to home
    navigate({ to: '/' });
  };

  const handleSignIn = () => {
    navigate({ to: '/account/signup' });
  };

  const handleContinueAsGuest = () => {
    guestSession.enable();
    navigate({ to: '/catalog' });
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Account</h1>
          <p className="text-muted-foreground">Manage your Meet Enterprise account</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-gold" />
            </div>
            <CardTitle>{isSignedIn ? 'Signed In' : 'Sign In'}</CardTitle>
            <CardDescription>
              {isSignedIn
                ? 'You are currently signed in'
                : 'Sign in to access your profile, orders, and wishlist'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isSignedIn ? (
              <>
                <Button onClick={() => navigate({ to: '/profile' })} className="w-full" size="lg">
                  <UserCircle className="mr-2 h-5 w-5" />
                  View Profile
                </Button>
                <Button onClick={handleSignOut} variant="outline" className="w-full" size="lg">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSignIn} className="w-full" size="lg">
                  Sign In
                </Button>
                <Button onClick={handleContinueAsGuest} variant="outline" className="w-full" size="lg">
                  Continue as Guest
                </Button>
                <p className="text-xs text-center text-muted-foreground pt-2">
                  Guest mode allows browsing without an account
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {isSignedIn && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="cursor-pointer hover:border-gold/50 transition-colors" onClick={() => navigate({ to: '/orders' })}>
              <CardHeader>
                <CardTitle className="text-lg">Orders</CardTitle>
                <CardDescription>View your order history</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:border-gold/50 transition-colors" onClick={() => navigate({ to: '/wishlist' })}>
              <CardHeader>
                <CardTitle className="text-lg">Wishlist</CardTitle>
                <CardDescription>View saved items</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
