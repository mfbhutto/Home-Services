import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Service from "@/lib/models/Service"
import Booking from "@/lib/models/Booking"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"

export async function DELETE(request) {
  try {
    console.log("DELETE /api/auth/account - Deleting user account")

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    // Delete user's services
    await Service.deleteMany({ provider: user.userId })

    // Delete user's bookings (both as client and provider)
    await Booking.deleteMany({ 
      $or: [
        { client: user.userId },
        { provider: user.userId }
      ]
    })

    // Delete the user account
    const deletedUser = await User.findByIdAndDelete(user.userId)
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    console.log("DELETE /api/auth/account - Account deleted successfully")
    return NextResponse.json({ 
      message: "Account deleted successfully"
    })
  } catch (error) {
    console.error("DELETE /api/auth/account - Internal error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 