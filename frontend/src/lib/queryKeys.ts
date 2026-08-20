export const queryKeys = {
  me: () => ["me"] as const,
  tasks: (filters: unknown, page?: number, limit?: number) =>
    ["tasks", filters, page, limit] as const,
  analytics: () => ["analytics"] as const,
};
