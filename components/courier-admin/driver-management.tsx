"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Search, Phone, Mail, Package, CheckCircle, XCircle } from "lucide-react"

interface DriverManagementProps {
  drivers: any[]
  onUpdate: () => void
  companyId: string
}

export function DriverManagement({ drivers, onUpdate, companyId }: DriverManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingDriver, setUpdatingDriver] = useState<string | null>(null)
  const supabase = createClient()

  const toggleDriverStatus = async (driverId: string, currentStatus: boolean) => {
    setUpdatingDriver(driverId)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", driverId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error("Error updating driver status:", error)
    } finally {
      setUpdatingDriver(null)
    }
  }

  const getDriverStats = async (driverId: string) => {
    const { data, error } = await supabase.from("packages").select("status").eq("driver_id", driverId)

    if (error) return { total: 0, delivered: 0 }

    const total = data?.length || 0
    const delivered = data?.filter((pkg) => pkg.status === "delivered").length || 0

    return { total, delivered }
  }

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Driver Management</span>
        </CardTitle>
        <CardDescription>Manage your company drivers and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search drivers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Driver List */}
        <div className="space-y-4">
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No drivers found</p>
            </div>
          ) : (
            filteredDrivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onToggleStatus={toggleDriverStatus}
                isUpdating={updatingDriver === driver.id}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DriverCard({ driver, onToggleStatus, isUpdating }: any) {
  const [stats, setStats] = useState({ total: 0, delivered: 0 })
  const supabase = createClient()

  useState(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.from("packages").select("status").eq("driver_id", driver.id)

      if (!error && data) {
        const total = data.length
        const delivered = data.filter((pkg) => pkg.status === "delivered").length
        setStats({ total, delivered })
      }
    }

    fetchStats()
  })

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Driver Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{driver.full_name}</p>
            <p className="text-sm text-gray-600 flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {driver.email}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={driver.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {driver.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant={driver.is_active ? "destructive" : "default"}
            size="sm"
            onClick={() => onToggleStatus(driver.id, driver.is_active)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              "Updating..."
            ) : driver.is_active ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Driver Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          {driver.phone && (
            <p className="text-gray-600 flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              {driver.phone}
            </p>
          )}
          <p className="text-gray-600">
            <span className="font-medium">Joined:</span> {new Date(driver.created_at).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-600 flex items-center">
            <Package className="h-4 w-4 mr-1" />
            <span className="font-medium">Total Deliveries:</span> {stats.total}
          </p>
          <p className="text-gray-600 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="font-medium">Completed:</span> {stats.delivered}
          </p>
        </div>
        <div>
          <p className="text-gray-600">
            <span className="font-medium">Success Rate:</span>{" "}
            {stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Status:</span>{" "}
            <span className={driver.is_active ? "text-green-600" : "text-red-600"}>
              {driver.is_active ? "Available" : "Unavailable"}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
