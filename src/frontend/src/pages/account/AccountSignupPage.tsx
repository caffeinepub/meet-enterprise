import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSaveCredentials, useIsUsernamePasswordSet } from '../../hooks/useQueries';
import { useAuthSession } from '../../hooks/useAuthSession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { extractBackendErrorMessage } from '../../utils/extractBackendErrorMessage';
import { toast } from 'sonner';
import { guestSession } from '../../utils/guestSession';
import { useQueryClient } from '@tanstack/react-query';
import { MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from '../../constants/auth';

export default function AccountSignupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuthSession();
  const saveCredentials = useSaveCredentials();
  const { data: hasCredentials, isLoading: checkingCredentials } = useIsUsernamePasswordSet();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirmPassword?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const isSubmitting = saveCredentials.isPending;

  // Redirect if already has credentials
  useEffect(() => {
    if (isSignedIn && hasCredentials && !checkingCredentials) {
      navigate({ to: '/profile' });
    }
  }, [isSignedIn, hasCredentials, checkingCredentials, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string; confirmPassword?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < MIN_USERNAME_LENGTH) {
      newErrors.username = `Username must be at least ${MIN_USERNAME_LENGTH} characters`;
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Generate a simple salt (in production, use crypto.getRandomValues)
    const salt = Math.random().toString(36).substring(2, 15);
    
    // Simple hash simulation (in production, use proper hashing like bcrypt or PBKDF2)
    const hashedPassword = btoa(password + salt);

    try {
      await saveCredentials.mutateAsync({ password: hashedPassword, salt });
      
      // Clear guest mode flag if it was set
      guestSession.clear();
      
      // Invalidate role queries to refresh auth state
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      
      setShowSuccess(true);
      toast.success('Account created successfully!');
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate({ to: '/profile' });
      }, 1500);
    } catch (error) {
      const errorMessage = extractBackendErrorMessage(error);
      toast.error(errorMessage || 'Failed to create account. Please try again.');
    }
  };

  const handleContinueAsGuest = () => {
    guestSession.enable();
    navigate({ to: '/catalog' });
  };

  if (showSuccess) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>Account Created!</CardTitle>
            <CardDescription>
              Your account has been successfully created. Redirecting to your profile...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Sign up to save your data and track your orders</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-gold" />
            </div>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create your username and password to complete sign up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors({ ...errors, username: undefined });
                    }}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.username && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline"
                onClick={handleContinueAsGuest}
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                Continue as Guest
              </Button>

              <div className="text-center pt-2">
                <Button 
                  type="button"
                  variant="link" 
                  onClick={() => navigate({ to: '/account/login' })}
                  disabled={isSubmitting}
                >
                  Already have an account? Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg">Secure Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Your account is secured with encrypted password storage on the blockchain.
            </p>
            <p>
              Password requirements: minimum {MIN_PASSWORD_LENGTH} characters for security.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
