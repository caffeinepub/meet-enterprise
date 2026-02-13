import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@dfinity/principal';

export function useGetCallerPrincipal() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Principal | null>({
    queryKey: ['callerPrincipal'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerPrincipal();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}
