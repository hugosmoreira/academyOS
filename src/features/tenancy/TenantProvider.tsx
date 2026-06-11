import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useProfile } from '../auth/ProfileProvider';
import type { GymMembership, OrganizationMembership } from './tenancy.service';

const SELECTED_GYM_STORAGE_KEY = 'academyos:selectedGymId';

type TenantContextValue = {
  organizations: OrganizationMembership[];
  gyms: GymMembership[];
  activeOrganization: OrganizationMembership | null;
  activeGym: GymMembership | null;
  setActiveGymId: (gymId: string) => void;
  loading: boolean;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

/**
 * Derives tenant state (active gym / organization) from ProfileProvider's
 * already-fetched memberships. Issues no Supabase requests of its own, so
 * organization_members / gym_members are only queried once per session.
 */
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const {
    organizationMemberships: organizations,
    accessibleGyms: gyms,
    loading,
  } = useProfile();
  const [activeGymId, setActiveGymIdState] = useState<string | null>(() => localStorage.getItem(SELECTED_GYM_STORAGE_KEY));

  const activeGym = useMemo(() => {
    if (!gyms.length) return null;
    return gyms.find((membership) => membership.gym.id === activeGymId) ?? gyms[0];
  }, [activeGymId, gyms]);

  const activeOrganization = useMemo(() => {
    if (!activeGym) return organizations[0] ?? null;
    return organizations.find((membership) => membership.organization.id === activeGym.organizationId) ?? null;
  }, [activeGym, organizations]);

  useEffect(() => {
    if (!activeGym) return;
    localStorage.setItem(SELECTED_GYM_STORAGE_KEY, activeGym.gym.id);
  }, [activeGym]);

  const value = useMemo<TenantContextValue>(
    () => ({
      organizations,
      gyms,
      activeOrganization,
      activeGym,
      setActiveGymId(gymId) {
        setActiveGymIdState(gymId);
      },
      loading,
    }),
    [activeGym, activeOrganization, gyms, loading, organizations],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
