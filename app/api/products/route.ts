import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data: products, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: products || [],
    })
  } catch (error) {
    console.error("[v0] Get products error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        category: body.category,
        image_url: body.image_url,
        sku: body.sku,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("[v0] Create product error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
