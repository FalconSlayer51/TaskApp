import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { TasksSkeleton } from "@/components/PageSkeleton";
import { useTaskFilterStore } from "@/features/tasks/taskFilterStore";
import { useTaskMutations, useTasks } from "@/features/tasks/hooks";
import { TaskEditor } from "@/features/tasks/TaskEditor";
import { PriorityBadge, StatusBadge } from "@/features/tasks/badges";
import type { PublicTask } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/api";
import type { TaskFormValues } from "@/features/tasks/TaskFormFields";

export function TasksPage() {
  const search = useTaskFilterStore((s) => s.search);
  const setSearch = useTaskFilterStore((s) => s.setSearch);
  const status = useTaskFilterStore((s) => s.status);
  const setStatus = useTaskFilterStore((s) => s.setStatus);
  const priority = useTaskFilterStore((s) => s.priority);
  const setPriority = useTaskFilterStore((s) => s.setPriority);
  const sort = useTaskFilterStore((s) => s.sort);
  const order = useTaskFilterStore((s) => s.order);
  const setSort = useTaskFilterStore((s) => s.setSort);
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
  });

  const openCreate = () => {
    setEditing(undefined);
    setEditorOpen(true);
  };

  const submitting = mutations.create.isPending || mutations.update.isPending;

  const filters = useMemo(
    () => (
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Filter by title"
            className="min-h-11"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status ?? "all"} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority ?? "all"}
              onValueChange={(v) => setPriority(v as typeof priority)}
            >
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2 sm:col-span-1">
            <Label>Sort</Label>
            <Select
              value={`${sort}:${order}`}
              onValueChange={(v) => {
                const [s, o] = v.split(":") as [typeof sort, typeof order];
                setSort(s, o);
              }}
            >
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt:desc">Newest</SelectItem>
                <SelectItem value="createdAt:asc">Oldest</SelectItem>
                <SelectItem value="dueDate:asc">Due date</SelectItem>
                <SelectItem value="priority:desc">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    ),
    [draft, status, priority, sort, order, setPriority, setSort, setStatus],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl tracking-tight">Your tasks</h2>
          <p className="text-sm text-muted-foreground">
            Filter, complete, and keep due dates in view.
            {isFetching ? " Updating…" : ""}
          </p>
        </div>
        <Button className="min-h-11 sm:min-h-8" onClick={openCreate}>
          <Plus />
          Create task
        </Button>
      </div>

      {filters}

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
          <div className="hidden md:block overflow-hidden rounded-xl border">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/60">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
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
                      {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "—"}
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      {task.status !== "done" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            mutations.update.mutate(
                              { id: task.id, payload: { status: "done" } },
                              {
                                onSuccess: () => toast.success("Marked as done"),
                                onError: (e) => toast.error(getApiErrorMessage(e)),
                              },
                            )
                          }
                        >
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (!window.confirm("Delete this task?")) return;
                          mutations.remove.mutate(task.id, {
                            onSuccess: () => toast.success("Task deleted"),
                            onError: (e) => toast.error(getApiErrorMessage(e)),
                          });
                        }}
                      >
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <span className="text-sm text-muted-foreground">
                      {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No due date"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.status !== "done" ? (
                      <Button
                        className="min-h-11"
                        variant="outline"
                        onClick={() =>
                          mutations.update.mutate(
                            { id: task.id, payload: { status: "done" } },
                            {
                              onSuccess: () => toast.success("Marked as done"),
                              onError: (e) => toast.error(getApiErrorMessage(e)),
                            },
                          )
                        }
                      >
                        Complete
                      </Button>
                    ) : null}
                    <Button
                      className="min-h-11"
                      variant="outline"
                      onClick={() => {
                        setEditing(task);
                        setEditorOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      className="min-h-11"
                      variant="destructive"
                      onClick={() => {
                        if (!window.confirm("Delete this task?")) return;
                        mutations.remove.mutate(task.id, {
                          onSuccess: () => toast.success("Task deleted"),
                          onError: (e) => toast.error(getApiErrorMessage(e)),
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
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
