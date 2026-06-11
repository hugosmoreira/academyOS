import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // Profile/membership/tenant data changes rarely; mutations invalidate
      // their own keys, so a long staleTime mostly eliminates refetch chatter.
      staleTime: 5 * 60_000,
    },
  },
});
