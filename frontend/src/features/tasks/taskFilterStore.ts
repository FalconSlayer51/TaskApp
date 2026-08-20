import { create } from "zustand";
import type { TaskFilters } from "@/lib/types";

type FilterState = TaskFilters & {
  page: number;
  setSearch: (search: string) => void;
  setStatus: (status: TaskFilters["status"]) => void;
  setPriority: (priority: TaskFilters["priority"]) => void;
  setSort: (sort: TaskFilters["sort"], order?: TaskFilters["order"]) => void;
  setPage: (page: number) => void;
  reset: () => void;
};

const defaults: TaskFilters & { page: number } = {
  status: "all",
  priority: "all",
  search: "",
  sort: "createdAt",
  order: "desc",
  page: 1,
};

export const useTaskFilterStore = create<FilterState>((set) => ({
  ...defaults,
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPriority: (priority) => set({ priority, page: 1 }),
  setSort: (sort, order) => set({ sort, order: order ?? "desc", page: 1 }),
  setPage: (page) => set({ page }),
  reset: () => set(defaults),
}));
