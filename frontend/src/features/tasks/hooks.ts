import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { useTaskFilterStore } from "@/features/tasks/taskFilterStore";
import { createTask, deleteTask, listTasks, updateTask, type TaskInput } from "@/features/tasks/api";

export function useTasks(limit = 10) {
  const status = useTaskFilterStore((s) => s.status);
  const priority = useTaskFilterStore((s) => s.priority);
  const search = useTaskFilterStore((s) => s.search);
  const sort = useTaskFilterStore((s) => s.sort);
  const order = useTaskFilterStore((s) => s.order);
  const page = useTaskFilterStore((s) => s.page);

  const params = {
    status: status === "all" ? undefined : status,
    priority: priority === "all" ? undefined : priority,
    search: search.trim() || undefined,
    sort,
    order,
    page,
    limit,
  };

  return useQuery({
    queryKey: queryKeys.tasks(params, page, limit),
    queryFn: () => listTasks(params),
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["tasks"] }),
      qc.invalidateQueries({ queryKey: queryKeys.analytics() }),
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
