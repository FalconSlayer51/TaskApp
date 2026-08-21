import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";
import { Skeleton } from "@/components/ui/skeleton";

function HydrationSkeleton() {
  return (
    <div className="flex min-h-svh items-center justify-center p-8">
      <Skeleton className="h-40 w-full max-w-md rounded-xl" />
    </div>
  );
}

export function ProtectedRoute() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!hydrated) return <HydrationSkeleton />;
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  if (!hydrated) return <HydrationSkeleton />;
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export function FallbackRedirect() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  if (!hydrated) return <HydrationSkeleton />;
  return <Navigate to={token ? "/dashboard" : "/"} replace />;
}

export { HydrationSkeleton };
