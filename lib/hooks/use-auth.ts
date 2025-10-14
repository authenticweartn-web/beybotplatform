"use client"

import { create } from "zustand"
import type { User } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),
  logout: async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      set({ user: null, isAuthenticated: false })
      window.location.href = "/login"
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  },
  checkAuth: async () => {
    try {
      const supabase = createClient()
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser()

      if (error || !authUser) {
        console.log("[v0] No authenticated user")
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

      const user: User = profile
        ? {
            id: profile.id,
            email: profile.email,
            name: profile.full_name || profile.email.split("@")[0],
            role: profile.role || "user",
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          }
        : {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.full_name || authUser.email!.split("@")[0],
            role: "user",
            createdAt: authUser.created_at,
            updatedAt: authUser.updated_at || authUser.created_at,
          }

      console.log("[v0] User authenticated:", user.email)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      console.error("[v0] Check auth error:", error)
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

export function useAuth() {
  return useAuthStore()
}
