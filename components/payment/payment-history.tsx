"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, Download, Search } from "lucide-react"

interface Payment {
  id: string
  amount: number
  status: "completed" | "pending" | "failed"
  method: string
  date: string
  description: string
  packageId?: string
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulate fetching payment history
    const mockPayments: Payment[] = [
      {
        id: "pay_001",
        amount: 25.99,
        status: "completed",
        method: "Credit Card",
        date: "2024-01-15",
        description: "Package delivery to New York",
        packageId: "PKG001",
      },
      {
        id: "pay_002",
        amount: 18.5,
        status: "completed",
        method: "PayPal",
        date: "2024-01-10",
        description: "Express delivery to Los Angeles",
        packageId: "PKG002",
      },
      {
        id: "pay_003",
        amount: 32.75,
        status: "pending",
        method: "Bank Transfer",
        date: "2024-01-08",
        description: "International shipping to Canada",
        packageId: "PKG003",
      },
    ]
    setPayments(mockPayments)
  }, [])

  const filteredPayments = payments.filter(
    (payment) =>
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History
        </CardTitle>
        <CardDescription>View and manage your payment transactions</CardDescription>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{payment.id}</span>
                  <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{payment.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{payment.method}</span>
                  <span>{payment.date}</span>
                  {payment.packageId && <span>Package: {payment.packageId}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">${payment.amount.toFixed(2)}</div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
