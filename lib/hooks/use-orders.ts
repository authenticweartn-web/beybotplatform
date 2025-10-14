// Custom hooks for orders

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { QUERY_KEYS } from "@/lib/constants"
import type { Order, OrderDetails } from "@/lib/types"

export function useOrders(status?: string, search?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, status, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status && status !== "all") params.append("status", status)
      if (search) params.append("search", search)
      const queryString = params.toString()
      const response = await apiClient.get<Order[]>(`/orders${queryString ? `?${queryString}` : ""}`)
      return response.data
    },
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER_DETAIL(id),
    queryFn: async () => {
      const response = await apiClient.get<OrderDetails>(`/orders/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}
