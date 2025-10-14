"use client"

// Custom hook for analytics tracking

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { analytics } from "@/lib/monitoring/analytics"

export function usePageTracking() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      analytics.pageView(pathname)
    }
  }, [pathname])
}

export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    pageView: analytics.pageView.bind(analytics),
    userAction: analytics.userAction.bind(analytics),
    conversion: analytics.conversion.bind(analytics),
  }
}
