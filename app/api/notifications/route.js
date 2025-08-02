import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Notification from "@/lib/models/Notification"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"

export async function GET(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit")) || 50
    const unreadOnly = searchParams.get("unread") === "true"

    const query = { recipient: decoded.userId }
    if (unreadOnly) {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .populate("sender", "name email avatar")
      .populate("booking", "service status")
      .populate({
        path: "booking",
        populate: {
          path: "service",
          select: "title category"
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { notificationIds } = await request.json()

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ message: "Notification IDs array is required" }, { status: 400 })
    }

    // Mark notifications as read
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: decoded.userId
      },
      { isRead: true }
    )

    return NextResponse.json({ 
      message: "Notifications marked as read",
      updatedCount: result.modifiedCount
    })
  } catch (error) {
    console.error("Mark notifications as read error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 