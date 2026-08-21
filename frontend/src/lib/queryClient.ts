import { QueryClient } from "@tanstack/react-query";

export const liveQueryOptions = {
  refetchOnWindowFocus: true,
  refetchInterval: 15_000,
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
