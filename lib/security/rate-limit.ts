// Rate limiting utilities for API routes

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitStore {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitStore>()

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (identifier: string): { success: boolean; remaining: number; reset: number } => {
      const now = Date.now()
      const store = rateLimitStore.get(identifier)

      if (!store || now > store.resetTime) {
        // Create new or reset expired entry
        rateLimitStore.set(identifier, {
          count: 1,
          resetTime: now + config.interval,
        })
        return {
          success: true,
          remaining: config.uniqueTokenPerInterval - 1,
          reset: now + config.interval,
        }
      }

      if (store.count >= config.uniqueTokenPerInterval) {
        return {
          success: false,
          remaining: 0,
          reset: store.resetTime,
        }
      }

      store.count++
      return {
        success: true,
        remaining: config.uniqueTokenPerInterval - store.count,
        reset: store.resetTime,
      }
    },
  }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute
