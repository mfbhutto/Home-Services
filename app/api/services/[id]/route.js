import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Service from "@/lib/models/Service"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"

export async function GET(request, { params }) {
  try {
    console.log("GET /api/services/[id] - params:", params)

    await connectDB()

    const service = await Service.findById(params.id).populate(
      "provider",
      "name avatar rating reviewCount location isVerified bio phone",
    )

    if (!service) {
      console.log("GET /api/services/[id] - Service not found")
      return NextResponse.json({ message: "Service not found" }, { status: 404 })
    }

    console.log("GET /api/services/[id] - Service found:", service.title)
    return NextResponse.json({ service })
  } catch (error) {
    console.error("GET /api/services/[id] - Internal error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    console.log("PUT /api/services/[id] - params:", params)

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const service = await Service.findById(params.id)
    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 })
    }

    // Check if the user owns this service
    console.log("User from token:", user)
    console.log("Service provider:", service.provider)
    console.log("User ID from token:", user.userId)
    console.log("Service provider toString:", service.provider.toString())
    
    // The JWT token contains userId, but we need to compare with the service provider ID
    if (service.provider.toString() !== user.userId) {
      console.log("Access denied - User ID mismatch")
      return NextResponse.json({ message: "You can only edit your own services" }, { status: 403 })
    }
    
    console.log("Access granted - User owns this service")

    const body = await request.json()
    const {
      title,
      description,
      category,
      price,
      priceType,
      location,
      tags,
      images,
    } = body

    // Validate required fields
    if (!title || !description || !category || !price || !location) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 })
    }

    const updatedService = await Service.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        category,
        price: parseFloat(price),
        priceType,
        location,
        tags: tags || [],
        images: images || [],
      },
      { new: true }
    )

    console.log("PUT /api/services/[id] - Service updated:", updatedService.title)
    return NextResponse.json({ 
      message: "Service updated successfully",
      service: updatedService 
    })
  } catch (error) {
    console.error("PUT /api/services/[id] - Internal error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    console.log("DELETE /api/services/[id] - params:", params)

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const service = await Service.findById(params.id)
    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 })
    }

    // Check if the user owns this service
    console.log("DELETE - User from token:", user)
    console.log("DELETE - Service provider:", service.provider)
    console.log("DELETE - User ID from token:", user.userId)
    console.log("DELETE - Service provider toString:", service.provider.toString())
    
    // The JWT token contains userId, but we need to compare with the service provider ID
    if (service.provider.toString() !== user.userId) {
      console.log("DELETE - Access denied - User ID mismatch")
      return NextResponse.json({ message: "You can only delete your own services" }, { status: 403 })
    }
    
    console.log("DELETE - Access granted - User owns this service")

    await Service.findByIdAndDelete(params.id)

    console.log("DELETE /api/services/[id] - Service deleted:", service.title)
    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/services/[id] - Internal error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
