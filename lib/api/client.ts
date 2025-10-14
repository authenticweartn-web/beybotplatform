import type { ApiResponse, ApiError } from "@/lib/types"
import { logger } from "@/lib/monitoring/logger"
import { performanceMonitor } from "@/lib/monitoring/performance"

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const startTime = performance.now()

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    }

    try {
      const response = await fetch(url, config)
      const duration = performance.now() - startTime

      // Track API performance
      performanceMonitor.measureApiCall(endpoint, duration, response.status)

      if (!response.ok) {
        const error: ApiError = await response.json()
        logger.error(`API Error: ${endpoint}`, undefined, {
          status: response.status,
          error: error.message,
        })
        throw new ApiClientError(error.message, response.status, error)
      }

      logger.debug(`API Success: ${endpoint}`, {
        status: response.status,
        duration: `${duration.toFixed(2)}ms`,
      })

      return await response.json()
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error
      }

      logger.error("Network error occurred", error as Error, { endpoint })
      throw new ApiClientError("Network error occurred", 0, {
        message: "Failed to connect to server",
        code: "NETWORK_ERROR",
      })
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public error: ApiError,
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

export const apiClient = new ApiClient()
