import { api } from "@/lib/api";
import type { AnalyticsResponse } from "@/lib/types";

export async function fetchAnalytics() {
  const { data } = await api.get<AnalyticsResponse>("/api/analytics");
  return data;
}
