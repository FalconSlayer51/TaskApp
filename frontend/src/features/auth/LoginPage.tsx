import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/authStore";
import { getApiErrorMessage, getFieldErrors } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-none bg-transparent p-0 sm:rounded-2xl sm:border sm:bg-card sm:p-6 sm:shadow-sm md:p-8">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">Task Tracker</p>
        <h1 className="mt-2 text-3xl tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to pick up your personal tasks.</p>

        {formError ? (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Could not sign in</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            setFormError(null);
            try {
              const result = await loginUser(values);
              login(result.token, result.user);
              navigate("/");
            } catch (error) {
              const fields = getFieldErrors(error);
              Object.entries(fields).forEach(([path, message]) => {
                if (path === "email" || path === "password") {
                  setError(path, { message });
                }
              });
              setFormError(getApiErrorMessage(error));
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="min-h-11"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="min-h-11"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="min-h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
