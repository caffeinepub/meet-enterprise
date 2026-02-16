import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuthSession } from './useAuthSession';
import type { UserProfile } from '../backend';

/**
 * Safe profile query hook that only attempts getCallerUserProfile()
 * when backend-derived session indicates a user/admin (and not guest override).
 */
export function useCallerUserProfileSafe() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isSignedIn } = useAuthSession();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && isSignedIn,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
