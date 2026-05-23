import { api } from "../../lib/api";
import type { DashboardOverview } from "../../types/dashboard";

export async function fetchDashboardOverview() {
  const response = await api.get<{ success: boolean; data: DashboardOverview }>("/api/dashboard/overview");

  return response.data.data;
}
