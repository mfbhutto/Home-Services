import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"

export async function PUT(request) {
  try {
    console.log("PUT /api/auth/profile - Updating user profile")

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
    const { name, email, phone, location, bio } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: user.userId } })
    if (existingUser) {
      return NextResponse.json({ message: "Email is already taken by another user" }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        name,
        email,
        phone,
        location,
        bio,
      },
      { new: true, select: "-password" }
    )

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    console.log("PUT /api/auth/profile - Profile updated successfully")
    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: updatedUser 
    })
  } catch (error) {
    console.error("PUT /api/auth/profile - Internal error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 