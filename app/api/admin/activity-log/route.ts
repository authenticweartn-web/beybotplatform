import { NextResponse } from "next/server"
import { withAdmin } from "@/lib/api/middleware"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  return withAdmin(async (user) => {
    try {
      const supabase = await createClient()

      const { data: logs, error } = await supabase
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) {
        console.error("[v0] Error fetching activity logs:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch activity logs" }, { status: 500 })
      }

      if (logs && logs.length > 0) {
        const adminIds = [...new Set(logs.map((log) => log.admin_id).filter(Boolean))]
        const targetUserIds = [...new Set(logs.map((log) => log.target_user_id).filter(Boolean))]
        const allUserIds = [...new Set([...adminIds, ...targetUserIds])]

        const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", allUserIds)

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

        const enrichedLogs = logs.map((log) => ({
          ...log,
          admin: profileMap.get(log.admin_id) || { full_name: "Unknown", email: "N/A" },
          target_user: log.target_user_id ? profileMap.get(log.target_user_id) || null : null,
        }))

        return NextResponse.json({
          success: true,
          data: enrichedLogs,
        })
      }

      return NextResponse.json({
        success: true,
        data: [],
      })
    } catch (error) {
      console.error("[v0] Admin activity log API error:", error)
      return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: Request) {
  return withAdmin(async (user) => {
    try {
      const body = await request.json()
      const { action, targetUserId, details } = body

      const supabase = await createClient()

      const { error } = await supabase.from("admin_activity_log").insert({
        admin_id: user.id,
        action,
        target_user_id: targetUserId,
        details,
      })

      if (error) {
        console.error("[v0] Error logging admin activity:", error)
        return NextResponse.json({ success: false, message: "Failed to log activity" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Activity logged successfully",
      })
    } catch (error) {
      console.error("[v0] Admin activity log POST error:", error)
      return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
  })
}
