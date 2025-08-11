const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["booking", "wallet_recharge"],
      required: true,
    },
    method: {
      type: String,
      enum: ["razorpay", "wallet", "stripe"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Payment", paymentSchema)
