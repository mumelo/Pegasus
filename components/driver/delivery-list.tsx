"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Package, CheckCircle } from "lucide-react"

interface DeliveryListProps {
  packages: any[]
  onStatusUpdate: () => void
  driverId: string
}

export function DeliveryList({ packages, onStatusUpdate, driverId }: DeliveryListProps) {
  const [updatingPackage, setUpdatingPackage] = useState<string | null>(null)
  const [statusNotes, setStatusNotes] = useState<{ [key: string]: string }>({})
  const supabase = createClient()

  const updatePackageStatus = async (packageId: string, newStatus: string, location?: string) => {
    setUpdatingPackage(packageId)

    try {
      // Update package status
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() }

      if (newStatus === "picked_up") {
        updateData.pickup_date = new Date().toISOString()
      } else if (newStatus === "delivered") {
        updateData.delivery_date = new Date().toISOString()
      }

      const { error: packageError } = await supabase.from("packages").update(updateData).eq("id", packageId)

      if (packageError) throw packageError

      // Add tracking entry
      const { error: trackingError } = await supabase.from("package_tracking").insert({
        package_id: packageId,
        status: newStatus,
        location: location || "Driver location",
        notes: statusNotes[packageId] || `Status updated by driver`,
      })

      if (trackingError) throw trackingError

      // Clear notes for this package
      setStatusNotes((prev) => ({ ...prev, [packageId]: "" }))

      onStatusUpdate()
    } catch (error) {
      console.error("Error updating package status:", error)
    } finally {
      setUpdatingPackage(null)
    }
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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "picked_up"
      case "picked_up":
        return "in_transit"
      case "in_transit":
        return "delivered"
      default:
        return null
    }
  }

  const getStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "Pick Up"
      case "picked_up":
        return "Start Transit"
      case "in_transit":
        return "Mark Delivered"
      default:
        return null
    }
  }

  if (packages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Deliveries</CardTitle>
          <CardDescription>Your assigned deliveries for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No deliveries assigned for today</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Deliveries</CardTitle>
        <CardDescription>Manage your assigned deliveries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="border rounded-lg p-6 space-y-4">
              {/* Package Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">#{pkg.tracking_number}</p>
                    <p className="text-sm text-gray-600">Type: {pkg.package_type}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(pkg.status)}>{pkg.status.replace("_", " ").toUpperCase()}</Badge>
              </div>

              {/* Package Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Pickup Address
                    </h4>
                    <p className="text-sm text-gray-600 ml-6">{pkg.pickup_address}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Delivery Address
                    </h4>
                    <p className="text-sm text-gray-600 ml-6">{pkg.recipient_address}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Recipient</h4>
                    <p className="text-sm text-gray-600">{pkg.recipient_name}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {pkg.recipient_phone}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Package Info</h4>
                    <p className="text-sm text-gray-600">Weight: {pkg.weight} kg</p>
                    {pkg.dimensions && <p className="text-sm text-gray-600">Dimensions: {pkg.dimensions}</p>}
                  </div>
                </div>
              </div>

              {/* Status Update Section */}
              {pkg.status !== "delivered" && pkg.status !== "cancelled" && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Notes (Optional)</label>
                    <Textarea
                      placeholder="Add delivery notes or updates..."
                      value={statusNotes[pkg.id] || ""}
                      onChange={(e) => setStatusNotes((prev) => ({ ...prev, [pkg.id]: e.target.value }))}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex space-x-3">
                    {getNextStatus(pkg.status) && (
                      <Button
                        onClick={() => updatePackageStatus(pkg.id, getNextStatus(pkg.status)!)}
                        disabled={updatingPackage === pkg.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {updatingPackage === pkg.id ? "Updating..." : getStatusAction(pkg.status)}
                      </Button>
                    )}

                    {pkg.status === "pending" && (
                      <Button
                        variant="outline"
                        onClick={() => updatePackageStatus(pkg.id, "cancelled")}
                        disabled={updatingPackage === pkg.id}
                      >
                        Cancel Pickup
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Delivered Status */}
              {pkg.status === "delivered" && (
                <div className="border-t pt-4">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Delivered</span>
                    {pkg.delivery_date && (
                      <span className="text-sm text-gray-600 ml-2">
                        on {new Date(pkg.delivery_date).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
