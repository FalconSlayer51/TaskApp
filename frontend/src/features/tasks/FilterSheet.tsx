import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTaskFilterStore } from "@/features/tasks/taskFilterStore";
import { cn } from "@/lib/utils";

type Props = {
  showSort?: boolean;
  className?: string;
};

export function FilterFields({ showSort = true, className }: Props) {
  const status = useTaskFilterStore((s) => s.status);
  const setStatus = useTaskFilterStore((s) => s.setStatus);
  const priority = useTaskFilterStore((s) => s.priority);
  const setPriority = useTaskFilterStore((s) => s.setPriority);
  const sort = useTaskFilterStore((s) => s.sort);
  const order = useTaskFilterStore((s) => s.order);
  const setSort = useTaskFilterStore((s) => s.setSort);

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", showSort && "lg:grid-cols-3", className)}>
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
      {showSort ? (
        <div className="space-y-2">
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
      ) : null}
    </div>
  );
}

export function FilterSheet({ showSort = true }: Props) {
  const [open, setOpen] = useState(false);
  const status = useTaskFilterStore((s) => s.status);
  const priority = useTaskFilterStore((s) => s.priority);
  const active =
    (status && status !== "all" ? 1 : 0) + (priority && priority !== "all" ? 1 : 0);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 md:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal />
        Filters
        {active > 0 ? (
          <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
            {active}
          </span>
        ) : null}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[90dvh] overflow-y-auto"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <FilterFields showSort={showSort} />
            <Button className="mt-6 min-h-11 w-full" onClick={() => setOpen(false)}>
              Show results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
