import { Badge } from "@/components/ui/badge";
import type { TaskPriority, TaskStatus } from "@/lib/types";

const statusLabel: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
};

const priorityLabel: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={status === "done" ? "default" : "secondary"}>
      {statusLabel[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant={priority === "high" ? "outline" : "ghost"}>
      {priorityLabel[priority]}
    </Badge>
  );
}
