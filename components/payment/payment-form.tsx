"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Lock, Smartphone } from "lucide-react"
import { formatCurrencySimple } from "@/lib/utils/currency"

interface PaymentFormProps {
  amount: number
  onPaymentSuccess: (paymentId: string) => void
  onCancel: () => void
}

export function PaymentForm({ amount, onPaymentSuccess, onCancel }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(() => {
      const paymentId = `pay_${Date.now()}`
      onPaymentSuccess(paymentId)
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>Complete your payment of {formatCurrencySimple(amount)}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "card" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="1234 5678 9012 3456" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardholder">Cardholder Name</Label>
                <Input id="cardholder" placeholder="John Doe" required />
              </div>
            </>
          )}

          {paymentMethod === "mpesa" && (
            <div className="space-y-2">
              <Label htmlFor="mpesa-phone" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                M-Pesa Phone Number
              </Label>
              <Input
                id="mpesa-phone"
                placeholder="254712345678"
                pattern="^254[0-9]{9}$"
                required
                title="Enter phone number in format: 254712345678"
              />
              <p className="text-xs text-muted-foreground">
                Enter your M-Pesa registered phone number (format: 254xxxxxxxxx)
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Your payment information is secure and encrypted
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? "Processing..." : `Pay ${formatCurrencySimple(amount)}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
