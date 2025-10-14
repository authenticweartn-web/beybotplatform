// Analytics tracking utilities

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
  timestamp: string
}

class Analytics {
  private get isDevelopment() {
    return typeof window !== "undefined" && window.location.hostname === "localhost"
  }

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
    }

    if (this.isDevelopment) {
      console.log("[v0] Analytics Event:", event)
    }

    // In production, send to analytics service
    // Example: Mixpanel, Amplitude, PostHog, etc.
    if (!this.isDevelopment) {
      this.sendToAnalytics(event)
    }
  }

  private sendToAnalytics(event: AnalyticsEvent) {
    // In production, integrate with analytics service
    // Example: mixpanel.track(event.name, event.properties)
    console.log("[v0] Would send to analytics:", event)
  }

  pageView(path: string, properties?: Record<string, any>) {
    this.track("page_view", {
      path,
      ...properties,
    })
  }

  userAction(action: string, properties?: Record<string, any>) {
    this.track("user_action", {
      action,
      ...properties,
    })
  }

  conversion(type: string, value?: number, properties?: Record<string, any>) {
    this.track("conversion", {
      type,
      value,
      ...properties,
    })
  }
}

export const analytics = new Analytics()
