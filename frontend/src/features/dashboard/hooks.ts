import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/features/dashboard/api";
import { useWorkspaceStore } from "@/features/workspaces/workspaceStore";
import { queryKeys } from "@/lib/queryKeys";

export function useAnalytics() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId) ?? "";
  return useQuery({
    queryKey: queryKeys.analytics(workspaceId),
    queryFn: fetchAnalytics,
    enabled: Boolean(workspaceId),
  });
}
