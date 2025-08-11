const mongoose = require("mongoose")

const BlockedSlotSchema = new mongoose.Schema(
  {
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
    reason: {
      type: String,
      enum: ["maintenance", "private_event", "booked_by_user", "admin_blocked"],
      default: "admin_blocked",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false, // Only required if blocked due to a user booking
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin user who blocked it
      required: false,
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

// Ensure unique combination of cafe, date, and slot
BlockedSlotSchema.index({ cafeId: 1, date: 1, slot: 1 }, { unique: true })

module.exports = mongoose.model("BlockedSlot", BlockedSlotSchema)
