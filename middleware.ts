import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for Vercel internal paths, API routes, and static files
  if (path.startsWith("/_vercel") || path.startsWith("/api/") || path.startsWith("/_next") || path.includes(".")) {
    return
  }

  console.log("[v0] Middleware triggered for:", path)
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (Vercel internal paths)
     * - api (API routes)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|_vercel|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
}
