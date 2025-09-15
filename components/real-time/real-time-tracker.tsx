"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Truck, Package, Navigation, RefreshCw } from "lucide-react"

interface RealTimeTrackerProps {
  trackingNumber: string
  onClose?: () => void
}

export function RealTimeTracker({ trackingNumber, onClose }: RealTimeTrackerProps) {
  const [packageData, setPackageData] = useState<any>(null)
  const [trackingHistory, setTrackingHistory] = useState<any[]>([])
  const [liveLocation, setLiveLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const supabase = createClient()

  useEffect(() => {
    fetchPackageData()

    // Set up real-time subscription for package updates
    const channel = supabase
      .channel("package-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "package_tracking",
          filter: `package_id=eq.${packageData?.id}`,
        },
        (payload) => {
          console.log("[v0] Real-time tracking update received:", payload)
          fetchTrackingHistory()
          setLastUpdate(new Date())
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [trackingNumber, packageData?.id])

  const fetchPackageData = async () => {
    try {
      // Get package details
      const { data: packageData, error: packageError } = await supabase
        .from("packages")
        .select("*")
        .eq("tracking_number", trackingNumber)
        .single()

      if (packageError) throw new Error("Package not found")

      setPackageData(packageData)
      await fetchTrackingHistory(packageData.id)

      // Simulate live location for in-transit packages
      if (packageData.status === "in_transit") {
        simulateLiveLocation()
      }
    } catch (error: any) {
      console.error("Error fetching package data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrackingHistory = async (packageId?: string) => {
    const id = packageId || packageData?.id
    if (!id) return

    try {
      const { data: trackingData, error: trackingError } = await supabase
        .from("package_tracking")
        .select("*")
        .eq("package_id", id)
        .order("created_at", { ascending: false })

      if (trackingError) throw trackingError
      setTrackingHistory(trackingData || [])
    } catch (error) {
      console.error("Error fetching tracking history:", error)
    }
  }

  const simulateLiveLocation = () => {
    // Simulate GPS coordinates updating every 30 seconds
    const updateLocation = () => {
      const baseLatitude = 40.7128 // New York base
      const baseLongitude = -74.006

      // Add small random variations to simulate movement
      const latitude = baseLatitude + (Math.random() - 0.5) * 0.01
      const longitude = baseLongitude + (Math.random() - 0.5) * 0.01

      setLiveLocation({
        latitude,
        longitude,
        timestamp: new Date(),
        speed: Math.floor(Math.random() * 60) + 20, // 20-80 km/h
        heading: Math.floor(Math.random() * 360),
      })
    }

    updateLocation()
    const interval = setInterval(updateLocation, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }

  const refreshTracking = async () => {
    setLoading(true)
    await fetchPackageData()
    setLastUpdate(new Date())
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

  const getEstimatedDelivery = () => {
    if (!packageData || packageData.status === "delivered") return null

    const created = new Date(packageData.created_at)
    const estimatedHours = packageData.package_type === "express" ? 24 : 72
    const estimated = new Date(created.getTime() + estimatedHours * 60 * 60 * 1000)

    return estimated
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading real-time tracking...</p>
        </CardContent>
      </Card>
    )
  }

  if (!packageData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Package not found</p>
        </CardContent>
      </Card>
    )
  }

  const estimatedDelivery = getEstimatedDelivery()

  return (
    <div className="space-y-6">
      {/* Real-time Status Header */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Package #{packageData.tracking_number}</span>
              </CardTitle>
              <CardDescription>Real-time tracking and updates</CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(packageData.status)}>
                {packageData.status.replace("_", " ").toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshTracking} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">
                <span className="font-medium">Last Update:</span> {lastUpdate.toLocaleTimeString()}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Status:</span> {packageData.status.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-medium">Recipient:</span> {packageData.recipient_name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Type:</span> {packageData.package_type}
              </p>
            </div>
            <div>
              {estimatedDelivery && (
                <p className="text-gray-600">
                  <span className="font-medium">Est. Delivery:</span> {estimatedDelivery.toLocaleDateString()}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Weight:</span> {packageData.weight} kg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Location (for in-transit packages) */}
      {packageData.status === "in_transit" && liveLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span>Live Location</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                LIVE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Coordinates:</span> {liveLocation.latitude.toFixed(4)},{" "}
                    {liveLocation.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Speed:</span> {liveLocation.speed} km/h
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Last GPS Update:</span> {liveLocation.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Interactive map would be displayed here</p>
                <p className="text-xs text-gray-500 mt-1">Showing real-time GPS location of delivery vehicle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Tracking Timeline</span>
          </CardTitle>
          <CardDescription>Real-time updates and package journey</CardDescription>
        </CardHeader>
        <CardContent>
          {trackingHistory.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No tracking history available</p>
          ) : (
            <div className="space-y-4">
              {trackingHistory.map((entry, index) => (
                <div key={entry.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 relative">
                    <div
                      className={`w-4 h-4 rounded-full ${index === 0 ? "bg-blue-600 animate-pulse" : "bg-gray-300"} mt-1`}
                    />
                    {index < trackingHistory.length - 1 && (
                      <div className="absolute top-4 left-2 w-0.5 h-8 bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={getStatusColor(entry.status)} variant="secondary">
                        {entry.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(entry.created_at).toLocaleString()}
                        {index === 0 && (
                          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                            Latest
                          </Badge>
                        )}
                      </div>
                    </div>
                    {entry.location && (
                      <p className="text-sm text-gray-600 mb-1">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {entry.location}
                      </p>
                    )}
                    {entry.notes && <p className="text-sm text-gray-600">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="relative">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Order Placed</span>
                <span>In Transit</span>
                <span>Out for Delivery</span>
                <span>Delivered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width:
                      packageData.status === "pending"
                        ? "25%"
                        : packageData.status === "picked_up"
                          ? "50%"
                          : packageData.status === "in_transit"
                            ? "75%"
                            : packageData.status === "delivered"
                              ? "100%"
                              : "0%",
                  }}
                />
              </div>
            </div>

            {/* Status Icons */}
            <div className="flex justify-between">
              <div
                className={`flex flex-col items-center ${packageData.status !== "pending" ? "text-blue-600" : "text-gray-400"}`}
              >
                <Package className="h-6 w-6 mb-1" />
                <span className="text-xs">Placed</span>
              </div>
              <div
                className={`flex flex-col items-center ${["picked_up", "in_transit", "delivered"].includes(packageData.status) ? "text-blue-600" : "text-gray-400"}`}
              >
                <Truck className="h-6 w-6 mb-1" />
                <span className="text-xs">Picked Up</span>
              </div>
              <div
                className={`flex flex-col items-center ${["in_transit", "delivered"].includes(packageData.status) ? "text-blue-600" : "text-gray-400"}`}
              >
                <Navigation className="h-6 w-6 mb-1" />
                <span className="text-xs">In Transit</span>
              </div>
              <div
                className={`flex flex-col items-center ${packageData.status === "delivered" ? "text-green-600" : "text-gray-400"}`}
              >
                <MapPin className="h-6 w-6 mb-1" />
                <span className="text-xs">Delivered</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
