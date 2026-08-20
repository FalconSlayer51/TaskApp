import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicUser } from "@/lib/types";

type AuthState = {
  token: string | null;
  user: PublicUser | null;
  hydrated: boolean;
  login: (token: string, user: PublicUser) => void;
  logout: () => void;
  setUser: (user: PublicUser) => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setUser: (user) => set({ user }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "task-tracker-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => () => {
        useAuthStore.getState().setHydrated(true);
      },
    },
  ),
);
