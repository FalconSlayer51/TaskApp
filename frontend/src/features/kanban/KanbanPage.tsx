import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { KanbanSkeleton } from "@/components/PageSkeleton";
import { PriorityBadge, StatusBadge } from "@/features/tasks/badges";
import { listTasks, updateTask } from "@/features/tasks/api";
import { useTaskFilterStore } from "@/features/tasks/taskFilterStore";
import { queryKeys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { PublicTask, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In progress" },
  { id: "done", title: "Done" },
];

export function KanbanPage() {
  const navigate = useNavigate();
  const status = useTaskFilterStore((s) => s.status);
  const setStatus = useTaskFilterStore((s) => s.setStatus);
  const priority = useTaskFilterStore((s) => s.priority);
  const setPriority = useTaskFilterStore((s) => s.setPriority);
  const search = useTaskFilterStore((s) => s.search);
  const setSearch = useTaskFilterStore((s) => s.setSearch);
  const [draft, setDraft] = useState(search);
  useEffect(() => {
    const id = window.setTimeout(() => setSearch(draft), 250);
    return () => window.clearTimeout(id);
  }, [draft, setSearch]);
  const [active, setActive] = useState<PublicTask | null>(null);
  const [optimistic, setOptimistic] = useState<Record<string, TaskStatus>>({});

  const params = {
    status: status === "all" ? undefined : status,
    priority: priority === "all" ? undefined : priority,
    search: search.trim() || undefined,
    limit: 200,
    page: 1,
    sort: "createdAt" as const,
    order: "desc" as const,
  };

  const query = useQuery({
    queryKey: queryKeys.tasks(params, 1, 200),
    queryFn: () => listTasks(params),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const items = useMemo(() => {
    return (query.data?.items ?? []).map((task) =>
      optimistic[task.id] ? { ...task, status: optimistic[task.id] } : task,
    );
  }, [query.data?.items, optimistic]);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, PublicTask[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const task of items) map[task.status].push(task);
    return map;
  }, [items]);

  const onDragStart = (event: DragStartEvent) => {
    const task = items.find((t) => t.id === event.active.id);
    setActive(task ?? null);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActive(null);
    const overId = event.over?.id;
    if (!overId) return;
    const task = items.find((t) => t.id === event.active.id);
    if (!task) return;
    const column = columns.find((c) => c.id === overId || grouped[c.id].some((t) => t.id === overId));
    if (!column || column.id === task.status) return;

    const previous = task.status;
    setOptimistic((current) => ({ ...current, [task.id]: column.id }));
    try {
      await updateTask(task.id, { status: column.id });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics() }),
      ]);
      toast.success("Moved task");
    } catch (error) {
      setOptimistic((current) => ({ ...current, [task.id]: previous }));
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl tracking-tight">Board</h2>
        <p className="text-sm text-muted-foreground">Drag a card to change status.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="board-search">Search</Label>
          <Input
            id="board-search"
            className="min-h-11"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Filter by title"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:w-80">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status ?? "all"} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All columns</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority ?? "all"} onValueChange={(v) => setPriority(v as typeof priority)}>
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
        </div>
      </div>

      {query.isLoading ? <KanbanSkeleton /> : null}
      {query.isError ? (
        <QueryError message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : null}
      {!query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState
          headline="The board is empty"
          description="Create a task, then drag it across Todo, In progress, and Done."
          actionLabel="Create task"
          onAction={() => navigate("/tasks")}
        />
      ) : null}

      {!query.isLoading && items.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {columns
              .filter((col) => status === "all" || status === col.id)
              .map((col) => (
                <KanbanColumn key={col.id} id={col.id} title={col.title} tasks={grouped[col.id]} />
              ))}
          </div>
          <DragOverlay>
            {active ? <TaskCard task={active} overlay /> : null}
          </DragOverlay>
        </DndContext>
      ) : null}
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  tasks,
}: {
  id: TaskStatus;
  title: string;
  tasks: PublicTask[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-w-[280px] flex-1 snap-start rounded-xl border bg-muted/40 p-3",
        isOver && "ring-2 ring-primary/40",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ task }: { task: PublicTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(isDragging && "opacity-40")}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task, overlay }: { task: PublicTask; overlay?: boolean }) {
  return (
    <Card className={cn(overlay && "rotate-1 shadow-lg")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm leading-snug">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {task.dueDate ? (
          <span className="text-xs text-muted-foreground">{format(new Date(task.dueDate), "MMM d")}</span>
        ) : null}
      </CardContent>
    </Card>
  );
}
