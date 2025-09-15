"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, Search, Mail, Phone, Users, CheckCircle, XCircle } from "lucide-react"

interface CompanyManagementProps {
  companies: any[]
  users: any[]
  onUpdate: () => void
}

export function CompanyManagement({ companies, users, onUpdate }: CompanyManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingCompany, setUpdatingCompany] = useState<string | null>(null)
  const supabase = createClient()

  const toggleCompanyStatus = async (companyId: string, currentStatus: boolean) => {
    setUpdatingCompany(companyId)

    try {
      const { error } = await supabase
        .from("courier_companies")
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error("Error updating company status:", error)
    } finally {
      setUpdatingCompany(null)
    }
  }

  const getCompanyStats = (companyId: string) => {
    const companyUsers = users.filter((user) => user.company_id === companyId)
    const drivers = companyUsers.filter((user) => user.role === "driver")
    const admins = companyUsers.filter((user) => user.role === "courier_admin")

    return {
      totalUsers: companyUsers.length,
      drivers: drivers.length,
      admins: admins.length,
    }
  }

  const filteredCompanies = companies.filter((company) => company.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Company Management</span>
        </CardTitle>
        <CardDescription>Manage courier companies and their operations</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Company List */}
        <div className="space-y-4">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No companies found</p>
            </div>
          ) : (
            filteredCompanies.map((company) => {
              const stats = getCompanyStats(company.id)
              return (
                <div key={company.id} className="border rounded-lg p-4 space-y-4">
                  {/* Company Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{company.name}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {company.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={company.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {company.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant={company.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleCompanyStatus(company.id, company.is_active)}
                        disabled={updatingCompany === company.id}
                      >
                        {updatingCompany === company.id ? (
                          "Updating..."
                        ) : company.is_active ? (
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

                  {/* Company Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      {company.phone && (
                        <p className="text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {company.phone}
                        </p>
                      )}
                      {company.address && (
                        <p className="text-gray-600">
                          <span className="font-medium">Address:</span> {company.address}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="font-medium">Total Users:</span> {stats.totalUsers}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Drivers:</span> {stats.drivers}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Admins:</span> {stats.admins}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(company.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Company Stats */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{stats.totalUsers}</div>
                        <p className="text-xs text-gray-600">Total Users</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{stats.drivers}</div>
                        <p className="text-xs text-gray-600">Active Drivers</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">{stats.admins}</div>
                        <p className="text-xs text-gray-600">Administrators</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
