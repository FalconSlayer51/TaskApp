import { create } from "zustand";
import { persist } from "zustand/middleware";

type WorkspaceUiState = {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string | null) => void;
};

export const useWorkspaceStore = create<WorkspaceUiState>()(
  persist(
    (set) => ({
      currentWorkspaceId: null,
      setCurrentWorkspaceId: (currentWorkspaceId) => set({ currentWorkspaceId }),
    }),
    { name: "task-tracker-workspace" },
  ),
);
