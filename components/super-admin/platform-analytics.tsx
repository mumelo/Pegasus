"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Building2, Package, DollarSign } from "lucide-react"

interface PlatformAnalyticsProps {
  users: any[]
  companies: any[]
  packages: any[]
}

export function PlatformAnalytics({ users, companies, packages }: PlatformAnalyticsProps) {
  // Calculate platform metrics
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.is_active).length
  const totalCompanies = companies.length
  const activeCompanies = companies.filter((company) => company.is_active).length
  const totalPackages = packages.length
  const deliveredPackages = packages.filter((pkg) => pkg.status === "delivered").length
  const totalRevenue = packages
    .filter((pkg) => pkg.status === "delivered")
    .reduce((sum, pkg) => sum + pkg.delivery_fee, 0)

  // User role distribution
  const userRoles = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {})

  // Package status distribution
  const packageStatuses = packages.reduce((acc, pkg) => {
    acc[pkg.status] = (acc[pkg.status] || 0) + 1
    return acc
  }, {})

  // Monthly growth data (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

    const monthUsers = users.filter((user) => {
      const userDate = new Date(user.created_at)
      const userMonthKey = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, "0")}`
      return userMonthKey === monthKey
    })

    const monthPackages = packages.filter((pkg) => {
      const pkgDate = new Date(pkg.created_at)
      const pkgMonthKey = `${pkgDate.getFullYear()}-${String(pkgDate.getMonth() + 1).padStart(2, "0")}`
      return pkgMonthKey === monthKey
    })

    const monthRevenue = monthPackages
      .filter((pkg) => pkg.status === "delivered")
      .reduce((sum, pkg) => sum + pkg.delivery_fee, 0)

    monthlyData.push({
      month: monthName,
      users: monthUsers.length,
      packages: monthPackages.length,
      revenue: monthRevenue,
    })
  }

  const successRate = totalPackages > 0 ? (deliveredPackages / totalPackages) * 100 : 0
  const averageOrderValue = deliveredPackages > 0 ? totalRevenue / deliveredPackages : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">delivery success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">per delivered package</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Retention</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{((activeUsers / totalUsers) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Growth</CardTitle>
            <Building2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground">{activeCompanies} active companies</p>
          </CardContent>
        </Card>
      </div>

      {/* User Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Role Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(userRoles).map(([role, count]: [string, any]) => (
              <div key={role} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <Badge variant="secondary" className="capitalize">
                  {role.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Package Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Package Status Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(packageStatuses).map(([status, count]: [string, any]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="capitalize font-medium">{status.replace("_", " ")}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / totalPackages) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Platform Growth (Last 6 Months)</span>
          </CardTitle>
          <CardDescription>User registrations, package volume, and revenue trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{month.month}</p>
                  <p className="text-sm text-gray-600">{month.users} new users</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Packages</p>
                    <p className="font-medium">{month.packages}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="font-medium text-green-600">${month.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
