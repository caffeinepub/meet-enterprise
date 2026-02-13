import { Outlet } from '@tanstack/react-router';
import BrandHeader from './BrandHeader';
import MobileBottomNav from './MobileBottomNav';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import ProfileSetupModal from '../profile/ProfileSetupModal';

export default function AppShell() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BrandHeader />
      <main className="flex-1 pb-24 md:pb-6 safe-area-bottom">
        <Outlet />
      </main>
      <MobileBottomNav />
      <ProfileSetupModal open={showProfileSetup} />
      <footer className="border-t py-6 px-4 text-center text-sm text-gold font-medium">
        <p>© {new Date().getFullYear()} Meet Enterprise. All rights reserved.</p>
      </footer>
    </div>
  );
}
