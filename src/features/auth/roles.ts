import type { RoleKey } from '../../types/database';
import type { GymMembership, OrganizationMembership } from '../tenancy/tenancy.service';
import type { Profile } from '../../services/profileService';

export type PrimaryRole =
  | 'platform_super_admin'
  | 'organization_owner'
  | 'gym_admin'
  | 'instructor'
  | 'front_desk'
  | 'student'
  | 'parent'
  | 'none';

export type RoleResolutionInput = {
  profile: Profile | null;
  organizationMemberships: OrganizationMembership[];
  gymMemberships: GymMembership[];
  studentLinkCount: number;
  parentLinkCount: number;
};

const STAFF_ROLES: ReadonlyArray<RoleKey> = [
  'organization_owner',
  'organization_admin',
  'organization_billing_manager',
  'gym_owner',
  'gym_admin',
  'head_coach',
  'coach',
  'assistant_coach',
  'instructor',
  'front_desk',
  'billing_staff',
];

const STAFF_GYM_ROLES: ReadonlyArray<RoleKey> = [
  'gym_owner',
  'gym_admin',
  'head_coach',
  'coach',
  'assistant_coach',
  'instructor',
  'front_desk',
  'billing_staff',
];

/**
 * Resolves the user's effective primary role using the priority defined
 * in the auth/onboarding plan. The first matching tier wins:
 *
 *   1. profiles.platform_role = 'platform_super_admin'
 *   2. organization_members with role 'organization_owner'
 *   3. gym_members with a staff role
 *   4. parent_user_links (or membership role 'parent')
 *   5. student_user_links (or membership role 'student')
 *   6. otherwise 'none'
 */
export function resolvePrimaryRole(input: RoleResolutionInput): PrimaryRole {
  const { profile, organizationMemberships, gymMemberships, studentLinkCount, parentLinkCount } =
    input;

  if (
    profile?.platform_role === 'platform_super_admin' ||
    profile?.platform_role === 'platform_admin'
  ) {
    return 'platform_super_admin';
  }

  if (
    organizationMemberships.some(
      (m) => m.roleKey === 'organization_owner' || m.roleKey === 'organization_admin',
    )
  ) {
    return 'organization_owner';
  }

  const staffGymRole = gymMemberships.find((m) => STAFF_GYM_ROLES.includes(m.roleKey));
  if (staffGymRole) {
    return mapGymRoleToPrimary(staffGymRole.roleKey);
  }

  if (
    parentLinkCount > 0 ||
    gymMemberships.some((m) => m.roleKey === 'parent') ||
    organizationMemberships.some((m) => m.roleKey === 'parent')
  ) {
    return 'parent';
  }

  if (
    studentLinkCount > 0 ||
    gymMemberships.some((m) => m.roleKey === 'student') ||
    organizationMemberships.some((m) => m.roleKey === 'student')
  ) {
    return 'student';
  }

  return 'none';
}

export type RoleZone = 'admin' | 'app' | 'portal' | 'none';

function mapGymRoleToPrimary(roleKey: RoleKey): Exclude<PrimaryRole, 'platform_super_admin' | 'none'> {
  switch (roleKey) {
    case 'gym_owner':
    case 'gym_admin':
      return 'gym_admin';
    case 'head_coach':
    case 'coach':
    case 'assistant_coach':
    case 'instructor':
      return 'instructor';
    case 'billing_staff':
    case 'front_desk':
      return 'front_desk';
    default:
      return 'front_desk';
  }
}

export function zoneForRole(role: PrimaryRole): RoleZone {
  switch (role) {
    case 'platform_super_admin':
      return 'admin';
    case 'organization_owner':
    case 'gym_admin':
    case 'instructor':
    case 'front_desk':
      return 'app';
    case 'student':
    case 'parent':
      return 'portal';
    default:
      return 'none';
  }
}

export function homeRouteForRole(role: PrimaryRole): string {
  switch (zoneForRole(role)) {
    case 'admin':
      return '/admin';
    case 'app':
      return '/app/dashboard';
    case 'portal':
      return '/portal/dashboard';
    default:
      return '/access-denied';
  }
}

export function canAccessZone(role: PrimaryRole, zone: RoleZone): boolean {
  if (zone === 'none') return false;
  const userZone = zoneForRole(role);
  if (userZone === zone) return true;
  // Platform admin may view the org/portal areas later (impersonation). Keep
  // strict for now and rely on RoleBasedRedirect to bounce them home.
  return false;
}
