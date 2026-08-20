import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { FilterFields, FilterSheet } from "@/features/tasks/FilterSheet";
import { listTasks, updateTask } from "@/features/tasks/api";
import { useTaskFilterStore } from "@/features/tasks/taskFilterStore";
import { queryKeys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { PublicTask, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In progress" },
  { id: "done", title: "Done" },
];

export function KanbanPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const status = useTaskFilterStore((s) => s.status);
  const search = useTaskFilterStore((s) => s.search);
  const setSearch = useTaskFilterStore((s) => s.setSearch);
  const priority = useTaskFilterStore((s) => s.priority);
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

  const moveTask = async (task: PublicTask, nextStatus: TaskStatus) => {
    if (nextStatus === task.status) return;
    const previous = task.status;
    setOptimistic((current) => ({ ...current, [task.id]: nextStatus }));
    try {
      await updateTask(task.id, { status: nextStatus });
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
    const column = columns.find(
      (c) => c.id === overId || grouped[c.id].some((t) => t.id === overId),
    );
    if (!column) return;
    await moveTask(task, column.id);
  };

  const visibleColumns = columns.filter((col) => status === "all" || status === col.id);

  const board = (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
      {visibleColumns.map((col) => (
        <KanbanColumn
          key={col.id}
          id={col.id}
          title={col.title}
          tasks={grouped[col.id]}
          draggable={!isMobile}
          onStatusChange={isMobile ? moveTask : undefined}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <h2 className="text-2xl tracking-tight">Board</h2>
        <p className="text-sm text-muted-foreground">Drag a card to change status.</p>
      </div>
      <p className="text-sm text-muted-foreground md:hidden">
        Swipe columns, then set status on a card.
      </p>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex items-end gap-2 md:min-w-0 md:flex-1">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="board-search">Search</Label>
            <Input
              id="board-search"
              className="min-h-11"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Filter by title"
            />
          </div>
          <FilterSheet showSort={false} />
        </div>
        <div className="hidden min-w-0 flex-1 md:block">
          <FilterFields showSort={false} />
        </div>
      </div>

      {query.isLoading ? <KanbanSkeleton /> : null}
      {query.isError ? (
        <QueryError message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : null}
      {!query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState
          headline="The board is empty"
          description={
            isMobile
              ? "Create a task, then change its status from the card."
              : "Create a task, then drag it across Todo, In progress, and Done."
          }
          actionLabel="Create task"
          onAction={() => navigate("/tasks")}
        />
      ) : null}

      {!query.isLoading && items.length > 0 ? (
        isMobile ? (
          board
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            {board}
            <DragOverlay>{active ? <TaskCard task={active} overlay /> : null}</DragOverlay>
          </DndContext>
        )
      ) : null}
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  tasks,
  draggable,
  onStatusChange,
}: {
  id: TaskStatus;
  title: string;
  tasks: PublicTask[];
  draggable: boolean;
  onStatusChange?: (task: PublicTask, status: TaskStatus) => void;
}) {
  const className =
    "w-[min(85vw,20rem)] shrink-0 snap-start rounded-xl border bg-muted/40 p-3 md:w-auto md:min-w-[280px] md:flex-1";

  const body = (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) =>
          draggable ? (
            <DraggableCard key={task.id} task={task} />
          ) : (
            <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
          ),
        )}
      </div>
    </>
  );

  if (!draggable) {
    return <div className={className}>{body}</div>;
  }

  return (
    <DroppableColumn id={id} className={className}>
      {body}
    </DroppableColumn>
  );
}

function DroppableColumn({
  id,
  className,
  children,
}: {
  id: TaskStatus;
  className: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "ring-2 ring-primary/40")}>
      {children}
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

function TaskCard({
  task,
  overlay,
  onStatusChange,
}: {
  task: PublicTask;
  overlay?: boolean;
  onStatusChange?: (task: PublicTask, status: TaskStatus) => void;
}) {
  return (
    <Card className={cn(overlay && "rotate-1 shadow-lg")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm leading-snug">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {onStatusChange ? null : <StatusBadge status={task.status} />}
          <PriorityBadge priority={task.priority} />
          {task.dueDate ? (
            <span className="text-xs text-muted-foreground">
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          ) : null}
        </div>
        {onStatusChange ? (
          <Select
            value={task.status}
            onValueChange={(value) => onStatusChange(task, value as TaskStatus)}
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
        ) : null}
      </CardContent>
    </Card>
  );
}
