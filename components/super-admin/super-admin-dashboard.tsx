"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, LogOut, User, Package, Users, Building2, TrendingUp } from "lucide-react"
import { UserManagement } from "./user-management"
import { CompanyManagement } from "./company-management"
import { PlatformAnalytics } from "./platform-analytics"
import { SystemSettings } from "./system-settings"
import { useRouter } from "next/navigation"

interface SuperAdminDashboardProps {
  user: any
  profile: any
}

export function SuperAdminDashboard({ user, profile }: SuperAdminDashboardProps) {
  const [dashboardData, setDashboardData] = useState({
    users: [],
    companies: [],
    packages: [],
    loading: true,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Fetch all companies
      const { data: companiesData, error: companiesError } = await supabase
        .from("courier_companies")
        .select("*")
        .order("created_at", { ascending: false })

      if (companiesError) throw companiesError

      // Fetch all packages
      const { data: packagesData, error: packagesError } = await supabase
        .from("packages")
        .select("*")
        .order("created_at", { ascending: false })

      if (packagesError) throw packagesError

      setDashboardData({
        users: usersData || [],
        companies: companiesData || [],
        packages: packagesData || [],
        loading: false,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setDashboardData((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const { users, companies, packages, loading } = dashboardData

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter((user: any) => user.is_active).length
  const totalCompanies = companies.length
  const activeCompanies = companies.filter((company: any) => company.is_active).length
  const totalPackages = packages.length
  const deliveredPackages = packages.filter((pkg: any) => pkg.status === "delivered").length
  const totalRevenue = packages
    .filter((pkg: any) => pkg.status === "delivered")
    .reduce((sum: number, pkg: any) => sum + pkg.delivery_fee, 0)

  const todayUsers = users.filter((user: any) => {
    const today = new Date().toDateString()
    const userDate = new Date(user.created_at).toDateString()
    return userDate === today
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LogiTrack</h1>
                <p className="text-sm text-gray-600">Super Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{profile.full_name}</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Super Admin</span>
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
            {/* Platform Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+{todayUsers} today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{activeCompanies}</div>
                  <p className="text-xs text-muted-foreground">of {totalCompanies} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                  <Package className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{totalPackages}</div>
                  <p className="text-xs text-muted-foreground">{deliveredPackages} delivered</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">from all deliveries</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="companies">Company Management</TabsTrigger>
                <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
                <TabsTrigger value="settings">System Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <UserManagement users={users} onUpdate={fetchDashboardData} />
              </TabsContent>

              <TabsContent value="companies">
                <CompanyManagement companies={companies} users={users} onUpdate={fetchDashboardData} />
              </TabsContent>

              <TabsContent value="analytics">
                <PlatformAnalytics users={users} companies={companies} packages={packages} />
              </TabsContent>

              <TabsContent value="settings">
                <SystemSettings />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
