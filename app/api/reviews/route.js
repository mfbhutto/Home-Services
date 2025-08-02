import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Review from "@/lib/models/Review"
import Booking from "@/lib/models/Booking"
import Service from "@/lib/models/Service"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"

export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const serviceProviderId = searchParams.get("serviceProviderId")
    const serviceId = searchParams.get("serviceId")
    const limit = parseInt(searchParams.get("limit")) || 10

    let query = {}
    if (serviceProviderId) {
      query.serviceProviderId = serviceProviderId
    }
    if (serviceId) {
      query.serviceId = serviceId
    }

    const reviews = await Review.find(query)
      .populate("clientId", "name avatar")
      .populate("serviceProviderId", "name")
      .populate("serviceId", "title")
      .populate("bookingId", "preferredDate")
      .sort({ createdAt: -1 })
      .limit(limit)

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Get reviews error:", error)
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

    const { bookingId, rating, comment } = await request.json()

    // Validate input
    if (!bookingId || !rating || !comment) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (comment.length > 500) {
      return NextResponse.json({ message: "Comment must be 500 characters or less" }, { status: 400 })
    }

    // Get the booking
    const booking = await Booking.findById(bookingId)
      .populate("service", "provider")
      .populate("provider", "_id")
      .populate("client", "_id")

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Check if user is the client of this booking
    if (booking.client._id.toString() !== decoded.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Check if booking is completed
    if (booking.status !== "completed") {
      return NextResponse.json({ message: "Can only review completed bookings" }, { status: 400 })
    }

    // Check if already reviewed
    if (booking.reviewed) {
      return NextResponse.json({ message: "Booking already reviewed" }, { status: 400 })
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId })
    if (existingReview) {
      return NextResponse.json({ message: "Review already exists for this booking" }, { status: 400 })
    }

    // Create the review
    const review = await Review.create({
      bookingId,
      serviceProviderId: booking.provider._id,
      clientId: booking.client._id,
      serviceId: booking.service._id,
      rating,
      comment,
    })

    // Mark booking as reviewed
    await Booking.findByIdAndUpdate(bookingId, { reviewed: true })

    // Update service rating
    await updateServiceRating(booking.service._id)

    return NextResponse.json({ 
      message: "Review submitted successfully", 
      review 
    })
  } catch (error) {
    console.error("Create review error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

async function updateServiceRating(serviceId) {
  try {
    const reviews = await Review.find({ serviceId })
    if (reviews.length === 0) return

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    await Service.findByIdAndUpdate(serviceId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
    })
  } catch (error) {
    console.error("Error updating service rating:", error)
  }
} 