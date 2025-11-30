"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"
import { SimulatedAuth } from "@/lib/auth/simulated-auth"

export default function CustomerPage() {
  const router = useRouter()

  useEffect(() => {
    const user = SimulatedAuth.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "customer") {
      switch (user.role) {
        case "driver":
          router.push("/driver")
          break
        case "courier_admin":
          router.push("/courier-admin")
          break
        case "super_admin":
          router.push("/super-admin")
          break
        default:
          router.push("/auth/login")
      }
    }
  }, [router])

  const user = SimulatedAuth.getCurrentUser()
  if (!user) return null

  return <CustomerDashboard user={user} profile={user} />
}
