import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { LogIn, Info, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';

export default function AccountLoginPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/profile' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-muted-foreground">Secure authentication with Internet Identity</p>
        </div>

        <Alert className="border-gold/20 bg-gold/5">
          <Info className="h-4 w-4 text-gold" />
          <AlertDescription className="text-sm space-y-3">
            <p className="font-medium text-foreground">Important: Internet Identity Authentication</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Internet Identity does NOT use email addresses or passwords</li>
              <li>It uses secure cryptographic authentication</li>
              <li>Click "Sign In" below to start the secure login process</li>
              <li>You will be redirected to Internet Identity's authentication page</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-gold" />
            </div>
            <CardTitle>Secure Sign In</CardTitle>
            <CardDescription>
              Sign in with Internet Identity to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full" size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              {isLoggingIn ? 'Signing In...' : 'Sign In with Internet Identity'}
            </Button>
            <div className="text-center">
              <Button variant="link" onClick={() => navigate({ to: '/account' })}>
                Back to Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg">What is Internet Identity?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Internet Identity is a secure, privacy-preserving authentication system built on the Internet Computer blockchain.
            </p>
            <p>
              It allows you to sign in without passwords, using biometric authentication or security keys on your device.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
