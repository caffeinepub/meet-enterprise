/**
 * Simple session-based authentication state management.
 * Stores auth method (google/phone) in sessionStorage for the browser session.
 * Frontend-only implementation without real OAuth or OTP.
 */

const AUTH_METHOD_KEY = 'simple_auth_method';
const AUTH_PHONE_KEY = 'simple_auth_phone';

export type AuthMethod = 'google' | 'phone';

export const simpleAuthSession = {
  /**
   * Set the authentication method and mark user as signed in
   */
  setAuthMethod(method: AuthMethod, phone?: string): void {
    sessionStorage.setItem(AUTH_METHOD_KEY, method);
    if (method === 'phone' && phone) {
      sessionStorage.setItem(AUTH_PHONE_KEY, phone);
    }
  },

  /**
   * Get the current authentication method
   */
  getAuthMethod(): AuthMethod | null {
    const method = sessionStorage.getItem(AUTH_METHOD_KEY);
    return method as AuthMethod | null;
  },

  /**
   * Get the stored phone number (if signed in with phone)
   */
  getPhone(): string | null {
    return sessionStorage.getItem(AUTH_PHONE_KEY);
  },

  /**
   * Check if user is signed in with session-based auth
   */
  isSignedIn(): boolean {
    return !!this.getAuthMethod();
  },

  /**
   * Sign out: clear all session-based auth state
   */
  signOut(): void {
    sessionStorage.removeItem(AUTH_METHOD_KEY);
    sessionStorage.removeItem(AUTH_PHONE_KEY);
  },

  /**
   * Clear all auth data (alias for signOut)
   */
  clear(): void {
    this.signOut();
  },
};
