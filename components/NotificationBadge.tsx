"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { useAuth } from "@/contexts/AuthContext"

export default function NotificationBadge() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await axios.get("/api/notifications?unread=true")
      const unreadNotifications = response.data.notifications.filter((n: any) => !n.isRead)
      setUnreadCount(unreadNotifications.length)
    } catch (error) {
      console.error("Error fetching unread notifications:", error)
    }
  }

  if (!user || unreadCount === 0) return null

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </Badge>
  )
} 