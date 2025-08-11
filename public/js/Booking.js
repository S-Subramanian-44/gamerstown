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
      type: String,
      required: true, // Format: "14:00-15:00"
    },
    numberOfPlayers: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    specialRequests: String,
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Booking", bookingSchema)
