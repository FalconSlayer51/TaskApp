import axios, { isAxiosError } from "axios";
import type { ApiErrorBody } from "@/lib/types";

const baseURL = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError<ApiErrorBody>(error)) return {};
  const list = error.response?.data?.errors ?? [];
  return Object.fromEntries(list.map((item) => [item.path, item.message]));
}
