import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { User, LogIn, UserCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AccountPage() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Account</h1>
          <p className="text-muted-foreground">Manage your Meet Enterprise account</p>
        </div>

        {!isAuthenticated && (
          <Alert className="border-gold/20 bg-gold/5">
            <Info className="h-4 w-4 text-gold" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-medium text-foreground">How to sign in:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Internet Identity does NOT use email or password</li>
                <li>Click "Sign In" below to authenticate securely</li>
                <li>You'll be redirected to Internet Identity's secure login</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              {isAuthenticated ? (
                <UserCircle className="h-8 w-8 text-gold" />
              ) : (
                <User className="h-8 w-8 text-gold" />
              )}
            </div>
            <CardTitle>{isAuthenticated ? 'Signed In' : 'Sign In Required'}</CardTitle>
            <CardDescription>
              {isAuthenticated
                ? 'You are currently signed in with Internet Identity'
                : 'Sign in to access your profile, orders, and wishlist'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated ? (
              <>
                <Button onClick={() => navigate({ to: '/profile' })} className="w-full" size="lg">
                  <UserCircle className="mr-2 h-5 w-5" />
                  View Profile
                </Button>
                <Button onClick={handleAuth} variant="outline" className="w-full" size="lg">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={handleAuth} disabled={isLoggingIn} className="w-full" size="lg">
                <LogIn className="mr-2 h-5 w-5" />
                {isLoggingIn ? 'Signing In...' : 'Sign In with Internet Identity'}
              </Button>
            )}
          </CardContent>
        </Card>

        {isAuthenticated && (
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
