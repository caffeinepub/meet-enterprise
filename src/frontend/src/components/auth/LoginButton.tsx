import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { guestSession } from '../../utils/guestSession';
import { simpleAuthSession } from '../../utils/simpleAuthSession';
import { useNavigate } from '@tanstack/react-router';
import { useAuthSession } from '../../hooks/useAuthSession';

export default function LoginButton() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isSignedIn } = useAuthSession();

  const handleAuth = async () => {
    if (isSignedIn) {
      // Sign out: clear all data and navigate home
      queryClient.clear();
      guestSession.clear();
      simpleAuthSession.signOut();
      navigate({ to: '/' });
    } else {
      // Sign in: navigate to login page
      navigate({ to: '/account/login' });
    }
  };

  return (
    <Button
      onClick={handleAuth}
      variant={isSignedIn ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
    >
      {isSignedIn ? (
        <>
          <LogOut className="h-4 w-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Sign In
        </>
      )}
    </Button>
  );
}
