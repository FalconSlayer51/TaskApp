import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { liveQueryOptions } from "@/lib/queryClient";
import { useTaskFilterStore } from "@/features/tasks/taskFilterStore";
import { useWorkspaceStore } from "@/features/workspaces/workspaceStore";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  type ListTaskParams,
  type TaskInput,
} from "@/features/tasks/api";

type UseTasksOverrides = Pick<ListTaskParams, "page" | "sort" | "order">;

export function useTasks(limit = 10, overrides?: UseTasksOverrides) {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId) ?? "";
  const status = useTaskFilterStore((s) => s.status);
  const priority = useTaskFilterStore((s) => s.priority);
  const search = useTaskFilterStore((s) => s.search);
  const filterSort = useTaskFilterStore((s) => s.sort);
  const filterOrder = useTaskFilterStore((s) => s.order);
  const filterPage = useTaskFilterStore((s) => s.page);
  const assignedToMe = useTaskFilterStore((s) => s.assignedToMe);
  const sort = overrides?.sort ?? filterSort;
  const order = overrides?.order ?? filterOrder;
  const page = overrides?.page ?? filterPage;

  const params = {
    status: status === "all" ? undefined : status,
    priority: priority === "all" ? undefined : priority,
    search: search.trim() || undefined,
    sort,
    order,
    page,
    limit,
    assignedToMe: assignedToMe || undefined,
  };

  return useQuery({
    queryKey: queryKeys.tasks(workspaceId, params, page, limit),
    queryFn: () => listTasks(params),
    enabled: Boolean(workspaceId),
    ...liveQueryOptions,
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["tasks"] }),
      qc.invalidateQueries({ queryKey: ["analytics"] }),
    ]);
  };

  const create = useMutation({
    mutationFn: (payload: TaskInput) => createTask(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TaskInput> }) =>
      updateTask(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
