// Custom hooks for dashboard data fetching

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { QUERY_KEYS } from "@/lib/constants"
import type { DashboardMetrics, ConversationData, RevenueData, Activity } from "@/lib/types"

export function useDashboardMetrics() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_METRICS,
    queryFn: async () => {
      const response = await apiClient.get<DashboardMetrics>("/dashboard/metrics")
      return response.data
    },
  })
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_CHARTS,
    queryFn: async () => {
      const response = await apiClient.get<{
        conversationData: ConversationData[]
        revenueData: RevenueData[]
      }>("/dashboard/charts")
      return response.data
    },
  })
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_ACTIVITY,
    queryFn: async () => {
      const response = await apiClient.get<Activity[]>("/dashboard/activity")
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}
