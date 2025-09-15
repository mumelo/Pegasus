"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, LogOut, User, Package, Users, TrendingUp } from "lucide-react"
import { PackageManagement } from "./package-management"
import { DriverManagement } from "./driver-management"
import { CompanyAnalytics } from "./company-analytics"
import { useRouter } from "next/navigation"

interface CourierAdminDashboardProps {
  user: any
  profile: any
}

export function CourierAdminDashboard({ user, profile }: CourierAdminDashboardProps) {
  const [packages, setPackages] = useState([])
  const [drivers, setDrivers] = useState([])
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch company packages
      const { data: packagesData, error: packagesError } = await supabase
        .from("packages")
        .select("*")
        .eq("courier_company_id", profile.company_id)
        .order("created_at", { ascending: false })

      if (packagesError) throw packagesError

      // Fetch company drivers
      const { data: driversData, error: driversError } = await supabase
        .from("profiles")
        .select("*")
        .eq("company_id", profile.company_id)
        .eq("role", "driver")

      if (driversError) throw driversError

      // Fetch company info
      const { data: companyData, error: companyError } = await supabase
        .from("courier_companies")
        .select("*")
        .eq("id", profile.company_id)
        .single()

      if (companyError) throw companyError

      setPackages(packagesData || [])
      setDrivers(driversData || [])
      setCompany(companyData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const todayPackages = packages.filter((pkg: any) => {
    const today = new Date().toDateString()
    const createdDate = new Date(pkg.created_at).toDateString()
    return createdDate === today
  })

  const activeDrivers = drivers.filter((driver: any) => driver.is_active)
  const totalRevenue = packages
    .filter((pkg: any) => pkg.status === "delivered")
    .reduce((sum: number, pkg: any) => sum + pkg.delivery_fee, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LogiTrack</h1>
                <p className="text-sm text-gray-600">Courier Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{profile.full_name}</span>
                </div>
                {company && <p className="text-xs text-gray-500">{company.name}</p>}
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
        {loading ? (
          <div className="text-center py-8">Loading dashboard...</div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{packages.length}</div>
                  <p className="text-xs text-muted-foreground">+{todayPackages.length} today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{activeDrivers.length}</div>
                  <p className="text-xs text-muted-foreground">of {drivers.length} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                  <Package className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {packages.filter((pkg: any) => pkg.status === "delivered").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(
                      (packages.filter((pkg: any) => pkg.status === "delivered").length / packages.length) * 100 || 0
                    ).toFixed(1)}
                    % success rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">from completed deliveries</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="packages" className="space-y-6">
              <TabsList>
                <TabsTrigger value="packages">Package Management</TabsTrigger>
                <TabsTrigger value="drivers">Driver Management</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="packages">
                <PackageManagement
                  packages={packages}
                  drivers={drivers}
                  onUpdate={fetchDashboardData}
                  companyId={profile.company_id}
                />
              </TabsContent>

              <TabsContent value="drivers">
                <DriverManagement drivers={drivers} onUpdate={fetchDashboardData} companyId={profile.company_id} />
              </TabsContent>

              <TabsContent value="analytics">
                <CompanyAnalytics packages={packages} drivers={drivers} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
