import { useQuery } from '@tanstack/react-query';
import {
  getRecentOrganizations,
  listOrganizationsWithCounts,
  type OrganizationListRow,
} from '../services/adminService';
import { getOrganization } from '../../../services/organizationService';
import { listGymsByOrganization } from '../../../services/gymService';
import { listInvitesForOrganization } from '../../../services/inviteService';

export function useOrganizationsWithCounts() {
  return useQuery<OrganizationListRow[]>({
    queryKey: ['admin', 'organizations'],
    queryFn: listOrganizationsWithCounts,
    staleTime: 30_000,
  });
}

export function useRecentOrganizations(limit = 5) {
  return useQuery({
    queryKey: ['admin', 'organizations', 'recent', limit],
    queryFn: () => getRecentOrganizations(limit),
    staleTime: 30_000,
  });
}

export function useOrganization(orgId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'organization', orgId],
    queryFn: () => getOrganization(orgId!),
    enabled: Boolean(orgId),
  });
}

export function useOrganizationGyms(orgId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'organization', orgId, 'gyms'],
    queryFn: () => listGymsByOrganization(orgId!),
    enabled: Boolean(orgId),
  });
}

export function useOrganizationInvites(orgId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'organization', orgId, 'invites'],
    queryFn: () => listInvitesForOrganization(orgId!),
    enabled: Boolean(orgId),
  });
}
