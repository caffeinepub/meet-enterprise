import { Outlet } from '@tanstack/react-router';
import BrandHeader from './BrandHeader';
import MobileBottomNav from './MobileBottomNav';
import { useCallerUserProfileSafe } from '../../hooks/useCallerUserProfileSafe';
import { useAuthSession } from '../../hooks/useAuthSession';
import ProfileSetupModal from '../profile/ProfileSetupModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { guestSession } from '../../utils/guestSession';
import { useState, useEffect } from 'react';

export default function AppShell() {
  const { isSignedIn } = useAuthSession();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useCallerUserProfileSafe();
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    setIsGuestMode(guestSession.isActive());
  }, []);

  const showProfileSetup = isSignedIn && !profileLoading && isFetched && userProfile === null;
  const showGuestNotice = isGuestMode && !isSignedIn;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BrandHeader />
      {showGuestNotice && (
        <Alert className="mx-4 mt-4 border-gold/20 bg-gold/5 rounded-lg">
          <Info className="h-4 w-4 text-gold" />
          <AlertDescription className="text-sm">
            <span className="font-medium">Browsing as Guest:</span> Sign in to save your cart, orders, and preferences.
          </AlertDescription>
        </Alert>
      )}
      <main className="flex-1 pb-24 md:pb-6 safe-area-bottom">
        <Outlet />
      </main>
      <MobileBottomNav />
      <ProfileSetupModal open={showProfileSetup} />
      <footer className="border-t py-8 px-4 text-center bg-card/50 backdrop-blur-sm mb-16 md:mb-0">
        <p className="text-base text-gold font-semibold">
          © {new Date().getFullYear()} Meet Enterprise. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
