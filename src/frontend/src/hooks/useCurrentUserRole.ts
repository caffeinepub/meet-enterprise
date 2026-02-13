import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole } from '../backend';

export function useCurrentUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      try {
        return await actor.getCallerUserRole();
      } catch {
        return UserRole.guest;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  const role = query.data || UserRole.guest;

  return {
    ...query,
    role,
    isGuest: role === UserRole.guest,
    isUser: role === UserRole.user,
    isAdmin: role === UserRole.admin,
    isLoading: actorFetching || query.isLoading,
  };
}
