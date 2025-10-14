import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip auth checks for internal and public paths
  if (path.startsWith("/_vercel") || path.startsWith("/api/") || path.startsWith("/_next")) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Middleware - Path:", path, "User:", user?.email || "none")

    const isAuthPage = path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/auth")
    const isPublicPage = path === "/" || isAuthPage

    // Redirect authenticated users away from auth pages
    if (user && isAuthPage) {
      console.log("[v0] Middleware - Redirecting authenticated user to dashboard")
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    // Redirect unauthenticated users to login (except for public routes)
    if (!user && !isPublicPage) {
      console.log("[v0] Middleware - Redirecting unauthenticated user to login")
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", path)
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    return supabaseResponse
  }
}
