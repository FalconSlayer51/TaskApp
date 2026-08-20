import { api } from "@/lib/api";
import type { PublicTask, TaskListResponse, TaskPriority, TaskStatus } from "@/lib/types";

export type ListTaskParams = {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "dueDate" | "priority" | "createdAt";
  order?: "asc" | "desc";
};

export type TaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export async function listTasks(params: ListTaskParams) {
  const { data } = await api.get<TaskListResponse>("/api/tasks", { params });
  return data;
}

export async function createTask(payload: TaskInput) {
  const { data } = await api.post<{ task: PublicTask }>("/api/tasks", payload);
  return data.task;
}

export async function updateTask(id: string, payload: Partial<TaskInput>) {
  const { data } = await api.patch<{ task: PublicTask }>(`/api/tasks/${id}`, payload);
  return data.task;
}

export async function deleteTask(id: string) {
  await api.delete(`/api/tasks/${id}`);
}
