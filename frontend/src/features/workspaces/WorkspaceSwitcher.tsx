import { useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentWorkspace } from "@/features/workspaces/hooks";
import { useWorkspaceStore } from "@/features/workspaces/workspaceStore";
import { queryClient } from "@/lib/queryClient";

export function WorkspaceSwitcher({ compact = false }: { compact?: boolean }) {
  const { current, items, isLoading } = useCurrentWorkspace();
  const setCurrentWorkspaceId = useWorkspaceStore((s) => s.setCurrentWorkspaceId);

  useEffect(() => {
    if (current && useWorkspaceStore.getState().currentWorkspaceId !== current.id) {
      setCurrentWorkspaceId(current.id);
    }
  }, [current, setCurrentWorkspaceId]);

  if (isLoading || !current) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={
            compact
              ? "min-h-11 max-w-[9rem] justify-between gap-1 px-2 md:min-h-8 md:max-w-[12rem]"
              : "min-h-11 w-full justify-between"
          }
        >
          <span className="truncate">{current.name}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {items.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => {
              setCurrentWorkspaceId(workspace.id);
              void queryClient.invalidateQueries();
            }}
          >
            <span className="truncate">{workspace.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">{workspace.role}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
