import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { useMembers } from "@/features/workspaces/hooks";
import { useWorkspaceStore } from "@/features/workspaces/workspaceStore";
import type { PublicTask, TaskPriority, TaskStatus } from "@/lib/types";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().optional().nullable(),
  assigneeId: z.string(),
});

export type TaskFormValues = z.infer<typeof schema>;

type Props = {
  task?: PublicTask;
  submitting: boolean;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
};

export function TaskFormFields({ task, submitting, onSubmit, onCancel }: Props) {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const members = useMembers(workspaceId);
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: (task?.status ?? "todo") as TaskStatus,
      priority: (task?.priority ?? "medium") as TaskPriority,
      dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
      assigneeId: task?.assigneeId ?? "none",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" className="min-h-11" {...form.register("title")} />
        {form.formState.errors.title ? (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...form.register("description")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value) => form.setValue("status", value as TaskStatus)}
          >
            <SelectTrigger className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={form.watch("priority")}
            onValueChange={(value) => form.setValue("priority", value as TaskPriority)}
          >
            <SelectTrigger className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Assignee</Label>
        <Select
          value={form.watch("assigneeId")}
          onValueChange={(value) => form.setValue("assigneeId", value)}
        >
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {(members.data ?? []).map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Due date</Label>
        <DatePicker
          value={form.watch("dueDate") ?? undefined}
          onChange={(date) => form.setValue("dueDate", date ?? null)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : task ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
