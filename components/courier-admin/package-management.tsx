"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Package, Search, UserCheck, Calendar } from "lucide-react"

interface PackageManagementProps {
  packages: any[]
  drivers: any[]
  onUpdate: () => void
  companyId: string
}

export function PackageManagement({ packages, drivers, onUpdate, companyId }: PackageManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigningPackage, setAssigningPackage] = useState<string | null>(null)
  const supabase = createClient()

  const assignDriver = async (packageId: string, driverId: string) => {
    setAssigningPackage(packageId)

    try {
      const { error } = await supabase
        .from("packages")
        .update({
          driver_id: driverId,
          courier_company_id: companyId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", packageId)

      if (error) throw error

      // Add tracking entry
      await supabase.from("package_tracking").insert({
        package_id: packageId,
        status: "assigned",
        location: "Courier facility",
        notes: `Package assigned to driver`,
      })

      onUpdate()
    } catch (error) {
      console.error("Error assigning driver:", error)
    } finally {
      setAssigningPackage(null)
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
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || pkg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const unassignedPackages = packages.filter((pkg) => !pkg.driver_id && pkg.status === "pending")

  return (
    <div className="space-y-6">
      {/* Unassigned Packages Alert */}
      {unassignedPackages.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Unassigned Packages</CardTitle>
            <CardDescription className="text-yellow-700">
              {unassignedPackages.length} packages need driver assignment
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Package Management</span>
          </CardTitle>
          <CardDescription>Manage and assign packages to drivers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by tracking number or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Package List */}
          <div className="space-y-4">
            {filteredPackages.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No packages found</p>
              </div>
            ) : (
              filteredPackages.map((pkg) => (
                <div key={pkg.id} className="border rounded-lg p-4 space-y-4">
                  {/* Package Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">#{pkg.tracking_number}</p>
                        <p className="text-sm text-gray-600">To: {pkg.recipient_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(pkg.status)}>{pkg.status.replace("_", " ").toUpperCase()}</Badge>
                      <span className="text-sm font-medium text-gray-900">${pkg.delivery_fee}</span>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Type:</span> {pkg.package_type}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Weight:</span> {pkg.weight} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Phone:</span> {pkg.recipient_phone}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(pkg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Address:</span> {pkg.recipient_address}
                      </p>
                    </div>
                  </div>

                  {/* Driver Assignment */}
                  {pkg.status === "pending" && !pkg.driver_id && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Assign Driver:</p>
                        <div className="flex items-center space-x-3">
                          <Select
                            onValueChange={(driverId) => assignDriver(pkg.id, driverId)}
                            disabled={assigningPackage === pkg.id}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select driver" />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers
                                .filter((driver) => driver.is_active)
                                .map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    {driver.full_name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {assigningPackage === pkg.id && <span className="text-sm text-gray-500">Assigning...</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assigned Driver Info */}
                  {pkg.driver_id && (
                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">
                          Assigned to:{" "}
                          <span className="font-medium">
                            {drivers.find((d) => d.id === pkg.driver_id)?.full_name || "Unknown Driver"}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
