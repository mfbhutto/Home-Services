import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { signToken } from "@/lib/jwt"

export async function POST(request) {
  try {
    await connectDB()

    const { name, email, password, role, phone, location } = await request.json()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "client",
      phone,
      location,
    })

    // Generate JWT token
    const token = signToken({ userId: user._id })

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      avatar: user.avatar,
      bio: user.bio,
      rating: user.rating,
      reviewCount: user.reviewCount,
      isVerified: user.isVerified,
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        user: userResponse,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
