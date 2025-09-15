"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, X, Package, Truck, CheckCircle, AlertCircle } from "lucide-react"

interface Notification {
  id: string
  type: "package_update" | "delivery_assigned" | "delivery_completed" | "system_alert"
  title: string
  message: string
  timestamp: Date
  read: boolean
  packageId?: string
  trackingNumber?: string
}

interface NotificationSystemProps {
  userId: string
  userRole: string
}

export function NotificationSystem({ userId, userRole }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Set up real-time subscription for notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "package_tracking",
        },
        (payload) => {
          console.log("[v0] Notification trigger received:", payload)
          handleRealTimeUpdate(payload)
        },
      )
      .subscribe()

    // Load initial notifications
    loadNotifications()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, userRole])

  const handleRealTimeUpdate = async (payload: any) => {
    // Create notification based on the update
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      type: "package_update",
      title: "Package Status Updated",
      message: `Package status changed to ${payload.new?.status || "unknown"}`,
      timestamp: new Date(),
      read: false,
      packageId: payload.new?.package_id,
    }

    // Get package details for better notification
    if (payload.new?.package_id) {
      try {
        const { data: packageData } = await supabase
          .from("packages")
          .select("tracking_number, recipient_name, sender_id, driver_id")
          .eq("id", payload.new.package_id)
          .single()

        if (packageData) {
          newNotification.trackingNumber = packageData.tracking_number

          // Only show notification if user is involved
          const isRelevant =
            (userRole === "customer" && packageData.sender_id === userId) ||
            (userRole === "driver" && packageData.driver_id === userId) ||
            userRole === "courier_admin" ||
            userRole === "super_admin"

          if (isRelevant) {
            newNotification.message = `Package #${packageData.tracking_number} status updated to ${payload.new.status.replace("_", " ")}`
            addNotification(newNotification)
          }
        }
      } catch (error) {
        console.error("Error fetching package details for notification:", error)
      }
    }
  }

  const loadNotifications = () => {
    // Simulate loading notifications from local storage or API
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "package_update",
        title: "Package Delivered",
        message: "Your package #LT1234567890ABCD has been delivered successfully",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        trackingNumber: "LT1234567890ABCD",
      },
      {
        id: "2",
        type: "delivery_assigned",
        title: "New Delivery Assigned",
        message: "You have been assigned a new delivery for package #LT9876543210WXYZ",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true,
        trackingNumber: "LT9876543210WXYZ",
      },
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => !n.read).length)
  }

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev])
    setUnreadCount((prev) => prev + 1)

    // Show browser notification if permission granted
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
      })
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const removeNotification = (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "package_update":
        return <Package className="h-4 w-4" />
      case "delivery_assigned":
        return <Truck className="h-4 w-4" />
      case "delivery_completed":
        return <CheckCircle className="h-4 w-4" />
      case "system_alert":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "package_update":
        return "text-blue-600"
      case "delivery_assigned":
        return "text-purple-600"
      case "delivery_completed":
        return "text-green-600"
      case "system_alert":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button variant="ghost" size="sm" onClick={() => setShowNotifications(!showNotifications)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={getNotificationColor(notification.type)}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{notification.timestamp.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
