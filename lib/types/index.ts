// Core domain types for the BeyBot platform

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface DashboardMetrics {
  totalConversations: number
  conversationsChange: number
  ordersGenerated: number
  ordersChange: number
  conversionRate: number
  conversionChange: number
  totalRevenue: number
  revenueChange: number
}

export interface ConversationData {
  date: string
  conversations: number
  orders: number
}

export interface RevenueData {
  month: string
  revenue: number
}

export interface Activity {
  id: string
  type: "order" | "conversation"
  customer: string
  message: string
  amount?: string
  time: string
  createdAt: string
}

export interface Conversation {
  id: string
  customerId: string
  customerName: string
  customerAvatar?: string
  status: "active" | "pending" | "resolved"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  sender: "agent" | "customer"
  content: string
  timestamp: string
  read: boolean
}

export interface Order {
  id: string
  orderNumber: string
  customer: string
  items: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  date: string
  createdAt: string
  updatedAt: string
}

export interface OrderDetails extends Order {
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  products: OrderProduct[]
  subtotal: number
  shipping: number
  tax: number
}

export interface OrderProduct {
  id: string
  name: string
  quantity: number
  price: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image: string
  sku: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface AgentConfig {
  id: string
  systemPrompt: string
  language: "ar" | "fr" | "en"
  tone: "professional" | "friendly" | "casual"
  personality: string
  productKnowledge: string[]
  autoRespond: boolean
  orderConfirmation: boolean
  followUp: boolean
  escalation: boolean
  updatedAt: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  conversationLimit: number
  current?: boolean
}

export interface BillingHistory {
  id: string
  date: string
  amount: number
  status: "paid" | "pending" | "failed"
  invoice: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
