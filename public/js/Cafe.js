const mongoose = require("mongoose")

const cafeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    images: [
      {
        type: String, // Base64 or URL
      },
    ],
    amenities: [
      {
        type: String,
        enum: ["AC", "WiFi", "Snacks", "VR", "Parking", "Washroom", "Food Court"],
      },
    ],
    platforms: [
      {
        type: String,
        enum: ["PC", "PS5", "PS4", "Xbox", "Nintendo Switch", "Mobile Gaming"],
      },
    ],
    hourlyPricing: {
      type: Number,
      required: true,
    },
    numberOfSetups: {
      type: Number,
      required: true,
    },
    contact: {
      phone: String,
      email: String,
    },
    operatingHours: {
      open: {
        type: String,
        required: true, // Format: "09:00"
      },
      close: {
        type: String,
        required: true, // Format: "23:00"
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Cafe", cafeSchema)
