"use client"
import { SuperAdminDashboard } from "@/components/super-admin/super-admin-dashboard"
import { SimulatedAuth } from "@/lib/auth/simulated-auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SuperAdminPage() {
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

        if (currentUser.role !== "super_admin") {
          router.push("/auth/login")
          return
        }

        setUser(currentUser)
        setProfile(currentUser)
      } catch (error) {
        console.error("[v0] SuperAdminPage: Error during authentication:", error)
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

  return <SuperAdminDashboard user={user} profile={profile} />
}
