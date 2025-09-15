"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Package, Users, DollarSign } from "lucide-react"

interface CompanyAnalyticsProps {
  packages: any[]
  drivers: any[]
}

export function CompanyAnalytics({ packages, drivers }: CompanyAnalyticsProps) {
  // Calculate analytics
  const totalPackages = packages.length
  const deliveredPackages = packages.filter((pkg) => pkg.status === "delivered").length
  const pendingPackages = packages.filter((pkg) => pkg.status === "pending").length
  const inTransitPackages = packages.filter((pkg) => pkg.status === "in_transit").length
  const cancelledPackages = packages.filter((pkg) => pkg.status === "cancelled").length

  const totalRevenue = packages
    .filter((pkg) => pkg.status === "delivered")
    .reduce((sum, pkg) => sum + pkg.delivery_fee, 0)

  const averageDeliveryFee =
    totalPackages > 0 ? packages.reduce((sum, pkg) => sum + pkg.delivery_fee, 0) / totalPackages : 0

  const successRate = totalPackages > 0 ? (deliveredPackages / totalPackages) * 100 : 0

  // Package type distribution
  const packageTypes = packages.reduce((acc, pkg) => {
    acc[pkg.package_type] = (acc[pkg.package_type] || 0) + 1
    return acc
  }, {})

  // Monthly data (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

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
      packages: monthPackages.length,
      revenue: monthRevenue,
      delivered: monthPackages.filter((pkg) => pkg.status === "delivered").length,
    })
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {deliveredPackages} of {totalPackages} delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Delivery Fee</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${averageDeliveryFee.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">per package</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{drivers.filter((d) => d.is_active).length}</div>
            <p className="text-xs text-muted-foreground">of {drivers.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">from delivered packages</p>
          </CardContent>
        </Card>
      </div>

      {/* Package Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Package Status Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{deliveredPackages}</div>
              <Badge className="bg-green-100 text-green-800">Delivered</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{inTransitPackages}</div>
              <Badge className="bg-purple-100 text-purple-800">In Transit</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingPackages}</div>
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{cancelledPackages}</div>
              <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Types */}
      <Card>
        <CardHeader>
          <CardTitle>Package Types</CardTitle>
          <CardDescription>Distribution of package types handled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(packageTypes).map(([type, count]: [string, any]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="capitalize font-medium">{type}</span>
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

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Monthly Performance</span>
          </CardTitle>
          <CardDescription>Package volume and revenue over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{month.month}</p>
                  <p className="text-sm text-gray-600">{month.packages} packages</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Delivered</p>
                    <p className="font-medium">{month.delivered}</p>
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
