"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { PaymentForm } from "@/components/payment/payment-form"

interface SendPackageFormProps {
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export function SendPackageForm({ onClose, onSuccess, userId }: SendPackageFormProps) {
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    pickupAddress: "",
    packageType: "",
    weight: "",
    dimensions: "",
    declaredValue: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"details" | "payment">("details")
  const [packageData, setPackageData] = useState<any>(null)
  const [deliveryFee, setDeliveryFee] = useState(0)

  const supabase = createClient()

  const calculateDeliveryFee = () => {
    const baseRate = 10
    const weightRate = Number.parseFloat(formData.weight) * 2
    const typeMultiplier = formData.packageType === "express" ? 1.5 : 1
    return (baseRate + weightRate) * typeMultiplier
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Generate tracking number
      const trackingNumber = `LT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

      // Calculate delivery fee
      const fee = calculateDeliveryFee()
      setDeliveryFee(fee)

      setPackageData({
        tracking_number: trackingNumber,
        sender_id: userId,
        recipient_name: formData.recipientName,
        recipient_phone: formData.recipientPhone,
        recipient_address: formData.recipientAddress,
        pickup_address: formData.pickupAddress,
        package_type: formData.packageType,
        weight: Number.parseFloat(formData.weight),
        dimensions: formData.dimensions,
        declared_value: Number.parseFloat(formData.declaredValue),
        delivery_fee: fee,
        status: "pending",
        payment_status: "pending",
      })

      setStep("payment")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      setLoading(true)

      // Create package with payment information
      const { data: packageResult, error: packageError } = await supabase
        .from("packages")
        .insert({
          ...packageData,
          payment_status: "paid",
          payment_id: paymentId,
        })
        .select()
        .single()

      if (packageError) throw packageError

      // Add initial tracking entry
      await supabase.from("package_tracking").insert({
        package_id: packageResult.id,
        status: "pending",
        location: formData.pickupAddress,
        notes: "Package created and payment confirmed. Awaiting pickup",
      })

      // Process payment via API
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: packageResult.id,
          amount: deliveryFee,
          paymentMethod: "card",
        }),
      })

      onSuccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (step === "payment") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-md">
          <PaymentForm
            amount={deliveryFee}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => setStep("details")}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Send New Package</CardTitle>
              <CardDescription>Fill in the details to send your package</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recipient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    required
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange("recipientName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Recipient Phone</Label>
                  <Input
                    id="recipientPhone"
                    type="tel"
                    required
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange("recipientPhone", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Delivery Address</Label>
                <Textarea
                  id="recipientAddress"
                  required
                  value={formData.recipientAddress}
                  onChange={(e) => handleInputChange("recipientAddress", e.target.value)}
                />
              </div>
            </div>

            {/* Pickup Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pickup Information</h3>
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address</Label>
                <Textarea
                  id="pickupAddress"
                  required
                  value={formData.pickupAddress}
                  onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                />
              </div>
            </div>

            {/* Package Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Package Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="packageType">Package Type</Label>
                  <Select
                    value={formData.packageType}
                    onValueChange={(value) => handleInputChange("packageType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="fragile">Fragile</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions (L x W x H cm)</Label>
                  <Input
                    id="dimensions"
                    placeholder="e.g., 30 x 20 x 15"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange("dimensions", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declaredValue">Declared Value ($)</Label>
                  <Input
                    id="declaredValue"
                    type="number"
                    step="0.01"
                    required
                    value={formData.declaredValue}
                    onChange={(e) => handleInputChange("declaredValue", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Delivery fee preview */}
            {formData.weight && formData.packageType && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Delivery Fee:</span>
                  <span className="text-xl font-bold text-blue-600">${calculateDeliveryFee().toFixed(2)}</span>
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Processing..." : "Continue to Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
