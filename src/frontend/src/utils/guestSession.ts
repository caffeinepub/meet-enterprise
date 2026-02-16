/**
 * Guest session management using sessionStorage
 * Allows users to browse without authentication
 */

const GUEST_MODE_KEY = 'meet_enterprise_guest_mode';

export const guestSession = {
  /**
   * Check if guest mode is active
   */
  isActive(): boolean {
    return sessionStorage.getItem(GUEST_MODE_KEY) === 'true';
  },

  /**
   * Enable guest mode for the current session
   */
  enable(): void {
    sessionStorage.setItem(GUEST_MODE_KEY, 'true');
  },

  /**
   * Clear guest mode
   */
  clear(): void {
    sessionStorage.removeItem(GUEST_MODE_KEY);
  },
};
