import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"

export async function PUT(request) {
  try {
    console.log("PUT /api/auth/password - Changing user password")

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 })
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json({ message: "New password must be at least 6 characters long" }, { status: 400 })
    }

    const userDoc = await User.findById(user.userId)
    if (!userDoc) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await userDoc.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    // Update password
    userDoc.password = newPassword
    await userDoc.save()

    console.log("PUT /api/auth/password - Password changed successfully")
    return NextResponse.json({ 
      message: "Password changed successfully"
    })
  } catch (error) {
    console.error("PUT /api/auth/password - Internal error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 