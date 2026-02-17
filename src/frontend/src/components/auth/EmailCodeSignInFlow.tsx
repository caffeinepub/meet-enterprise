import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, ArrowLeft, User, MapPin, Phone } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { guestSession } from '../../utils/guestSession';
import { simpleAuthSession } from '../../utils/simpleAuthSession';

type Step = 'email' | 'code' | 'details';

interface UserDetails {
  name: string;
  address: string;
  phone: string;
}

export default function EmailCodeSignInFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    address: '',
    phone: '',
  });

  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [detailsErrors, setDetailsErrors] = useState<Partial<UserDetails>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Generate 4-digit code
  const generateCode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate brief loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate and store code
      const code = generateCode();
      setGeneratedCode(code);
      setEnteredCode('');
      setCodeError('');
      
      // Move to code step
      setStep('code');
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code verification
  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enteredCode.trim()) {
      setCodeError('Please enter the verification code');
      return;
    }

    if (enteredCode !== generatedCode) {
      setCodeError('Incorrect code. Try again.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate brief loading
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCodeError('');
      setStep('details');
    } catch (error) {
      console.error('Error verifying code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = () => {
    const newCode = generateCode();
    setGeneratedCode(newCode);
    setEnteredCode('');
    setCodeError('');
  };

  // Validate user details
  const validateDetails = (): boolean => {
    const errors: Partial<UserDetails> = {};
    
    if (!userDetails.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!userDetails.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!userDetails.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(userDetails.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setDetailsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle final sign-in
  const handleCompleteSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDetails()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate brief loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear any guest session
      guestSession.clear();
      
      // Set session-based auth with email
      simpleAuthSession.setAuthMethod('email', email);
      
      // Store user details in session (for demo purposes)
      sessionStorage.setItem('user_details', JSON.stringify({
        email,
        ...userDetails,
      }));
      
      // Invalidate queries to fetch fresh data
      queryClient.invalidateQueries();
      
      // Navigate to profile
      navigate({ to: '/profile' });
    } catch (error) {
      console.error('Sign-in completion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to email
  const handleBackToEmail = () => {
    setStep('email');
    setGeneratedCode('');
    setEnteredCode('');
    setCodeError('');
  };

  return (
    <div className="w-full">
      {/* Step 1: Email Entry */}
      {step === 'email' && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Sign In with Email</CardTitle>
            <CardDescription>
              Enter your email to receive a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  disabled={isLoading}
                  className={emailError ? 'border-destructive' : ''}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Code Verification */}
      {step === 'code' && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              Enter the 4-digit code sent to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display simulated code */}
            <Alert>
              <AlertDescription className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Your verification code (simulated):
                </p>
                <p className="text-3xl font-bold tracking-wider text-primary">
                  {generatedCode}
                </p>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleCodeVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 4-digit code"
                  value={enteredCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setEnteredCode(value);
                    setCodeError('');
                  }}
                  disabled={isLoading}
                  maxLength={4}
                  className={`text-center text-2xl tracking-widest ${codeError ? 'border-destructive' : ''}`}
                />
                {codeError && (
                  <p className="text-sm text-destructive text-center">{codeError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit"
                  className="flex-1" 
                  disabled={isLoading || enteredCode.length !== 4}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Resend Code
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: User Details */}
      {step === 'details' && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Tell us a bit about yourself to complete sign-in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompleteSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={userDetails.name}
                    onChange={(e) => {
                      setUserDetails({ ...userDetails, name: e.target.value });
                      setDetailsErrors({ ...detailsErrors, name: undefined });
                    }}
                    disabled={isLoading}
                    className={`pl-10 ${detailsErrors.name ? 'border-destructive' : ''}`}
                  />
                </div>
                {detailsErrors.name && (
                  <p className="text-sm text-destructive">{detailsErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main St, City, Country"
                    value={userDetails.address}
                    onChange={(e) => {
                      setUserDetails({ ...userDetails, address: e.target.value });
                      setDetailsErrors({ ...detailsErrors, address: undefined });
                    }}
                    disabled={isLoading}
                    className={`pl-10 ${detailsErrors.address ? 'border-destructive' : ''}`}
                  />
                </div>
                {detailsErrors.address && (
                  <p className="text-sm text-destructive">{detailsErrors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={userDetails.phone}
                    onChange={(e) => {
                      setUserDetails({ ...userDetails, phone: e.target.value });
                      setDetailsErrors({ ...detailsErrors, phone: undefined });
                    }}
                    disabled={isLoading}
                    className={`pl-10 ${detailsErrors.phone ? 'border-destructive' : ''}`}
                  />
                </div>
                {detailsErrors.phone && (
                  <p className="text-sm text-destructive">{detailsErrors.phone}</p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Completing Sign-In...
                  </>
                ) : (
                  'Complete Sign-In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
