"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, LogOut, User, Package } from "lucide-react"
import { DeliveryList } from "./delivery-list"
import { RouteOptimizer } from "./route-optimizer"
import { DeliveryHistory } from "./delivery-history"
import { NotificationSystem } from "@/components/real-time/notification-system"
import { useRouter } from "next/navigation"

interface DriverDashboardProps {
  user: any
  profile: any
}

export function DriverDashboard({ user, profile }: DriverDashboardProps) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchAssignedPackages()
  }, [])

  const fetchAssignedPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("driver_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error("Error fetching packages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "picked_up":
        return "bg-blue-100 text-blue-800"
      case "in_transit":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const todayDeliveries = packages.filter((pkg: any) => {
    const today = new Date().toDateString()
    const pickupDate = pkg.pickup_date ? new Date(pkg.pickup_date).toDateString() : today
    return pickupDate === today && pkg.status !== "delivered" && pkg.status !== "cancelled"
  })

  const completedToday = packages.filter((pkg: any) => {
    const today = new Date().toDateString()
    const deliveryDate = pkg.delivery_date ? new Date(pkg.delivery_date).toDateString() : null
    return deliveryDate === today && pkg.status === "delivered"
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LogiTrack</h1>
                <p className="text-sm text-gray-600">Driver Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationSystem userId={user.id} userRole={profile.role} />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{profile.full_name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayDeliveries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedToday.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {packages.filter((pkg: any) => pkg.status === "in_transit").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{packages.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="deliveries" className="space-y-6">
          <TabsList>
            <TabsTrigger value="deliveries">Today's Deliveries</TabsTrigger>
            <TabsTrigger value="route">Route Optimizer</TabsTrigger>
            <TabsTrigger value="history">Delivery History</TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries">
            <DeliveryList packages={todayDeliveries} onStatusUpdate={fetchAssignedPackages} driverId={user.id} />
          </TabsContent>

          <TabsContent value="route">
            <RouteOptimizer packages={todayDeliveries} />
          </TabsContent>

          <TabsContent value="history">
            <DeliveryHistory packages={packages} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
