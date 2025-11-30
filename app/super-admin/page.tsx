"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SuperAdminDashboard } from "@/components/super-admin/super-admin-dashboard"
import { SimulatedAuth } from "@/lib/auth/simulated-auth"

export default function SuperAdminPage() {
  const router = useRouter()

  useEffect(() => {
    const user = SimulatedAuth.getCurrentUser()
    if (!user || user.role !== "super_admin") {
      router.push("/auth/login")
    }
  }, [router])

  const user = SimulatedAuth.getCurrentUser()
  if (!user || user.role !== "super_admin") return null

  return <SuperAdminDashboard user={user} profile={user} />
}
