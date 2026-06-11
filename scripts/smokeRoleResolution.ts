/* eslint-disable no-console */
// Smoke test for role resolution. Run with:
//   npx tsx scripts/smokeRoleResolution.ts
// Exits non-zero if any case fails.

import {
  resolvePrimaryRole,
  homeRouteForRole,
  zoneForRole,
  type PrimaryRole,
  type RoleResolutionInput,
} from '../src/features/auth/roles';
import type { RoleKey } from '../src/types/database';

type Case = {
  name: string;
  input: RoleResolutionInput;
  expectedRole: PrimaryRole;
  expectedHome: string;
};

const cases: Case[] = [
  {
    name: 'platform super admin via platform_role',
    input: {
      profile: makeProfile({ platform_role: 'platform_super_admin' }),
      organizationMemberships: [],
      gymMemberships: [],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'platform_super_admin',
    expectedHome: '/admin',
  },
  {
    name: 'organization owner via org membership',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [
        membership('organization_owner') as RoleResolutionInput['organizationMemberships'][number],
      ],
      gymMemberships: [],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'organization_owner',
    expectedHome: '/app/dashboard',
  },
  {
    name: 'gym admin via gym membership',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [],
      gymMemberships: [gymMembership('gym_admin')],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'gym_admin',
    expectedHome: '/app/dashboard',
  },
  {
    name: 'instructor wins over front_desk when both present',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [],
      gymMemberships: [gymMembership('instructor'), gymMembership('front_desk')],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'instructor',
    expectedHome: '/app/dashboard',
  },
  {
    name: 'parent via parent_user_links',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [],
      gymMemberships: [],
      studentLinkCount: 0,
      parentLinkCount: 2,
    },
    expectedRole: 'parent',
    expectedHome: '/portal/dashboard',
  },
  {
    name: 'student via student_user_links',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [],
      gymMemberships: [],
      studentLinkCount: 1,
      parentLinkCount: 0,
    },
    expectedRole: 'student',
    expectedHome: '/portal/dashboard',
  },
  {
    name: 'platform admin beats every other tier',
    input: {
      profile: makeProfile({ platform_role: 'platform_super_admin' }),
      organizationMemberships: [membership('organization_owner')],
      gymMemberships: [gymMembership('gym_admin')],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'platform_super_admin',
    expectedHome: '/admin',
  },
  {
    name: 'no roles -> none -> /access-denied',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [],
      gymMemberships: [],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'none',
    expectedHome: '/access-denied',
  },
  {
    name: 'org membership with role=parent (portal) -> parent',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [membership('parent')],
      gymMemberships: [],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'parent',
    expectedHome: '/portal/dashboard',
  },
  {
    name: 'platform_admin via profiles.platform_role -> admin home',
    input: {
      profile: makeProfile({ platform_role: 'platform_admin' }),
      organizationMemberships: [],
      gymMemberships: [],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'platform_super_admin',
    expectedHome: '/admin',
  },
  {
    name: 'organization_admin (org scope) -> org owner zone',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [membership('organization_admin')],
      gymMemberships: [],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'organization_owner',
    expectedHome: '/app/dashboard',
  },
  {
    name: 'gym_owner -> gym_admin primary',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [],
      gymMemberships: [gymMembership('gym_owner')],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'gym_admin',
    expectedHome: '/app/dashboard',
  },
  {
    name: 'head_coach -> instructor primary',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [],
      gymMemberships: [gymMembership('head_coach')],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'instructor',
    expectedHome: '/app/dashboard',
  },
  {
    name: 'coach -> instructor primary',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [],
      gymMemberships: [gymMembership('coach')],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'instructor',
    expectedHome: '/app/dashboard',
  },
  {
    name: 'billing_staff -> front_desk primary',
    input: {
      profile: makeProfile({}),
      organizationMemberships: [],
      gymMemberships: [gymMembership('billing_staff')],
      studentLinkCount: 0,
      parentLinkCount: 0,
    },
    expectedRole: 'front_desk',
    expectedHome: '/app/dashboard',
  },
];

let failures = 0;
for (const testCase of cases) {
  const role = resolvePrimaryRole(testCase.input);
  const home = homeRouteForRole(role);
  const zone = zoneForRole(role);
  const ok = role === testCase.expectedRole && home === testCase.expectedHome;
  if (!ok) failures += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${testCase.name}  ->  role=${role} home=${home} zone=${zone}` +
      (ok
        ? ''
        : `\n        expected role=${testCase.expectedRole} home=${testCase.expectedHome}`),
  );
}

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
} else {
  console.log(`\nAll ${cases.length} cases passed.`);
}

function makeProfile(overrides: { platform_role?: string }) {
  return {
    id: 'profile-test',
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: null,
    phone: null,
    platform_role: overrides.platform_role ?? null,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function membership(roleKey: RoleKey) {
  return {
    id: `org-${roleKey}`,
    organization: {
      id: 'org-1',
      name: 'Org',
      slug: 'org',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roleKey,
  };
}

function gymMembership(roleKey: RoleKey) {
  return {
    id: `gym-${roleKey}`,
    organizationId: 'org-1',
    gym: {
      id: 'gym-1',
      organization_id: 'org-1',
      name: 'Gym',
      slug: 'gym',
      timezone: 'America/Los_Angeles',
      address_line1: null,
      address_line2: null,
      city: null,
      region: null,
      postal_code: null,
      phone: null,
      email: null,
      logo_url: null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roleKey,
  };
}
