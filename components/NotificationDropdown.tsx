"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"
import { useAuth } from "@/contexts/AuthContext"

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  sender: {
    name: string
    email: string
    avatar?: string
  }
  booking: {
    _id: string
    service: {
      title: string
      category: string
    }
    status: string
  }
}

export default function NotificationDropdown() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await axios.get("/api/notifications?limit=10")
      setNotifications(response.data.notifications)
      
      const unread = response.data.notifications.filter((n: Notification) => !n.isRead).length
      setUnreadCount(unread)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await axios.put("/api/notifications", { notificationIds })
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n._id) ? { ...n, isRead: true } : n
        )
      )
      
      // Update unread count
      const newUnreadCount = notifications.filter(n => 
        !notificationIds.includes(n._id) && !n.isRead
      ).length
      setUnreadCount(newUnreadCount)
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_created":
        return "📋"
      case "booking_confirmed":
        return "✅"
      case "booking_rejected":
        return "❌"
      case "booking_completed":
        return "🎉"
      default:
        return "🔔"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const unreadIds = notifications
                  .filter(n => !n.isRead)
                  .map(n => n._id)
                if (unreadIds.length > 0) {
                  markAsRead(unreadIds)
                }
              }}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`p-3 cursor-pointer hover:bg-gray-50 ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead([notification._id])
                  }
                  // Navigate to dashboard
                  window.location.href = "/dashboard"
                }}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    
                    {notification.booking && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Service: {notification.booking.service.title}</p>
                        <p>Status: {notification.booking.status}</p>
                      </div>
                    )}
                  </div>
                  
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <DropdownMenuSeparator />
        )}
        
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => window.location.href = "/dashboard"}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 