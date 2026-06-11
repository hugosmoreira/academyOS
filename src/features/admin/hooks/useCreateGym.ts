import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createGymBundle,
  type CreateGymInput,
  type CreateGymResult,
} from '../services/adminService';

export function useCreateGym() {
  const queryClient = useQueryClient();
  return useMutation<CreateGymResult, Error, CreateGymInput>({
    mutationFn: createGymBundle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'gyms'] });
    },
  });
}
