const express = require("express")
const Cafe = require("../models/Cafe")
const Booking = require("../models/Booking")
const BlockedSlot = require("../models/BlockedSlot")
const Review = require("../models/Review")
const { auth, adminAuth } = require("../middleware/auth")
const router = express.Router()

// Get all cafes with filters
router.get("/", async (req, res) => {
  try {
    const { city, amenities, platforms, minPrice, maxPrice, search } = req.query

    const filter = { isActive: true }

    if (city) filter.city = new RegExp(city, "i")
    if (search) filter.name = new RegExp(search, "i")
    if (amenities) filter.amenities = { $in: amenities.split(",") }
    if (platforms) filter.platforms = { $in: platforms.split(",") }
    if (minPrice || maxPrice) {
      filter.hourlyPricing = {}
      if (minPrice) filter.hourlyPricing.$gte = Number(minPrice)
      if (maxPrice) filter.hourlyPricing.$lte = Number(maxPrice)
    }

    const cafes = await Cafe.find(filter).populate("adminId", "name email")
    res.json(cafes)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get cafe by ID
router.get("/:id", async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id).populate("adminId", "name email")
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" })
    }

    // Get reviews
    const reviews = await Review.find({ cafeId: req.params.id })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({ cafe, reviews })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get available slots for a cafe on a specific date
router.get("/:id/availability/:date", async (req, res) => {
  try {
    const { id, date } = req.params
    const cafe = await Cafe.findById(id)

    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" })
    }

    const targetDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (targetDate < today) {
      return res.json({ availableSlots: [] })
    }

    // Generate time slots based on operating hours
    const openHour = Number.parseInt(cafe.operatingHours.open.split(":")[0])
    const closeHour = Number.parseInt(cafe.operatingHours.close.split(":")[0])

    const allSlots = []
    for (let hour = openHour; hour < closeHour; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`
      allSlots.push(`${startTime}-${endTime}`)
    }

    // Get booked slots
    const bookedSlots = await Booking.find({
      cafeId: id,
      date: targetDate,
      status: { $in: ["confirmed", "pending"] },
    }).select("slot numberOfPlayers")

    // Get blocked slots
    const blockedSlots = await BlockedSlot.find({
      cafeId: id,
      date: targetDate,
    }).select("slot")

    // Calculate available slots
    const availableSlots = allSlots.map((slot) => {
      const booked = bookedSlots.filter((b) => b.slot === slot)
      const totalBooked = booked.reduce((sum, b) => sum + b.numberOfPlayers, 0)
      const isBlocked = blockedSlots.some((b) => b.slot === slot)

      return {
        slot,
        available: !isBlocked && cafe.numberOfSetups - totalBooked > 0,
        remainingSlots: Math.max(0, cafe.numberOfSetups - totalBooked),
      }
    })

    res.json({ availableSlots })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create new cafe (Admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const cafeData = {
      ...req.body,
      adminId: req.user._id,
    }

    const cafe = new Cafe(cafeData)
    await cafe.save()

    // Update admin's associated cafe
    req.user.associatedCafeId = cafe._id
    await req.user.save()

    res.status(201).json({ message: "Cafe created successfully", cafe })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update cafe (Admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ _id: req.params.id, adminId: req.user._id })

    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found or unauthorized" })
    }

    Object.assign(cafe, req.body)
    await cafe.save()

    res.json({ message: "Cafe updated successfully", cafe })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get cities with cafes
router.get("/data/cities", async (req, res) => {
  try {
    const cities = await Cafe.distinct("city", { isActive: true })
    res.json(cities)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
