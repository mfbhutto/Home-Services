import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Booking from "@/lib/models/Booking"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"
import { createBookingNotifications } from "@/lib/notifications"

export async function PUT(request, { params }) {
  try {
    console.log("PUT /api/bookings/[id]/complete - Completing booking")

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const { id } = params
    const body = await request.json()
    const { completionNote } = body

    // Find the booking
    const booking = await Booking.findById(id).populate("service provider client")
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Check if the current user is the service provider
    if (booking.provider._id.toString() !== user.userId) {
      return NextResponse.json({ 
        message: "You can only complete bookings for your own services" 
      }, { status: 403 })
    }

    // Check if booking is in confirmed status
    if (booking.status !== "confirmed") {
      return NextResponse.json({ 
        message: "Can only complete confirmed bookings" 
      }, { status: 400 })
    }

    // Update the booking to completed status
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "completed",
        completionNote: completionNote || "",
      },
      { new: true }
    ).populate("service provider client")

    // Create notification for client
    try {
      await createBookingNotifications(updatedBooking, "completed")
    } catch (error) {
      console.error("Error creating notification:", error)
      // Don't fail the booking completion if notification fails
    }

    console.log("PUT /api/bookings/[id]/complete - Booking completed successfully")
    return NextResponse.json({ 
      message: "Booking marked as completed successfully",
      booking: updatedBooking 
    })
  } catch (error) {
    console.error("PUT /api/bookings/[id]/complete - Internal error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 