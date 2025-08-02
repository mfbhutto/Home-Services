import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Booking from "@/lib/models/Booking"
import Service from "@/lib/models/Service"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"
import { createBookingNotifications } from "@/lib/notifications"

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

    const { serviceId, message, preferredDate } = await request.json()

    // Get service details
    const service = await Service.findById(serviceId)
    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 })
    }

    // Create booking
    const booking = await Booking.create({
      client: decoded.userId,
      provider: service.provider,
      service: serviceId,
      message,
      preferredDate: new Date(preferredDate),
    })

    const populatedBooking = await Booking.findById(booking._id)
      .populate("client", "name email phone")
      .populate("provider", "name email phone")
      .populate("service", "title category price")

    // Create notification for service provider
    try {
      await createBookingNotifications(populatedBooking, "created")
    } catch (error) {
      console.error("Error creating notification:", error)
      // Don't fail the booking creation if notification fails
    }

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: populatedBooking,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request) {
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

    const bookings = await Booking.find({
      $or: [{ client: decoded.userId }, { provider: decoded.userId }],
    })
      .populate("client", "name email phone avatar")
      .populate("provider", "name email phone avatar")
      .populate("service", "title category price images")
      .sort({ createdAt: -1 })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Get bookings error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
