import { useAdminActivation } from './useAdminActivation';

/**
 * Alias for useAdminActivation to ensure consistent activation flow.
 * Both hooks now route through the same implementation.
 */
export function useBootstrapAdmin() {
  return useAdminActivation();
}
