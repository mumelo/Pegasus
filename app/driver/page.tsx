"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DriverDashboard } from "@/components/driver/driver-dashboard"
import { SimulatedAuth } from "@/lib/auth/simulated-auth"

export default function DriverPage() {
  const router = useRouter()

  useEffect(() => {
    const user = SimulatedAuth.getCurrentUser()
    if (!user || user.role !== "driver") {
      router.push("/auth/login")
    }
  }, [router])

  const user = SimulatedAuth.getCurrentUser()
  if (!user || user.role !== "driver") return null

  return <DriverDashboard user={user} profile={user} />
}
