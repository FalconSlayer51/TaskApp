import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { TasksSkeleton } from "@/components/PageSkeleton";
import { useTaskFilterStore } from "@/features/tasks/taskFilterStore";
import { useTaskMutations, useTasks } from "@/features/tasks/hooks";
import { TaskEditor } from "@/features/tasks/TaskEditor";
import { FilterFields, FilterSheet } from "@/features/tasks/FilterSheet";
import { PriorityBadge, StatusBadge } from "@/features/tasks/badges";
import { AssigneeLabel } from "@/features/tasks/AssigneeLabel";
import type { PublicTask } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/api";
import type { TaskFormValues } from "@/features/tasks/TaskFormFields";

export function TasksPage() {
  const search = useTaskFilterStore((s) => s.search);
  const setSearch = useTaskFilterStore((s) => s.setSearch);
  const page = useTaskFilterStore((s) => s.page);
  const setPage = useTaskFilterStore((s) => s.setPage);

  const [draft, setDraft] = useState(search);
  useEffect(() => {
    const id = window.setTimeout(() => setSearch(draft), 250);
    return () => window.clearTimeout(id);
  }, [draft, setSearch]);

  const query = useTasks(10);
  const mutations = useTaskMutations();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PublicTask | undefined>();

  const items = query.data?.items ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const isFetching = query.isFetching && !query.isLoading;

  const payloadFromForm = (values: TaskFormValues) => ({
    title: values.title,
    description: values.description ?? "",
    status: values.status,
    priority: values.priority,
    dueDate: values.dueDate ? values.dueDate.toISOString() : null,
    assigneeId: values.assigneeId === "none" ? null : values.assigneeId,
  });

  const openCreate = () => {
    setEditing(undefined);
    setEditorOpen(true);
  };

  const submitting = mutations.create.isPending || mutations.update.isPending;

  const completeTask = (task: PublicTask) => {
    mutations.update.mutate(
      { id: task.id, payload: { status: "done" } },
      {
        onSuccess: () => toast.success("Marked as done"),
        onError: (e) => toast.error(getApiErrorMessage(e)),
      },
    );
  };

  const removeTask = (task: PublicTask) => {
    if (!window.confirm("Delete this task?")) return;
    mutations.remove.mutate(task.id, {
      onSuccess: () => toast.success("Task deleted"),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground md:sr-only">
          Search and complete your work.
          {isFetching ? " Updating…" : ""}
        </p>
        <div className="hidden md:block">
          <h2 className="text-2xl tracking-tight">Your tasks</h2>
          <p className="text-sm text-muted-foreground">
            Filter, complete, and keep due dates in view.
            {isFetching ? " Updating…" : ""}
          </p>
        </div>
        <Button className="min-h-11 w-full md:w-auto md:min-h-8" onClick={openCreate}>
          <Plus />
          Create task
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex items-end gap-2 md:min-w-0 md:flex-1">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Filter by title"
              className="min-h-11"
            />
          </div>
          <FilterSheet />
        </div>
        <div className="hidden min-w-0 flex-[2] md:block">
          <FilterFields />
        </div>
      </div>

      {query.isLoading ? <TasksSkeleton /> : null}
      {query.isError ? (
        <QueryError message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : null}

      {!query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState
          headline="No tasks yet"
          description="Create your first task to start tracking work."
          actionLabel="Create task"
          onAction={openCreate}
        />
      ) : null}

      {!query.isLoading && items.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-xl border md:block">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/60">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell>
                      <AssigneeLabel assigneeId={task.assigneeId} />
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "—"}
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      {task.status !== "done" ? (
                        <Button variant="ghost" size="sm" onClick={() => completeTask(task)}>
                          Complete
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(task);
                          setEditorOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeTask(task)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {items.map((task) => (
              <Card key={task.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-base leading-snug">{task.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="min-h-11 min-w-11 shrink-0">
                        <MoreHorizontal />
                        <span className="sr-only">Task actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {task.status !== "done" ? (
                        <DropdownMenuItem onClick={() => completeTask(task)}>
                          Complete
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(task);
                          setEditorOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => removeTask(task)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  <AssigneeLabel assigneeId={task.assigneeId} />
                  <span className="text-sm text-muted-foreground">
                    {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No due date"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button
                variant="outline"
                className="min-h-11 md:min-h-8"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="min-h-11 md:min-h-8"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}

      <TaskEditor
        open={editorOpen}
        task={editing}
        submitting={submitting}
        onOpenChange={setEditorOpen}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await mutations.update.mutateAsync({
                id: editing.id,
                payload: payloadFromForm(values),
              });
              toast.success("Task updated");
            } else {
              await mutations.create.mutateAsync(payloadFromForm(values));
              toast.success("Task created");
            }
            setEditorOpen(false);
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
