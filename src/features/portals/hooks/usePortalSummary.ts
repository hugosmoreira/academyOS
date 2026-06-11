import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import { getPortalSummary } from '../services/portalService';

export function usePortalSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['portal', 'summary', user?.id],
    queryFn: () => getPortalSummary(user!.id),
    enabled: Boolean(user?.id),
  });
}
