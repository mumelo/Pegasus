"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Route, Clock, Fuel } from "lucide-react"

interface RouteOptimizerProps {
  packages: any[]
}

export function RouteOptimizer({ packages }: RouteOptimizerProps) {
  const [optimizedRoute, setOptimizedRoute] = useState<any[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Simple route optimization algorithm (in a real app, you'd use Google Maps API or similar)
  const optimizeRoute = async () => {
    setIsOptimizing(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simple optimization: group by area/postal code and sort by priority
    const pendingPackages = packages.filter((pkg) => pkg.status === "pending" || pkg.status === "picked_up")

    // Sort by package type priority (express first) and then by creation time
    const sorted = [...pendingPackages].sort((a, b) => {
      if (a.package_type === "express" && b.package_type !== "express") return -1
      if (b.package_type === "express" && a.package_type !== "express") return 1
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    setOptimizedRoute(sorted)
    setIsOptimizing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "picked_up":
        return "bg-blue-100 text-blue-800"
      case "in_transit":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (packageType: string) => {
    return packageType === "express" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Route Optimizer</span>
          </CardTitle>
          <CardDescription>Optimize your delivery route for maximum efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {packages.filter((pkg) => pkg.status !== "delivered" && pkg.status !== "cancelled").length} stops
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">Est. {Math.ceil(packages.length * 0.5)} hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <Fuel className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">Est. {Math.ceil(packages.length * 2)} km</span>
              </div>
            </div>
            <Button
              onClick={optimizeRoute}
              disabled={isOptimizing || packages.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Route className="h-4 w-4 mr-2" />
              {isOptimizing ? "Optimizing..." : "Optimize Route"}
            </Button>
          </div>

          {packages.length === 0 && (
            <div className="text-center py-8">
              <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No deliveries to optimize</p>
            </div>
          )}
        </CardContent>
      </Card>

      {optimizedRoute.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimized Route</CardTitle>
            <CardDescription>Follow this route for the most efficient deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizedRoute.map((pkg, index) => (
                <div key={pkg.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">#{pkg.tracking_number}</p>
                      <div className="flex space-x-2">
                        <Badge className={getStatusColor(pkg.status)}>
                          {pkg.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(pkg.package_type)}>{pkg.package_type.toUpperCase()}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Recipient:</span> {pkg.recipient_name}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Phone:</span> {pkg.recipient_phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Address:</span> {pkg.recipient_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(pkg.recipient_address)}`, "_blank")
                      }
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Navigate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
