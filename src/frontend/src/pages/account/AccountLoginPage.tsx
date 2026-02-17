import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { guestSession } from '../../utils/guestSession';
import { isInAppBrowser } from '../../utils/detectInAppBrowser';
import InAppBrowserBlocker from '../../components/auth/InAppBrowserBlocker';
import EmailCodeSignInFlow from '../../components/auth/EmailCodeSignInFlow';

export default function AccountLoginPage() {
  const navigate = useNavigate();

  // Check if in-app browser
  const isInApp = isInAppBrowser();

  // Show in-app browser blocker if detected
  if (isInApp) {
    return <InAppBrowserBlocker />;
  }

  const handleContinueAsGuest = () => {
    guestSession.enable();
    navigate({ to: '/catalog' });
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-muted-foreground">Access your Meet Enterprise account</p>
        </div>

        {/* Email-based sign-in flow */}
        <EmailCodeSignInFlow />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Guest Mode */}
        <Card className="border-muted">
          <CardContent className="pt-6">
            <Button 
              onClick={handleContinueAsGuest} 
              variant="ghost" 
              className="w-full" 
              size="lg"
            >
              Continue as Guest
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Guest mode allows browsing without an account
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg">Secure Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Sign in with your email address. We'll send you a verification code to ensure it's really you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
