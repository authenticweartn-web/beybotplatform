// Get current user API route

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
