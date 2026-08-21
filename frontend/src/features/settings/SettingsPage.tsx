import { useEffect, useState } from "react";
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
import { WorkspaceSwitcher } from "@/features/workspaces/WorkspaceSwitcher";
import { useCurrentWorkspace, useMembers } from "@/features/workspaces/hooks";
import { inviteMember, removeMember } from "@/features/workspaces/api";
import { MemberAvatar } from "@/features/workspaces/MemberAvatar";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
});

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
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
  const { current } = useCurrentWorkspace();
  const members = useMembers(current?.id ?? null);
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { name: user?.name ?? "" },
  });
  const inviteForm = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "" },
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    form.reset({ name: user?.name ?? "" });
  }, [user?.name, form]);

  const isOwner = current?.role === "owner";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="hidden md:block">
        <h2 className="text-2xl tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Appearance is saved on this device. Sharing lives on the workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WorkspaceSwitcher />
          <p className="text-sm text-muted-foreground">
            Switch which list you are looking at. Invites only work for people who already have an
            account.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {(members.data ?? []).map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <MemberAvatar name={member.name} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email} · {member.role}
                  </p>
                </div>
                {member.role !== "owner" && (isOwner || member.id === user?.id) ? (
                  <Button
                    variant="outline"
                    className="min-h-11 md:min-h-8"
                    disabled={busyId === member.id}
                    onClick={async () => {
                      if (!current) return;
                      const self = member.id === user?.id;
                      if (!window.confirm(self ? "Leave this workspace?" : `Remove ${member.name}?`)) {
                        return;
                      }
                      setBusyId(member.id);
                      try {
                        await removeMember(current.id, member.id);
                        await queryClient.invalidateQueries({
                          queryKey: queryKeys.members(current.id),
                        });
                        if (self) {
                          await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces() });
                        }
                        toast.success(self ? "You left the workspace" : "Member removed");
                      } catch (error) {
                        toast.error(getApiErrorMessage(error));
                      } finally {
                        setBusyId(null);
                      }
                    }}
                  >
                    {member.id === user?.id ? "Leave" : "Remove"}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>

          {isOwner ? (
            <form
              className="space-y-3 border-t pt-4"
              onSubmit={inviteForm.handleSubmit(async ({ email }) => {
                if (!current) return;
                try {
                  await inviteMember(current.id, email);
                  inviteForm.reset();
                  await queryClient.invalidateQueries({
                    queryKey: queryKeys.members(current.id),
                  });
                  toast.success("Member added");
                } catch (error) {
                  toast.error(getApiErrorMessage(error));
                }
              })}
            >
              <Label htmlFor="invite-email">Invite by email</Label>
              <Input
                id="invite-email"
                type="email"
                className="min-h-11"
                placeholder="they@example.com"
                {...inviteForm.register("email")}
              />
              {inviteForm.formState.errors.email ? (
                <p className="text-sm text-destructive">
                  {inviteForm.formState.errors.email.message}
                </p>
              ) : null}
              <Button
                className="min-h-11 w-full md:w-auto"
                type="submit"
                disabled={inviteForm.formState.isSubmitting}
              >
                {inviteForm.formState.isSubmitting ? "Inviting…" : "Invite member"}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>

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
