export const queryKeys = {
  me: () => ["me"] as const,
  workspaces: () => ["workspaces"] as const,
  members: (workspaceId: string) => ["members", workspaceId] as const,
  directory: (workspaceId: string) => ["directory", workspaceId] as const,
  tasks: (workspaceId: string, filters: unknown, page?: number, limit?: number) =>
    ["tasks", workspaceId, filters, page, limit] as const,
  analytics: (workspaceId: string) => ["analytics", workspaceId] as const,
};
