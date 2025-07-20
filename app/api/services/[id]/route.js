import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Service from "@/lib/models/Service"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const service = await Service.findById(params.id).populate(
      "provider",
      "name avatar rating reviewCount location isVerified bio phone",
    )

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Get service error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
