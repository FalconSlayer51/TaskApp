import { MemberAvatar } from "@/features/workspaces/MemberAvatar";
import { useMembers } from "@/features/workspaces/hooks";
import { useWorkspaceStore } from "@/features/workspaces/workspaceStore";

export function AssigneeLabel({ assigneeId }: { assigneeId: string | null }) {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const members = useMembers(workspaceId);
  if (!assigneeId) {
    return <span className="text-sm text-muted-foreground">Unassigned</span>;
  }
  const member = (members.data ?? []).find((m) => m.id === assigneeId);
  if (!member) {
    return <span className="text-sm text-muted-foreground">Assigned</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <MemberAvatar name={member.name} />
      <span className="truncate">{member.name}</span>
    </span>
  );
}
