// Custom hooks for AI agent configuration

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { QUERY_KEYS } from "@/lib/constants"
import type { AgentConfig } from "@/lib/types"
import type { AgentConfigInput } from "@/lib/validations/agent"
import { toast } from "sonner"

export function useAgentConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.AGENT_CONFIG,
    queryFn: async () => {
      const response = await apiClient.get<AgentConfig>("/agent/config")
      return response.data
    },
  })
}

export function useUpdateAgentConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AgentConfigInput) => {
      const response = await apiClient.put<AgentConfig>("/agent/config", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENT_CONFIG })
      toast.success("Configuration updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.error?.message || "Failed to update configuration")
    },
  })
}
