import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskFormFields, type TaskFormValues } from "@/features/tasks/TaskFormFields";
import type { PublicTask } from "@/lib/types";

type Props = {
  open: boolean;
  task?: PublicTask;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

export function TaskEditor({ open, task, submitting, onOpenChange, onSubmit }: Props) {
  const isMobile = useIsMobile();
  const title = task ? "Edit task" : "Create task";
  const fields = (
    <TaskFormFields
      key={task?.id ?? "new"}
      task={task}
      submitting={submitting}
      onSubmit={onSubmit}
      onCancel={() => onOpenChange(false)}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[90dvh] overflow-y-auto"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">{fields}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {fields}
      </DialogContent>
    </Dialog>
  );
}
