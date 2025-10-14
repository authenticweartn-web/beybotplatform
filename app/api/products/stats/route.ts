import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get total products count
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Get in-stock products (stock > 10)
    const { count: inStock } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gt("stock", 10)

    // Get low-stock products (stock between 1 and 10)
    const { count: lowStock } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gt("stock", 0)
      .lte("stock", 10)

    // Get out-of-stock products (stock = 0)
    const { count: outOfStock } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("stock", 0)

    return NextResponse.json({
      success: true,
      data: {
        total: totalProducts || 0,
        inStock: inStock || 0,
        lowStock: lowStock || 0,
        outOfStock: outOfStock || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Get product stats error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
