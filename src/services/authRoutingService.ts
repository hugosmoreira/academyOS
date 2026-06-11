import type {
  GymRoleKey,
  OrganizationRoleKey,
  PlatformRoleKey,
  RoleKey,
} from '../types/database';

export type RoleZone = 'admin' | 'app' | 'portal' | 'none';

export type EffectiveRoles = {
  platformRoles: PlatformRoleKey[];
  organizationRoles: Array<{ organizationId: string; roleKey: OrganizationRoleKey }>;
  gymRoles: Array<{ gymId: string; organizationId: string; roleKey: GymRoleKey }>;
  hasStudentLinks: boolean;
  hasParentLinks: boolean;
};

const STAFF_GYM_ROLES: GymRoleKey[] = [
  'gym_owner',
  'gym_admin',
  'head_coach',
  'coach',
  'assistant_coach',
  'instructor',
  'front_desk',
  'billing_staff',
];

const ORG_STAFF_ROLES: OrganizationRoleKey[] = [
  'organization_owner',
  'organization_admin',
  'organization_billing_manager',
];

export function isPlatformAdminRole(key: string): boolean {
  return key === 'platform_super_admin' || key === 'platform_admin';
}

export function hasPlatformAdmin(roles: EffectiveRoles): boolean {
  return roles.platformRoles.some(isPlatformAdminRole);
}

export function hasSalesAdmin(roles: EffectiveRoles): boolean {
  return roles.platformRoles.includes('sales_admin') || hasPlatformAdmin(roles);
}

export function hasSupportAdmin(roles: EffectiveRoles): boolean {
  return roles.platformRoles.includes('support_admin') || hasPlatformAdmin(roles);
}

export function zoneForRoles(roles: EffectiveRoles): RoleZone {
  if (roles.platformRoles.length > 0) return 'admin';
  if (roles.organizationRoles.length > 0) return 'app';
  if (roles.gymRoles.some((g) => STAFF_GYM_ROLES.includes(g.roleKey))) return 'app';
  if (roles.hasParentLinks || roles.hasStudentLinks) return 'portal';
  return 'none';
}

/**
 * Determines the home route the user should land on after login.
 *
 *   1. Platform super admin / platform admin -> /admin/dashboard
 *   2. Sales admin                            -> /admin/sales-leads
 *   3. Support admin                          -> /admin/organizations
 *   4. Org owner/admin with 2+ gyms           -> /app/gym-selector
 *   5. Org owner/admin with single gym        -> /app/gyms/:gymId/dashboard
 *   6. Gym staff                              -> /app/gyms/:firstGymId/dashboard
 *   7. Student/parent                         -> /portal/dashboard
 *   8. Otherwise                              -> /access-denied
 */
export function homeRouteForRoles(roles: EffectiveRoles): string {
  if (hasPlatformAdmin(roles)) return '/admin/dashboard';
  if (roles.platformRoles.includes('sales_admin')) return '/admin/sales-leads';
  if (roles.platformRoles.includes('support_admin')) return '/admin/organizations';

  const isOrgStaff = roles.organizationRoles.some((m) => ORG_STAFF_ROLES.includes(m.roleKey));
  if (isOrgStaff) {
    const gymIds = new Set(roles.gymRoles.map((g) => g.gymId));
    if (gymIds.size > 1) return '/app/gym-selector';
    if (gymIds.size === 1) return `/app/gyms/${roles.gymRoles[0].gymId}/dashboard`;
    return '/app/gym-selector';
  }

  const gymStaff = roles.gymRoles.find((g) => STAFF_GYM_ROLES.includes(g.roleKey));
  if (gymStaff) return `/app/gyms/${gymStaff.gymId}/dashboard`;

  if (roles.hasParentLinks || roles.hasStudentLinks) return '/portal/dashboard';
  return '/access-denied';
}

export function canAccessZone(roles: EffectiveRoles, zone: RoleZone): boolean {
  if (zone === 'none') return false;
  if (zone === 'admin') return roles.platformRoles.length > 0;
  if (zone === 'app') {
    return (
      roles.organizationRoles.length > 0 ||
      roles.gymRoles.some((g) => STAFF_GYM_ROLES.includes(g.roleKey))
    );
  }
  if (zone === 'portal') return roles.hasParentLinks || roles.hasStudentLinks;
  return false;
}

export function isOrgMember(roles: EffectiveRoles, organizationId: string): boolean {
  if (hasPlatformAdmin(roles)) return true;
  if (roles.organizationRoles.some((m) => m.organizationId === organizationId)) return true;
  return roles.gymRoles.some((g) => g.organizationId === organizationId);
}

export function isGymMember(roles: EffectiveRoles, gymId: string): boolean {
  if (hasPlatformAdmin(roles)) return true;
  if (roles.gymRoles.some((g) => g.gymId === gymId)) return true;
  // org owners/admins implicitly see all gyms in their org; caller should
  // pair this with isOrgMember(roles, gym.organization_id) when needed.
  return false;
}

export function legacyPrimaryRole(roles: EffectiveRoles): RoleKey | 'none' {
  if (roles.platformRoles.includes('platform_super_admin')) return 'platform_super_admin';
  if (roles.platformRoles.includes('platform_admin')) return 'platform_super_admin';
  const orgOwner = roles.organizationRoles.find((r) => r.roleKey === 'organization_owner');
  if (orgOwner) return 'organization_owner';
  const orgAdmin = roles.organizationRoles.find((r) => r.roleKey === 'organization_admin');
  if (orgAdmin) return 'organization_owner';
  const staff = roles.gymRoles.find((g) => STAFF_GYM_ROLES.includes(g.roleKey));
  if (staff) {
    if (staff.roleKey === 'gym_owner' || staff.roleKey === 'gym_admin') return 'gym_admin';
    if (
      staff.roleKey === 'head_coach' ||
      staff.roleKey === 'coach' ||
      staff.roleKey === 'assistant_coach' ||
      staff.roleKey === 'instructor'
    ) {
      return 'instructor';
    }
    return 'front_desk';
  }
  if (roles.hasParentLinks) return 'parent';
  if (roles.hasStudentLinks) return 'student';
  return 'none';
}
