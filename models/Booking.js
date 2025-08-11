const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    slot: {
      type: String, // e.g., "10:00-11:00"
      required: true,
    },
    durationHours: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfPlayers: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed", // Default to confirmed if payment is handled upfront
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "paid", // Default to paid if payment is handled upfront
    },
    bookingTime: {
      type: Date,
      default: Date.now,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Booking", bookingSchema)
