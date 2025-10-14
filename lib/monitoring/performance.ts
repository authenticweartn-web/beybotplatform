// Performance monitoring utilities

interface PerformanceMetric {
  name: string
  value: number
  unit: "ms" | "bytes" | "count"
  timestamp: string
  context?: Record<string, any>
}

class PerformanceMonitor {
  private isDevelopment = process.env.NODE_ENV === "development"
  private metrics: Map<string, number> = new Map()

  startTimer(name: string) {
    this.metrics.set(name, performance.now())
  }

  endTimer(name: string, context?: Record<string, any>) {
    const startTime = this.metrics.get(name)
    if (!startTime) {
      console.warn(`[v0] Timer "${name}" was not started`)
      return
    }

    const duration = performance.now() - startTime
    this.metrics.delete(name)

    this.recordMetric({
      name,
      value: duration,
      unit: "ms",
      timestamp: new Date().toISOString(),
      context,
    })
  }

  recordMetric(metric: PerformanceMetric) {
    if (this.isDevelopment) {
      console.log(`[v0] Performance Metric: ${metric.name} = ${metric.value}${metric.unit}`, metric.context)
    }

    // In production, send to monitoring service
    if (!this.isDevelopment) {
      this.sendToMonitoring(metric)
    }
  }

  private sendToMonitoring(metric: PerformanceMetric) {
    // In production, integrate with monitoring service
    // Example: Datadog, New Relic, etc.
    console.log("[v0] Would send performance metric:", metric)
  }

  measureApiCall(endpoint: string, duration: number, status: number) {
    this.recordMetric({
      name: "api_call",
      value: duration,
      unit: "ms",
      timestamp: new Date().toISOString(),
      context: {
        endpoint,
        status,
      },
    })
  }

  measureComponentRender(componentName: string, duration: number) {
    this.recordMetric({
      name: "component_render",
      value: duration,
      unit: "ms",
      timestamp: new Date().toISOString(),
      context: {
        component: componentName,
      },
    })
  }
}

export const performanceMonitor = new PerformanceMonitor()
