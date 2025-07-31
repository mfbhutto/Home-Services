import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Service from "@/lib/models/Service"

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
