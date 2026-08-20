import { api } from "@/lib/api";
import type { PublicUser } from "@/lib/types";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const { data } = await api.post<{ token: string; user: PublicUser }>(
    "/api/auth/register",
    payload,
  );
  return data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const { data } = await api.post<{ token: string; user: PublicUser }>(
    "/api/auth/login",
    payload,
  );
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<{ user: PublicUser }>("/api/auth/me");
  return data.user;
}

export async function updateMe(payload: { name: string }) {
  const { data } = await api.patch<{ user: PublicUser }>("/api/auth/me", payload);
  return data.user;
}
