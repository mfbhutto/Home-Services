import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Service from "@/lib/models/Service"
import User from "@/lib/models/User"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const location = searchParams.get("location")
    const search = searchParams.get("search")
    const provider = searchParams.get("provider")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 12

    console.log("GET /api/services - Query parameters:", {
      category,
      location,
      search,
      provider,
      page,
      limit
    })

    // Debug all headers
    console.log("GET /api/services - All headers:", Object.fromEntries(request.headers.entries()))
    console.log("GET /api/services - Header keys:", Array.from(request.headers.keys()))

    const query = { isActive: true }

    if (category && category !== "all") {
      query.category = category
    }

    if (location) {
      query.location = { $regex: location, $options: "i" }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Handle provider filter for dashboard
    if (provider === "me") {
      // Get user ID from token
      const token = getTokenFromRequest(request)
      console.log("GET /api/services - provider=me, token found:", !!token)
      
      if (token) {
        const decoded = verifyToken(token)
        console.log("GET /api/services - token decoded:", !!decoded)
        console.log("GET /api/services - decoded userId:", decoded?.userId)
        
        if (decoded) {
          query.provider = decoded.userId
          console.log("GET /api/services - Added provider filter:", decoded.userId)
        }
      }
    }

    console.log("GET /api/services - Final query:", JSON.stringify(query, null, 2))

    const skip = (page - 1) * limit

    const services = await Service.find(query)
      .populate("provider", "name avatar rating reviewCount location isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    console.log("GET /api/services - Found services:", services.length)
    services.forEach((service, index) => {
      console.log(`Service ${index + 1}:`, {
        title: service.title,
        provider: service.provider,
        providerId: service.provider?._id || service.provider
      })
    })

    const total = await Service.countDocuments(query)

    return NextResponse.json({
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get services error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    // Debug logging
    console.log("POST /api/services - Headers:", Object.fromEntries(request.headers.entries()))
    console.log("POST /api/services - Authorization header:", request.headers.get("authorization"))
    console.log("POST /api/services - Authorization header (lowercase):", request.headers.get("authorization"))
    console.log("POST /api/services - All header keys:", Array.from(request.headers.keys()))

    // Try multiple ways to get the authorization header
    const authHeader1 = request.headers.get("authorization")
    const authHeader2 = request.headers.get("Authorization")
    const authHeader3 = request.headers.authorization
    
    console.log("POST /api/services - authHeader1:", authHeader1)
    console.log("POST /api/services - authHeader2:", authHeader2)
    console.log("POST /api/services - authHeader3:", authHeader3)

    const token = getTokenFromRequest(request)
    console.log("POST /api/services - Extracted token:", token ? "Found" : "Not found")
    
    if (!token) {
      // Fallback: try to extract token manually
      const authHeader = authHeader1 || authHeader2 || authHeader3
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const fallbackToken = authHeader.substring(7)
        console.log("POST /api/services - Fallback token extracted:", fallbackToken.substring(0, 20) + "...")
        
        const decoded = verifyToken(fallbackToken)
        if (decoded) {
          console.log("POST /api/services - Fallback token is valid")
          
          const serviceData = await request.json()
          console.log("POST /api/services - Service data:", { title: serviceData.title, category: serviceData.category })

          const service = await Service.create({
            ...serviceData,
            provider: decoded.userId,
          })

          const populatedService = await Service.findById(service._id).populate(
            "provider",
            "name avatar rating reviewCount location isVerified",
          )

          return NextResponse.json(
            {
              message: "Service created successfully",
              service: populatedService,
            },
            { status: 201 },
          )
        }
      }
      
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    console.log("POST /api/services - Decoded token:", decoded ? "Valid" : "Invalid")
    
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const serviceData = await request.json()
    console.log("POST /api/services - Service data:", { title: serviceData.title, category: serviceData.category })

    const service = await Service.create({
      ...serviceData,
      provider: decoded.userId,
    })

    const populatedService = await Service.findById(service._id).populate(
      "provider",
      "name avatar rating reviewCount location isVerified",
    )

    return NextResponse.json(
      {
        message: "Service created successfully",
        service: populatedService,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create service error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
