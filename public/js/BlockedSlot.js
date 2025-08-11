const mongoose = require("mongoose")

const blockedSlotSchema = new mongoose.Schema(
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
      type: String,
      required: true, // Format: "14:00-15:00"
    },
    reason: {
      type: String,
      enum: ["maintenance", "event", "holiday", "other"],
      required: true,
    },
    description: String,
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("BlockedSlot", blockedSlotSchema)
