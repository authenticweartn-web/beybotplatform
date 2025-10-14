// Centralized logging utility

type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
}

class Logger {
  private get isDevelopment() {
    return typeof window !== "undefined" && window.location.hostname === "localhost"
  }

  private formatMessage(entry: LogEntry): string {
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    // In development, log to console
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(entry)
      switch (level) {
        case "error":
          console.error(formattedMessage, context)
          break
        case "warn":
          console.warn(formattedMessage, context)
          break
        case "debug":
          console.debug(formattedMessage, context)
          break
        default:
          console.log(formattedMessage, context)
      }
    }

    // In production, send to monitoring service
    // Example: Sentry, LogRocket, Datadog, etc.
    if (!this.isDevelopment && level === "error") {
      this.sendToMonitoring(entry)
    }
  }

  private sendToMonitoring(entry: LogEntry) {
    // In production, integrate with monitoring service
    // Example: Sentry.captureException(entry)
    console.log("[v0] Would send to monitoring:", entry)
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context)
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log("error", message, {
      ...context,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    })
  }

  debug(message: string, context?: Record<string, any>) {
    this.log("debug", message, context)
  }
}

export const logger = new Logger()
