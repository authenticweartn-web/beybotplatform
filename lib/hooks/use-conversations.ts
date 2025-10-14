// Custom hooks for conversations

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { QUERY_KEYS } from "@/lib/constants"
import type { Conversation } from "@/lib/types"

export function useConversations(status?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONVERSATIONS, status],
    queryFn: async () => {
      const params = status && status !== "all" ? `?status=${status}` : ""
      const response = await apiClient.get<Conversation[]>(`/conversations${params}`)
      return response.data
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CONVERSATION_DETAIL(id),
    queryFn: async () => {
      const response = await apiClient.get<Conversation>(`/conversations/${id}`)
      return response.data
    },
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  })
}
