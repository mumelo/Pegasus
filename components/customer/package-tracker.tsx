"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { RealTimeTracker } from "@/components/real-time/real-time-tracker"

export function PackageTracker() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [showTracker, setShowTracker] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number")
      return
    }

    setError(null)
    setShowTracker(true)
  }

  if (showTracker) {
    return (
      <RealTimeTracker
        trackingNumber={trackingNumber.trim()}
        onClose={() => {
          setShowTracker(false)
          setTrackingNumber("")
        }}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Package Tracking</CardTitle>
        <CardDescription>Enter your tracking number to see live updates and location</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4">
          <Input
            placeholder="Enter tracking number (e.g., LT1234567890ABCD)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleTrack()}
          />
          <Button onClick={handleTrack} className="bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4 mr-2" />
            Track Live
          </Button>
        </div>
        {error && <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
      </CardContent>
    </Card>
  )
}
