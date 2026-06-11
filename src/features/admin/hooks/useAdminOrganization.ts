import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listOrganizationAuditLog,
  listOrganizationMembers,
  updateOrganization,
} from '../../../services/adminOrganizationService';
import type { OrganizationUpdate } from '../../../services/organizationService';

export function useOrganizationMembers(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'organization', organizationId, 'members'],
    queryFn: () => listOrganizationMembers(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useOrganizationAuditLog(organizationId: string | undefined, limit = 25) {
  return useQuery({
    queryKey: ['admin', 'organization', organizationId, 'audit-log', limit],
    queryFn: () => listOrganizationAuditLog(organizationId!, limit),
    enabled: Boolean(organizationId),
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; patch: OrganizationUpdate }) =>
      updateOrganization(input.id, input.patch),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organization', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
    },
  });
}
