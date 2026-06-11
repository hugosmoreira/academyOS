import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInviteForUser,
  deactivateGymMembership,
  deactivateOrgMembership,
  getAdminUserDetail,
  listAdminUsers,
  sendPasswordResetForUser,
  setProfileStatus,
  type CreateInviteForUserInput,
} from '../../../services/adminUserService';
import {
  assignGymMember,
  assignOrgMember,
  setPlatformMember,
} from '../../../services/roleService';
import type { GymRoleKey, OrganizationRoleKey, PlatformRoleKey, ProfileStatus } from '../../../types/database';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => listAdminUsers(),
    staleTime: 30_000,
  });
}

export function useAdminUserDetail(profileId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'user', profileId],
    queryFn: () => getAdminUserDetail(profileId!),
    enabled: Boolean(profileId),
  });
}

export function useAssignOrgMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      organizationId: string;
      profileId: string;
      roleKey: OrganizationRoleKey;
    }) => assignOrgMember(input.organizationId, input.profileId, input.roleKey),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.profileId] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'organization', vars.organizationId, 'members'],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAssignGymMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { gymId: string; profileId: string; roleKey: GymRoleKey }) =>
      assignGymMember(input.gymId, input.profileId, input.roleKey),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.profileId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'gym', vars.gymId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useSetPlatformMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { profileId: string; roleKey: PlatformRoleKey; status?: 'active' | 'inactive' | 'suspended' }) =>
      setPlatformMember(input.profileId, input.roleKey, input.status ?? 'active'),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.profileId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useSetProfileStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { profileId: string; status: ProfileStatus }) =>
      setProfileStatus(input.profileId, input.status),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.profileId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useSendPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => sendPasswordResetForUser(email),
  });
}

export function useDeactivateOrgMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => deactivateOrgMembership(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useDeactivateGymMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => deactivateGymMembership(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useCreateInviteForUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInviteForUserInput) => createInviteForUser(input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'organization', vars.organizationId, 'invites'],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
