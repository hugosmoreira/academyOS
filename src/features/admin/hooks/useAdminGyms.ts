import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  countGymStudents,
  getGym,
  listAllGymsWithContext,
  listGymMembers,
  updateGym,
  type GymUpdate,
} from '../../../services/adminGymService';

export function useAllGymsWithContext() {
  return useQuery({
    queryKey: ['admin', 'all-gyms'],
    queryFn: listAllGymsWithContext,
    staleTime: 30_000,
  });
}

export function useAdminGym(gymId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'gym', gymId],
    queryFn: () => getGym(gymId!),
    enabled: Boolean(gymId),
  });
}

export function useGymMembers(gymId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'gym', gymId, 'members'],
    queryFn: () => listGymMembers(gymId!),
    enabled: Boolean(gymId),
  });
}

export function useGymStudentCount(gymId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'gym', gymId, 'student-count'],
    queryFn: () => countGymStudents(gymId!),
    enabled: Boolean(gymId),
  });
}

export function useUpdateGym() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; patch: GymUpdate }) => updateGym(input.id, input.patch),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gym', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-gyms'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'organization'] });
    },
  });
}
