import { useQuery } from "@tanstack/react-query";
import { listMembers, listWorkspaces } from "@/features/workspaces/api";
import { useWorkspaceStore } from "@/features/workspaces/workspaceStore";
import { queryKeys } from "@/lib/queryKeys";

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces(),
    queryFn: listWorkspaces,
  });
}

export function useCurrentWorkspace() {
  const query = useWorkspaces();
  const currentId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const items = query.data ?? [];
  const current = items.find((w) => w.id === currentId) ?? items[0] ?? null;
  return { ...query, current, items };
}

export function useMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.members(workspaceId ?? ""),
    queryFn: () => listMembers(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}
