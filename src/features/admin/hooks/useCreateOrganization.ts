import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOrganizationBundle,
  type CreateOrganizationInput,
  type CreateOrganizationResult,
} from '../services/adminService';

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation<CreateOrganizationResult, Error, CreateOrganizationInput>({
    mutationFn: createOrganizationBundle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
    },
  });
}
