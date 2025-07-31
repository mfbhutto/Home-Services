import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"

export async function GET(request) {
  try {
    await connectDB()

    console.log("GET /api/auth/me - Headers:", Object.fromEntries(request.headers.entries()))
    console.log("GET /api/auth/me - Authorization header:", request.headers.get("authorization"))

    const token = getTokenFromRequest(request)
    console.log("GET /api/auth/me - Extracted token:", token ? "Found" : "Not found")
    
    if (!token) {
      console.log("GET /api/auth/me - No token provided")
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    console.log("GET /api/auth/me - Decoded token:", decoded ? "Valid" : "Invalid")
    
    if (!decoded) {
      console.log("GET /api/auth/me - Invalid token")
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    console.log("GET /api/auth/me - User ID from token:", decoded.userId)

    const user = await User.findById(decoded.userId).select("-password")
    if (!user) {
      console.log("GET /api/auth/me - User not found in database")
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    console.log("GET /api/auth/me - User found:", user.name)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
