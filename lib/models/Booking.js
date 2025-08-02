import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    finalAmount: {
      type: Number,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
    },
    serviceProviderNote: {
      type: String,
    },
    completionNote: {
      type: String,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema)
