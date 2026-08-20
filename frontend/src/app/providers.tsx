import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/features/auth/authStore";
import { applyTheme, useThemeStore } from "@/features/settings/themeStore";
import { ErrorBoundary } from "@/app/ErrorBoundary";

let interceptorsBound = false;

function bindApiInterceptors() {
  if (interceptorsBound) return;
  interceptorsBound = true;

  api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        queryClient.clear();
        const path = window.location.pathname;
        if (path !== "/login" && path !== "/signup") {
          window.location.assign("/login");
        }
      }
      return Promise.reject(error);
    },
  );
}

bindApiInterceptors();

export function Providers({ children }: { children: ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(useThemeStore.getState().theme);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    const finish = () => useAuthStore.setState({ hydrated: true });
    const unsub = useAuthStore.persist.onFinishHydration(finish);
    if (useAuthStore.persist.hasHydrated()) {
      finish();
    }
    const timeout = window.setTimeout(finish, 0);
    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ErrorBoundary>{children}</ErrorBoundary>
        </BrowserRouter>
        <Toaster duration={5000} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
