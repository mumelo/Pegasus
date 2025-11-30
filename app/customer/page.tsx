"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function CustomerPage() {
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
      if (role && role !== "customer") {
        switch (role) {
          case "driver":
            router.push("/driver")
            return
          case "courier_admin":
            router.push("/courier-admin")
            return
          case "super_admin":
            router.push("/super-admin")
            return
        }
      }

      setUser(currentUser)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return null

  return (
    <CustomerDashboard
      user={{
        id: user.id,
        email: user.email || "",
        role: (user.user_metadata as any)?.role || "customer",
        full_name: (user.user_metadata as any)?.full_name || "",
      }}
      profile={{
        id: user.id,
        email: user.email || "",
        role: (user.user_metadata as any)?.role || "customer",
        full_name: (user.user_metadata as any)?.full_name || "",
      }}
    />
  )
}
