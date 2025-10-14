// Error reporting utility

interface ErrorReport {
  message: string
  stack?: string
  componentStack?: string
  userId?: string
  url: string
  userAgent: string
  timestamp: string
  context?: Record<string, any>
}

class ErrorReporter {
  private isDevelopment = process.env.NODE_ENV === "development"

  report(error: Error, context?: Record<string, any>) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      timestamp: new Date().toISOString(),
      context,
    }

    if (this.isDevelopment) {
      console.error("[v0] Error Report:", report)
    }

    // In production, send to error tracking service
    if (!this.isDevelopment) {
      this.sendToErrorTracking(report)
    }
  }

  private sendToErrorTracking(report: ErrorReport) {
    // In production, integrate with error tracking service
    // Example: Sentry.captureException(report)
    console.log("[v0] Would send error report:", report)
  }
}

export const errorReporter = new ErrorReporter()
