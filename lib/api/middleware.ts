// API middleware utilities

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/security/rate-limit"
import { getCurrentUser } from "@/lib/auth/session"
import type { User } from "@/lib/types"

// Rate limiter for API routes
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // 100 requests per minute
})

export async function withRateLimit(request: NextRequest, handler: () => Promise<NextResponse>): Promise<NextResponse> {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown"
  const result = limiter.check(ip)

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.reset.toString(),
        },
      },
    )
  }

  const response = await handler()

  // Add rate limit headers to response
  response.headers.set("X-RateLimit-Limit", "100")
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", result.reset.toString())

  return response
}

export async function withAuth(handler: (user: User) => Promise<NextResponse>): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    )
  }

  return handler(user)
}

export async function withAdmin(handler: (user: User) => Promise<NextResponse>): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    )
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden - Admin access required",
      },
      { status: 403 },
    )
  }

  return handler(user)
}
