import { api } from "@/lib/api";
import type { DirectoryUser, PublicMember, PublicWorkspace } from "@/lib/types";

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

export async function listDirectory(workspaceId: string) {
  const { data } = await api.get<{ items: DirectoryUser[] }>(
    `/api/workspaces/${workspaceId}/directory`,
  );
  return data.items;
}

export async function inviteMember(workspaceId: string, payload: { userId: string } | { email: string }) {
  const { data } = await api.post<{ member: PublicMember }>(
    `/api/workspaces/${workspaceId}/invites`,
    payload,
  );
  return data.member;
}

export async function removeMember(workspaceId: string, userId: string) {
  await api.delete(`/api/workspaces/${workspaceId}/members/${userId}`);
}
