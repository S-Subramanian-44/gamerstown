const mongoose = require("mongoose")

const cafeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a cafe name"],
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "Please add a city"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  hourlyRate: {
    type: Number,
    required: [true, "Please add an hourly rate"],
    min: [0, "Hourly rate cannot be negative"],
  },
  images: {
    type: [String], // Array of image URLs
    default: [],
  },
  amenities: {
    type: [String], // e.g., ['High-speed Internet', 'Snacks', 'VR']
    default: [],
  },
  games: {
    type: [String], // e.g., ['Valorant', 'CS:GO', 'Dota 2']
    default: [],
  },
  openingTime: {
    type: String, // e.g., "09:00"
    required: [true, "Please add an opening time"],
  },
  closingTime: {
    type: String, // e.g., "23:00"
    required: [true, "Please add a closing time"],
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Cafe", cafeSchema)
