import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, Info } from 'lucide-react';
import { guestSession } from '../../utils/guestSession';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthSession } from '../../hooks/useAuthSession';

interface RequireAuthProps {
  children: React.ReactNode;
  message?: string;
}

export default function RequireAuth({ children, message }: RequireAuthProps) {
  const navigate = useNavigate();
  const { isSignedIn } = useAuthSession();
  const [isGuestMode, setIsGuestMode] = useState(guestSession.isActive());

  useEffect(() => {
    setIsGuestMode(guestSession.isActive());
  }, []);

  const handleContinueAsGuest = () => {
    guestSession.enable();
    setIsGuestMode(true);
  };

  const handleSignIn = () => {
    navigate({ to: '/account/signup' });
  };

  // Allow access if signed in or in guest mode
  if (isSignedIn || isGuestMode) {
    return (
      <>
        {isGuestMode && !isSignedIn && (
          <Alert className="mx-4 mt-4 border-gold/20 bg-gold/5">
            <Info className="h-4 w-4 text-gold" />
            <AlertDescription className="text-sm">
              <span className="font-medium">Guest Mode:</span> Some features may require signing in to save your data.
            </AlertDescription>
          </Alert>
        )}
        {children}
      </>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-gold" />
          </div>
          <CardTitle>Sign In or Continue as Guest</CardTitle>
          <CardDescription>
            {message || 'Choose how you want to proceed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleSignIn}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
          <Button
            onClick={handleContinueAsGuest}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Continue as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
