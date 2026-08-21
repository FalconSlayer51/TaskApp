import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { LoginPage } from "@/features/auth/LoginPage";
import { SignupPage } from "@/features/auth/SignupPage";
import { FallbackRedirect, GuestRoute, ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { TasksPage } from "@/features/tasks/TasksPage";
import { KanbanPage } from "@/features/kanban/KanbanPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { LandingPage } from "@/features/marketing/LandingPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/board" element={<KanbanPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<FallbackRedirect />} />
    </Routes>
  );
}
