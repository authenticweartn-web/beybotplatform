// Client-side caching utilities

class SimpleCache<T> {
  private cache: Map<string, { data: T; timestamp: number }>
  private ttl: number

  constructor(ttl: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.cache = new Map()
    this.ttl = ttl
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    const isExpired = Date.now() - item.timestamp > this.ttl

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }
}

export const apiCache = new SimpleCache(5 * 60 * 1000) // 5 minutes
