import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  headline: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({
  headline,
  description,
  actionLabel,
  onAction,
  icon,
}: Props) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed bg-card px-6 py-12">
      {icon}
      <h2 className="text-xl font-medium tracking-tight">{headline}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </div>
  );
}
