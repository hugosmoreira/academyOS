import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './AuthProvider';
import {
  countParentLinks,
  countStudentLinks,
  getProfile,
  type Profile,
} from '../../services/profileService';
import {
  getAccessibleGyms,
  getGymMemberships,
  getOrganizationMemberships,
  type GymMembership,
  type OrganizationMembership,
} from '../tenancy/tenancy.service';
import {
  resolvePrimaryRole,
  type PrimaryRole,
  type RoleZone,
} from './roles';
import {
  homeRouteForRoles,
  zoneForRoles,
  type EffectiveRoles,
} from '../../services/authRoutingService';
import type { PlatformRoleKey, OrganizationRoleKey, GymRoleKey } from '../../types/database';

type ProfileContextValue = {
  profile: Profile | null;
  organizationMemberships: OrganizationMembership[];
  gymMemberships: GymMembership[];
  /** Direct gym memberships plus org-wide access gyms (owner/admin orgs). */
  accessibleGyms: GymMembership[];
  primaryRole: PrimaryRole;
  zone: RoleZone;
  homeRoute: string;
  loading: boolean;
  refetch: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const EMPTY_MEMBERSHIPS: OrganizationMembership[] = [];
const EMPTY_GYMS: GymMembership[] = [];

function buildEffectiveRoles(
  profile: Profile | null,
  organizationMemberships: OrganizationMembership[],
  gymMemberships: GymMembership[],
  studentLinkCount: number,
  parentLinkCount: number,
): EffectiveRoles {
  const platformRoles: PlatformRoleKey[] = [];
  if (profile?.platform_role === 'platform_super_admin' || profile?.platform_role === 'platform_admin') {
    platformRoles.push(profile.platform_role);
  } else if (profile?.platform_role === 'sales_admin' || profile?.platform_role === 'support_admin') {
    platformRoles.push(profile.platform_role);
  }

  return {
    platformRoles,
    organizationRoles: organizationMemberships.map((m) => ({
      organizationId: m.organization.id,
      roleKey: m.roleKey as OrganizationRoleKey,
    })),
    gymRoles: gymMemberships.map((m) => ({
      gymId: m.gym.id,
      organizationId: m.organizationId,
      roleKey: m.roleKey as GymRoleKey,
    })),
    hasStudentLinks: studentLinkCount > 0,
    hasParentLinks: parentLinkCount > 0,
  };
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    enabled: Boolean(userId),
  });

  const orgQuery = useQuery({
    queryKey: ['profile', userId, 'orgMemberships'],
    queryFn: () => getOrganizationMemberships(userId!),
    enabled: Boolean(userId),
  });

  const gymQuery = useQuery({
    queryKey: ['profile', userId, 'gymMemberships'],
    queryFn: () => getGymMemberships(userId!),
    enabled: Boolean(userId),
  });

  // Depends on the two membership queries above; passing their data in means
  // getAccessibleGyms only issues the single extra org-wide gyms query instead
  // of re-fetching organization_members and gym_members.
  const accessibleGymsQuery = useQuery({
    queryKey: [
      'profile',
      userId,
      'accessibleGyms',
      orgQuery.dataUpdatedAt,
      gymQuery.dataUpdatedAt,
    ],
    queryFn: () =>
      getAccessibleGyms(userId!, {
        orgMemberships: orgQuery.data!,
        gymMemberships: gymQuery.data!,
      }),
    enabled: Boolean(userId) && orgQuery.isSuccess && gymQuery.isSuccess,
  });

  const studentLinksQuery = useQuery({
    queryKey: ['profile', userId, 'studentLinks'],
    queryFn: () => countStudentLinks(userId!),
    enabled: Boolean(userId),
  });

  const parentLinksQuery = useQuery({
    queryKey: ['profile', userId, 'parentLinks'],
    queryFn: () => countParentLinks(userId!),
    enabled: Boolean(userId),
  });

  const value = useMemo<ProfileContextValue>(() => {
    const profile = profileQuery.data ?? null;
    const organizationMemberships = orgQuery.data ?? EMPTY_MEMBERSHIPS;
    const gymMemberships = gymQuery.data ?? EMPTY_GYMS;
    const accessibleGyms = accessibleGymsQuery.data ?? EMPTY_GYMS;
    const studentLinkCount = studentLinksQuery.data ?? 0;
    const parentLinkCount = parentLinksQuery.data ?? 0;

    const primaryRole = userId
      ? resolvePrimaryRole({
          profile,
          organizationMemberships,
          gymMemberships,
          studentLinkCount,
          parentLinkCount,
        })
      : 'none';

    const effectiveRoles = userId
      ? buildEffectiveRoles(
          profile,
          organizationMemberships,
          accessibleGyms,
          studentLinkCount,
          parentLinkCount,
        )
      : {
          platformRoles: [],
          organizationRoles: [],
          gymRoles: [],
          hasStudentLinks: false,
          hasParentLinks: false,
        };

    // isPending (v5) also covers the dependent accessibleGyms query while it
    // waits for the membership queries to settle. If a membership query
    // errors, accessibleGyms never runs — don't let its isPending wedge the
    // loading screen.
    const membershipsErrored = orgQuery.isError || gymQuery.isError;
    const loading =
      authLoading ||
      (Boolean(userId) &&
        (profileQuery.isPending ||
          orgQuery.isPending ||
          gymQuery.isPending ||
          (accessibleGymsQuery.isPending && !membershipsErrored) ||
          studentLinksQuery.isPending ||
          parentLinksQuery.isPending));

    return {
      profile,
      organizationMemberships,
      gymMemberships,
      accessibleGyms,
      primaryRole,
      zone: zoneForRoles(effectiveRoles),
      homeRoute: homeRouteForRoles(effectiveRoles),
      loading,
      refetch: async () => {
        await Promise.all([
          profileQuery.refetch(),
          orgQuery.refetch(),
          gymQuery.refetch(),
          accessibleGymsQuery.refetch(),
          studentLinksQuery.refetch(),
          parentLinksQuery.refetch(),
        ]);
      },
    };
  }, [
    authLoading,
    userId,
    orgQuery.isError,
    gymQuery.isError,
    profileQuery.data,
    profileQuery.isPending,
    profileQuery.refetch,
    orgQuery.data,
    orgQuery.isPending,
    orgQuery.refetch,
    gymQuery.data,
    gymQuery.isPending,
    gymQuery.refetch,
    accessibleGymsQuery.data,
    accessibleGymsQuery.isPending,
    accessibleGymsQuery.refetch,
    studentLinksQuery.data,
    studentLinksQuery.isPending,
    studentLinksQuery.refetch,
    parentLinksQuery.data,
    parentLinksQuery.isPending,
    parentLinksQuery.refetch,
  ]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}
