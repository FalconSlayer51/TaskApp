import { api } from "@/lib/api";
import type { PublicMember, PublicWorkspace } from "@/lib/types";

export async function listWorkspaces() {
  const { data } = await api.get<{ items: PublicWorkspace[] }>("/api/workspaces");
  return data.items;
}

export async function listMembers(workspaceId: string) {
  const { data } = await api.get<{ items: PublicMember[] }>(
    `/api/workspaces/${workspaceId}/members`,
  );
  return data.items;
}

export async function inviteMember(workspaceId: string, email: string) {
  const { data } = await api.post<{ member: PublicMember }>(
    `/api/workspaces/${workspaceId}/invites`,
    { email },
  );
  return data.member;
}

export async function removeMember(workspaceId: string, userId: string) {
  await api.delete(`/api/workspaces/${workspaceId}/members/${userId}`);
}
