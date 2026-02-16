import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect } from 'react';
import { guestSession } from '../../utils/guestSession';
import { useAuthSession } from '../../hooks/useAuthSession';

export default function AccountLoginPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuthSession();

  useEffect(() => {
    if (isSignedIn) {
      navigate({ to: '/profile' });
    }
  }, [isSignedIn, navigate]);

  const handleSignUp = () => {
    navigate({ to: '/account/signup' });
  };

  const handleContinueAsGuest = () => {
    guestSession.enable();
    navigate({ to: '/account' });
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new one</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-gold" />
            </div>
            <CardTitle>Account Access</CardTitle>
            <CardDescription>
              Choose how you'd like to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleSignUp} className="w-full" size="lg">
              <UserPlus className="mr-2 h-5 w-5" />
              Sign Up
            </Button>

            <Button onClick={handleContinueAsGuest} variant="outline" className="w-full" size="lg">
              Continue as Guest
            </Button>

            <div className="text-center pt-2">
              <Button variant="link" onClick={() => navigate({ to: '/account' })}>
                Back to Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg">Why Sign In?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Sign Up:</strong> Create a new account with username and password to save your cart, track orders, and manage your wishlist.
            </p>
            <p>
              <strong>Guest Mode:</strong> Browse and shop without signing in, but your data won't be saved permanently.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
