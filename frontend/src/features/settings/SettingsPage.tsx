import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMe } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/authStore";
import { useThemeStore } from "@/features/settings/themeStore";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
});

const themes: { id: ThemeMode; label: string; hint: string }[] = [
  { id: "light", label: "Light", hint: "Bright surfaces" },
  { id: "dark", label: "Dark", hint: "Low glare" },
  { id: "system", label: "System", hint: "Match the device" },
];

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { name: user?.name ?? "" },
  });

  useEffect(() => {
    form.reset({ name: user?.name ?? "" });
  }, [user?.name, form]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="hidden md:block">
        <h2 className="text-2xl tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Appearance is saved on this device. Your name lives with your account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {themes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTheme(item.id)}
              className={cn(
                "flex min-h-11 items-center justify-between rounded-lg border px-4 py-3 text-left",
                theme === item.id ? "border-primary bg-accent" : "hover:bg-muted/60",
              )}
            >
              <span>
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.hint}</span>
              </span>
              {theme === item.id ? <span className="text-xs text-primary">Active</span> : null}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async ({ name }) => {
              try {
                const next = await updateMe({ name });
                setUser(next);
                toast.success("Display name updated");
              } catch (error) {
                toast.error(getApiErrorMessage(error));
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input id="display-name" className="min-h-11" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input className="min-h-11" value={user?.email ?? ""} disabled />
            </div>
            <Button className="min-h-11 w-full md:w-auto" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save name"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
