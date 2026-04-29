import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { getGymMemberships, getOrganizationMemberships, type GymMembership, type OrganizationMembership } from './tenancy.service';

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

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeGymId, setActiveGymIdState] = useState<string | null>(() => localStorage.getItem(SELECTED_GYM_STORAGE_KEY));

  const organizationsQuery = useQuery({
    queryKey: ['tenant', 'organizations', user?.id],
    queryFn: () => getOrganizationMemberships(user!.id),
    enabled: Boolean(user?.id),
  });

  const gymsQuery = useQuery({
    queryKey: ['tenant', 'gyms', user?.id],
    queryFn: () => getGymMemberships(user!.id),
    enabled: Boolean(user?.id),
  });

  const gyms = gymsQuery.data ?? [];
  const organizations = organizationsQuery.data ?? [];

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
      loading: organizationsQuery.isLoading || gymsQuery.isLoading,
    }),
    [activeGym, activeOrganization, gyms, gymsQuery.isLoading, organizations, organizationsQuery.isLoading],
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
