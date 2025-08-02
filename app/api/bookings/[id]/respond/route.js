import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Booking from "@/lib/models/Booking"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"
import { createBookingNotifications } from "@/lib/notifications"

export async function PUT(request, { params }) {
  try {
    console.log("PUT /api/bookings/[id]/respond - Responding to booking")

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
    const { status, finalAmount, paymentMethod, serviceProviderNote } = body

    // Validate required fields
    if (!status || !finalAmount || !paymentMethod) {
      return NextResponse.json({ 
        message: "Status, final amount, and payment method are required" 
      }, { status: 400 })
    }

    // Validate status
    if (!["confirmed", "rejected"].includes(status)) {
      return NextResponse.json({ 
        message: "Status must be either 'confirmed' or 'rejected'" 
      }, { status: 400 })
    }

    // Validate payment method
    if (!["cash", "card"].includes(paymentMethod)) {
      return NextResponse.json({ 
        message: "Payment method must be either 'cash' or 'card'" 
      }, { status: 400 })
    }

    // Validate final amount
    if (finalAmount <= 0) {
      return NextResponse.json({ 
        message: "Final amount must be greater than 0" 
      }, { status: 400 })
    }

    // Find the booking
    const booking = await Booking.findById(id).populate("service provider client")
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Check if the current user is the service provider
    if (booking.provider._id.toString() !== user.userId) {
      return NextResponse.json({ 
        message: "You can only respond to bookings for your own services" 
      }, { status: 403 })
    }

    // Check if booking is in pending status
    if (booking.status !== "pending") {
      return NextResponse.json({ 
        message: "Can only respond to pending bookings" 
      }, { status: 400 })
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status,
        finalAmount,
        paymentMethod,
        serviceProviderNote,
      },
      { new: true }
    ).populate("service provider client")

    // Create notification for client
    try {
      await createBookingNotifications(updatedBooking, status)
    } catch (error) {
      console.error("Error creating notification:", error)
      // Don't fail the booking update if notification fails
    }

    console.log("PUT /api/bookings/[id]/respond - Booking updated successfully")
    return NextResponse.json({ 
      message: "Booking response submitted successfully",
      booking: updatedBooking 
    })
  } catch (error) {
    console.error("PUT /api/bookings/[id]/respond - Internal error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 