"use client"

import { CustomerDashboard } from "@/components/customer/customer-dashboard"
import { SimulatedAuth } from "@/lib/auth/simulated-auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CustomerPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = SimulatedAuth.getUser()

        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        if (currentUser.role !== "customer") {
          router.push("/auth/login")
          return
        }

        setUser(currentUser)
        setProfile(currentUser)
      } catch (error) {
        console.error("[v0] CustomerPage: Error during authentication:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return <CustomerDashboard user={user} profile={profile} />
}
