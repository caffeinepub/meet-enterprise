import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Mail } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import { guestSession } from '../../utils/guestSession';
import { simpleAuthSession } from '../../utils/simpleAuthSession';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isInAppBrowser } from '../../utils/detectInAppBrowser';
import InAppBrowserBlocker from '../../components/auth/InAppBrowserBlocker';

export default function AccountLoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if in-app browser
  const isInApp = isInAppBrowser();

  // Show in-app browser blocker if detected
  if (isInApp) {
    return <InAppBrowserBlocker />;
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Simulate brief loading for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear any guest session
      guestSession.clear();
      
      // Set session-based auth
      simpleAuthSession.setAuthMethod('google');
      
      // Invalidate queries to fetch fresh data
      queryClient.invalidateQueries();
      
      // Navigate to profile
      navigate({ to: '/profile' });
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate brief loading for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear any guest session
      guestSession.clear();
      
      // Set session-based auth with phone
      simpleAuthSession.setAuthMethod('phone', phoneNumber);
      
      // Invalidate queries to fetch fresh data
      queryClient.invalidateQueries();
      
      // Navigate to profile
      navigate({ to: '/profile' });
    } catch (error) {
      console.error('Phone sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign-In */}
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full" 
              size="lg"
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <SiGoogle className="mr-2 h-5 w-5" />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Phone Sign-In */}
            <form onSubmit={handlePhoneSignIn} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button 
                type="submit"
                className="w-full" 
                size="lg"
                disabled={isLoading || !phoneNumber.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Continue with Phone
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Guest Mode */}
            <Button 
              onClick={handleContinueAsGuest} 
              variant="ghost" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              Continue as Guest
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              Guest mode allows browsing without an account
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg">Quick & Easy Sign-In</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Sign in with Google or your phone number to access your profile, save orders, and track your purchases.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
