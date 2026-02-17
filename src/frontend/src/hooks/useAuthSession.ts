import { useGetCallerUserRole } from './useQueries';
import { guestSession } from '../utils/guestSession';
import { simpleAuthSession } from '../utils/simpleAuthSession';
import { UserRole } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * Derives in-app "signed-in" state from session-based auth or Internet Identity.
 * Returns true if the user has signed in via Google/phone session OR Internet Identity.
 * Backend will auto-upgrade guest roles to user on first action.
 */
export function useAuthSession() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: role, isLoading: roleLoading, isFetched } = useGetCallerUserRole();
  const isGuestOverride = guestSession.isActive();

  // If guest mode is explicitly enabled, treat as signed out
  if (isGuestOverride) {
    return {
      isSignedIn: false,
      isLoading: isInitializing || roleLoading,
      isFetched,
      role: UserRole.guest,
    };
  }

  // Check session-based auth first
  const hasSessionAuth = simpleAuthSession.isSignedIn();
  
  // Also check Internet Identity authentication (non-anonymous)
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  
  // Signed in if either session auth OR Internet Identity is active
  return {
    isSignedIn: hasSessionAuth || isAuthenticated,
    isLoading: isInitializing || roleLoading,
    isFetched,
    role: role || UserRole.guest,
  };
}
