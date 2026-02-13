import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAdminActivation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activationCode: string) => {
      if (!actor) {
        throw new Error('Backend connection unavailable. Please ensure you are logged in and try again.');
      }
      
      // Parse and validate the activation code
      const codeValue = activationCode.trim();
      if (!/^\d{4}$/.test(codeValue)) {
        throw new Error('Activation code must be exactly 4 digits');
      }
      
      const codeBigInt = BigInt(codeValue);
      await actor.bootstrapAdmin(codeBigInt);
    },
    onSuccess: async () => {
      // Invalidate and refetch all role-related queries to refresh admin access state
      await queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      await queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      await queryClient.refetchQueries({ queryKey: ['currentUserRole'] });
      await queryClient.refetchQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}
