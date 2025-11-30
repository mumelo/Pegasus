"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CourierAdminDashboard } from "@/components/courier-admin/courier-admin-dashboard"
import { SimulatedAuth } from "@/lib/auth/simulated-auth"

export default function CourierAdminPage() {
  const router = useRouter()

  useEffect(() => {
    const user = SimulatedAuth.getCurrentUser()
    if (!user || user.role !== "courier_admin") {
      router.push("/auth/login")
    }
  }, [router])

  const user = SimulatedAuth.getCurrentUser()
  if (!user || user.role !== "courier_admin") return null

  return <CourierAdminDashboard user={user} profile={user} />
}
