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
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 12

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

    const skip = (page - 1) * limit

    const services = await Service.find(query)
      .populate("provider", "name avatar rating reviewCount location isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

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

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const serviceData = await request.json()

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
