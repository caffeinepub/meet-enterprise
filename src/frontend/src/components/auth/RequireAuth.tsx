import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  message?: string;
}

export default function RequireAuth({ children, message }: RequireAuthProps) {
  const { identity, login, loginStatus } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-gold" />
            </div>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription className="space-y-2">
              <p>{message || 'You need to sign in to access this feature'}</p>
              <p className="text-xs mt-3 pt-3 border-t text-muted-foreground">
                Internet Identity does not use email or password. Click below to sign in securely.
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              className="w-full"
              size="lg"
            >
              {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In with Internet Identity'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
