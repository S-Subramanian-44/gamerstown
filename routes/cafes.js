const express = require("express")
const Cafe = require("../models/Cafe")
const Review = require("../models/Review") // Assuming you have a Review model
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/cafes
// @desc    Get all cafes with optional filters
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { search, city, amenities, games, minPrice, maxPrice } = req.query
    const query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { amenities: { $regex: search, $options: "i" } },
        { games: { $regex: search, $options: "i" } },
      ]
    }
    if (city) {
      query.city = { $regex: city, $options: "i" }
    }
    if (amenities) {
      query.amenities = { $all: amenities.split(",").map((a) => new RegExp(a.trim(), "i")) }
    }
    if (games) {
      query.games = { $all: games.split(",").map((g) => new RegExp(g.trim(), "i")) }
    }
    if (minPrice || maxPrice) {
      query.hourlyRate = {}
      if (minPrice) query.hourlyRate.$gte = Number.parseFloat(minPrice)
      if (maxPrice) query.hourlyRate.$lte = Number.parseFloat(maxPrice)
    }

    const cafes = await Cafe.find(query).sort({ averageRating: -1, totalReviews: -1 })
    res.status(200).json({ success: true, data: cafes })
  } catch (error) {
    console.error("Error fetching cafes:", error)
    res.status(500).json({ success: false, message: "Server error fetching cafes" })
  }
})

// @route   GET /api/cafes/cities/distinct
// @desc    Get distinct cities where cafes are located
// @access  Public
router.get("/cities/distinct", async (req, res) => {
  try {
    const cities = await Cafe.distinct("city")
    res.status(200).json(cities) // Return as a direct array
  } catch (error) {
    console.error("Error fetching distinct cities:", error)
    res.status(500).json({ success: false, message: "Server error fetching cities" })
  }
})

// @route   GET /api/cafes/:id
// @desc    Get single cafe by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id)
    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" })
    }
    res.status(200).json({ success: true, data: cafe })
  } catch (error) {
    console.error("Error fetching cafe by ID:", error)
    res.status(500).json({ success: false, message: "Server error fetching cafe" })
  }
})

// Admin routes (protected and authorized)
// @route   POST /api/cafes
// @desc    Create new cafe
// @access  Private (Admin only)
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const newCafe = new Cafe(req.body)
    await newCafe.save()
    res.status(201).json({ success: true, data: newCafe })
  } catch (error) {
    console.error("Error creating cafe:", error)
    res.status(500).json({ success: false, message: "Server error creating cafe" })
  }
})

// @route   PUT /api/cafes/:id
// @desc    Update cafe by ID
// @access  Private (Admin only)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" })
    }
    res.json({ success: true, data: cafe })
  } catch (error) {
    console.error("Error updating cafe:", error)
    res.status(500).json({ success: false, message: "Server error updating cafe" })
  }
})

// @route   DELETE /api/cafes/:id
// @desc    Delete cafe by ID
// @access  Private (Admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndDelete(req.params.id)
    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" })
    }
    res.json({ success: true, message: "Cafe deleted successfully" })
  } catch (error) {
    console.error("Error deleting cafe:", error)
    res.status(500).json({ success: false, message: "Server error deleting cafe" })
  }
})

module.exports = router
