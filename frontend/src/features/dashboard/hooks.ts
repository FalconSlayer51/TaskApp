import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/features/dashboard/api";
import { queryKeys } from "@/lib/queryKeys";

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics(),
    queryFn: fetchAnalytics,
  });
}
