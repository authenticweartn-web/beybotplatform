"use client"

// Component for tracking page views

import { usePageTracking } from "@/lib/hooks/use-analytics"

export function PageTracker() {
  usePageTracking()
  return null
}
