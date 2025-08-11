const mongoose = require("mongoose")

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false, // Optional, for wallet recharges not tied to a booking
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["recharge", "booking_payment", "booking_refund"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["wallet", "card", "upi"], // Extend as needed
      default: "wallet",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    transactionId: {
      type: String, // External transaction ID if applicable
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Payment", PaymentSchema)
