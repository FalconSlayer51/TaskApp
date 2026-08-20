import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = {
  message: string;
  onRetry?: () => void;
};

export function QueryError({ message, onRetry }: Props) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Could not load this view</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{message}</span>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry} className="self-start">
            Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
