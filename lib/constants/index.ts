// Application constants

export const APP_NAME = "BeyBot"
export const APP_DESCRIPTION = "AI-Powered Sales Agents for E-commerce"

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  DASHBOARD: {
    METRICS: "/dashboard/metrics",
    ACTIVITY: "/dashboard/activity",
    CHARTS: "/dashboard/charts",
  },
  CONVERSATIONS: {
    LIST: "/conversations",
    DETAIL: (id: string) => `/conversations/${id}`,
    MESSAGES: (id: string) => `/conversations/${id}/messages`,
  },
  ORDERS: {
    LIST: "/orders",
    DETAIL: (id: string) => `/orders/${id}`,
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
  AGENT: {
    CONFIG: "/agent/config",
    UPDATE: "/agent/config",
  },
} as const

export const QUERY_KEYS = {
  AUTH: ["auth"],
  DASHBOARD_METRICS: ["dashboard", "metrics"],
  DASHBOARD_ACTIVITY: ["dashboard", "activity"],
  DASHBOARD_CHARTS: ["dashboard", "charts"],
  CONVERSATIONS: ["conversations"],
  CONVERSATION_DETAIL: (id: string) => ["conversations", id],
  ORDERS: ["orders"],
  ORDER_DETAIL: (id: string) => ["orders", id],
  PRODUCTS: ["products"],
  PRODUCT_DETAIL: (id: string) => ["products", id],
  AGENT_CONFIG: ["agent", "config"],
} as const

export const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-500",
  processing: "bg-blue-500/20 text-blue-500",
  shipped: "bg-purple-500/20 text-purple-500",
  delivered: "bg-green-500/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-500",
} as const

export const CONVERSATION_STATUS_COLORS = {
  active: "bg-green-500/20 text-green-500",
  pending: "bg-yellow-500/20 text-yellow-500",
  resolved: "bg-gray-500/20 text-gray-500",
} as const
