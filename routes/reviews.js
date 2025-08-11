const express = require("express")
const Review = require("../models/Review")
const Booking = require("../models/Booking")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/reviews
// @desc    Submit a review for a completed booking
// @access  Private (User only)
router.post("/", protect, authorize("user"), async (req, res) => {
  const { bookingId, rating, comment } = req.body

  if (!bookingId || !rating) {
    return res.status(400).json({ success: false, message: "Booking ID and rating are required" })
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" })
  }

  try {
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    if (booking.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to review this booking" })
    }

    // Check if booking is completed (or past its time)
    const bookingDateTime = new Date(`${booking.date.toISOString().split("T")[0]}T${booking.slot.split("-")[0]}:00`)
    if (bookingDateTime > new Date()) {
      return res.status(400).json({ success: false, message: "Cannot review an upcoming or ongoing booking" })
    }

    if (booking.reviewed) {
      return res.status(400).json({ success: false, message: "This booking has already been reviewed" })
    }

    const review = await Review.create({
      userId: req.user.id,
      cafeId: booking.cafeId,
      bookingId,
      rating,
      comment,
    })

    // Mark booking as reviewed
    booking.reviewed = true
    await booking.save()

    res.status(201).json({ success: true, message: "Review submitted successfully!", data: review })
  } catch (error) {
    console.error("Error submitting review:", error)
    // Handle duplicate key error for unique bookingId
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "This booking has already been reviewed." })
    }
    res.status(500).json({ success: false, message: "Server error submitting review" })
  }
})

// @route   GET /api/reviews/cafe/:cafeId
// @desc    Get reviews for a specific cafe
// @access  Public
router.get("/cafe/:cafeId", async (req, res) => {
  try {
    const reviews = await Review.find({ cafeId: req.params.cafeId }).populate("userId", "username") // Populate user name
    res.status(200).json({ success: true, data: reviews })
  } catch (error) {
    console.error("Error fetching cafe reviews:", error)
    res.status(500).json({ success: false, message: "Server error fetching reviews" })
  }
})

// Admin routes (protected and authorized)
// @route   GET /api/reviews/admin
// @desc    Get all reviews (for admin)
// @access  Private (Admin only)
router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "username email")
      .populate("cafeId", "name")
      .populate("bookingId", "date slot")
      .sort({ createdAt: -1 })
    res.json({ success: true, data: reviews })
  } catch (error) {
    console.error("Error fetching all reviews (admin):", error)
    res.status(500).json({ success: false, message: "Server error fetching reviews" })
  }
})

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (for admin)
// @access  Private (Admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" })
    }

    await review.remove() // This will trigger the post('remove') hook to update cafe rating

    res.status(200).json({ success: true, message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    res.status(500).json({ success: false, message: "Server error deleting review" })
  }
})

module.exports = router
