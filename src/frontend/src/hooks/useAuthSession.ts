import { useGetCallerUserRole } from './useQueries';
import { guestSession } from '../utils/guestSession';
import { UserRole } from '../backend';

/**
 * Derives in-app "signed-in" state from backend role + guest session override.
 * Returns true if the caller has #user or #admin role (and guest mode is not forced).
 */
export function useAuthSession() {
  const { data: role, isLoading, isFetched } = useGetCallerUserRole();
  const isGuestOverride = guestSession.isActive();

  // If guest mode is explicitly enabled, treat as signed out
  if (isGuestOverride) {
    return {
      isSignedIn: false,
      isLoading,
      isFetched,
      role: UserRole.guest,
    };
  }

  // Otherwise, signed in if role is user or admin
  const isSignedIn = role === UserRole.user || role === UserRole.admin;

  return {
    isSignedIn,
    isLoading,
    isFetched,
    role: role || UserRole.guest,
  };
}
