"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SuperAdminDashboard } from "@/components/super-admin/super-admin-dashboard"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function SuperAdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      const role = (currentUser.user_metadata as any)?.role
      if (role !== "super_admin") {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return null

  return (
    <SuperAdminDashboard
      user={{
        id: user.id,
        email: user.email || "",
        role: "super_admin",
        full_name: (user.user_metadata as any)?.full_name || "",
      }}
      profile={{
        id: user.id,
        email: user.email || "",
        role: "super_admin",
        full_name: (user.user_metadata as any)?.full_name || "",
      }}
    />
  )
}
