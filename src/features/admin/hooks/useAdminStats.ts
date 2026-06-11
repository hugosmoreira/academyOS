import { useQuery } from '@tanstack/react-query';
import { getPlatformStats } from '../services/adminService';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getPlatformStats,
    staleTime: 30_000,
  });
}
