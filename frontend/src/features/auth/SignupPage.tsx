import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/authStore";
import { getApiErrorMessage, getFieldErrors } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
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
        <h1 className="mt-2 text-3xl tracking-tight">Create your workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A private list for your own work — no sharing, no extra roles.
        </p>

        {formError ? (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Could not create account</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            setFormError(null);
            try {
              const result = await registerUser(values);
              login(result.token, result.user);
              navigate("/");
            } catch (error) {
              const fields = getFieldErrors(error);
              Object.entries(fields).forEach(([path, message]) => {
                if (path === "name" || path === "email" || path === "password") {
                  setError(path, { message });
                }
              });
              setFormError(getApiErrorMessage(error));
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" className="min-h-11" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
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
              autoComplete="new-password"
              className="min-h-11"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="min-h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
