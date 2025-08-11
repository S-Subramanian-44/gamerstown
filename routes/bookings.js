const express = require("express")
const Booking = require("../models/Booking")
const Cafe = require("../models/Cafe")
const User = require("../models/User")
const Payment = require("../models/Payment")
const BlockedSlot = require("../models/BlockedSlot")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// Helper function to check if a slot is available
const isSlotAvailable = async (cafeId, date, slot) => {
  const bookingExists = await Booking.findOne({
    cafeId,
    date: new Date(date),
    slot,
    status: { $in: ["pending", "confirmed"] },
  })

  const blockedExists = await BlockedSlot.findOne({
    cafeId,
    date: new Date(date),
    slot,
  })

  return !bookingExists && !blockedExists
}

// @route   GET /api/bookings/user
// @desc    Get all bookings for the authenticated user
// @access  Private (User only)
router.get("/user", protect, authorize("user"), async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("cafeId", "name address city images hourlyRate") // Populate cafe details
      .sort({ bookingTime: -1 }) // Sort by most recent booking

    res.status(200).json({ success: true, data: bookings })
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    res.status(500).json({ success: false, message: "Server error fetching bookings" })
  }
})

// @route   GET /api/bookings/cafe/:cafeId/availability
// @desc    Get available slots for a specific cafe on a given date
// @access  Public
router.get("/cafe/:cafeId/availability", async (req, res) => {
  const { cafeId } = req.params
  const { date } = req.query

  if (!date) {
    return res.status(400).json({ success: false, message: "Date is required" })
  }

  try {
    const cafe = await Cafe.findById(cafeId)
    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" })
    }

    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0) // Normalize date to start of day

    // Get existing bookings and blocked slots for the selected date
    const existingBookings = await Booking.find({
      cafeId,
      date: selectedDate,
      status: { $in: ["pending", "confirmed"] },
    }).select("slot")

    const blockedSlots = await BlockedSlot.find({
      cafeId,
      date: selectedDate,
    }).select("slot")

    const occupiedSlots = new Set([...existingBookings.map((b) => b.slot), ...blockedSlots.map((bs) => bs.slot)])

    // Generate all possible slots for the cafe's operating hours
    const availableSlots = []
    const [openHour, openMinute] = cafe.openingTime.split(":").map(Number)
    const [closeHour, closeMinute] = cafe.closingTime.split(":").map(Number)

    let currentTime = new Date(selectedDate)
    currentTime.setHours(openHour, openMinute, 0, 0)

    const closingTime = new Date(selectedDate)
    closingTime.setHours(closeHour, closeMinute, 0, 0)

    // If the selected date is today, only show future slots
    const now = new Date()
    if (selectedDate.toDateString() === now.toDateString()) {
      if (currentTime < now) {
        currentTime = new Date(now)
        // Round up to the next hour if current time is not on the hour
        if (currentTime.getMinutes() > 0) {
          currentTime.setHours(currentTime.getHours() + 1, 0, 0, 0)
        }
      }
    }

    while (currentTime.getTime() < closingTime.getTime()) {
      const start = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      currentTime.setHours(currentTime.getHours() + 1) // 1-hour slots
      const end = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      const slot = `${start}-${end}`

      if (!occupiedSlots.has(slot)) {
        availableSlots.push(slot)
      }
    }

    res.status(200).json({ success: true, data: availableSlots })
  } catch (error) {
    console.error("Error fetching cafe availability:", error)
    res.status(500).json({ success: false, message: "Server error fetching availability" })
  }
})

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (User only)
router.post("/", protect, authorize("user"), async (req, res) => {
  const { cafeId, date, slot, durationHours, numberOfPlayers } = req.body

  if (!cafeId || !date || !slot || !durationHours || !numberOfPlayers) {
    return res.status(400).json({ success: false, message: "Please provide all booking details" })
  }

  try {
    const cafe = await Cafe.findById(cafeId)
    if (!cafe) {
      return res.status(404).json({ success: false, message: "Cafe not found" })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Validate date is not in the past
    const bookingDateTime = new Date(`${date}T${slot.split("-")[0]}:00`) // Combine date and start time
    if (bookingDateTime < new Date()) {
      return res.status(400).json({ success: false, message: "Cannot book for a past date or time." })
    }

    // Check slot availability
    const isAvailable = await isSlotAvailable(cafeId, date, slot)
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: "Selected slot is not available." })
    }

    const totalAmount = cafe.hourlyRate * durationHours

    if (user.walletBalance < totalAmount) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance." })
    }

    // Deduct from wallet
    user.walletBalance -= totalAmount
    await user.save()

    // Create payment record
    const payment = new Payment({
      userId: user._id,
      amount: totalAmount,
      type: "booking_payment",
      paymentMethod: "wallet",
      status: "completed",
    })
    await payment.save()

    const booking = new Booking({
      userId: user._id,
      cafeId,
      date: new Date(date),
      slot,
      durationHours,
      numberOfPlayers, // Added numberOfPlayers
      totalAmount,
      paymentId: payment._id, // Link payment to booking
      status: "confirmed",
      paymentStatus: "paid",
    })
    await booking.save()

    // Link payment to booking (update payment with bookingId)
    payment.bookingId = booking._id
    await payment.save()

    // Block the slot for this booking
    const newBlockedSlot = new BlockedSlot({
      cafeId,
      date: new Date(date),
      slot,
      bookingId: booking._id,
      reason: "booked_by_user",
    })
    await newBlockedSlot.save()

    res.status(201).json({
      success: true,
      message: "Booking created and paid successfully!",
      booking,
      newWalletBalance: user.walletBalance,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    res.status(500).json({ success: false, message: "Server error creating booking" })
  }
})

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private (User only)
router.put("/:id/cancel", protect, authorize("user"), async (req, res) => {
  const { reason } = req.body
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    if (booking.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" })
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Calculate refund based on cancellation policy (example: 2-hour policy)
    const bookingDateTime = new Date(`${booking.date.toISOString().split("T")[0]}T${booking.slot.split("-")[0]}:00`)
    const now = new Date()
    const timeDifferenceHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundAmount = 0
    let cancellationCharge = 0
    let policyMessage = ""

    if (timeDifferenceHours >= 2) {
      refundAmount = booking.totalAmount // Full refund
      policyMessage = "Full refund (cancelled more than 2 hours in advance)."
    } else if (timeDifferenceHours >= 1) {
      refundAmount = booking.totalAmount * 0.5 // 50% refund
      cancellationCharge = booking.totalAmount * 0.5
      policyMessage = "50% refund (cancelled less than 2 hours but more than 1 hour in advance)."
    } else {
      refundAmount = 0 // No refund
      cancellationCharge = booking.totalAmount
      policyMessage = "No refund (cancelled less than 1 hour in advance)."
    }

    // Update booking status
    booking.status = "cancelled"
    booking.cancellationReason = reason || "User cancelled"
    booking.refundAmount = refundAmount
    booking.paymentStatus = refundAmount > 0 ? "refunded" : booking.paymentStatus // Update payment status
    await booking.save()

    // Unblock the slot
    await BlockedSlot.deleteOne({ bookingId: booking._id })

    // Process refund to user's wallet
    if (refundAmount > 0) {
      user.walletBalance += refundAmount
      await user.save()

      // Create refund payment record
      const refundPayment = new Payment({
        userId: user._id,
        bookingId: booking._id,
        amount: refundAmount,
        type: "booking_refund",
        paymentMethod: "wallet",
        status: "completed",
      })
      await refundPayment.save()
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      refundAmount,
      cancellationCharge,
      newWalletBalance: user.walletBalance,
      policy: policyMessage,
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    res.status(500).json({ success: false, message: "Server error cancelling booking" })
  }
})

// Admin routes
// @route   GET /api/bookings/admin
// @desc    Get all bookings (for admin)
// @access  Private (Admin only)
router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "username email")
      .populate("cafeId", "name address")
      .sort({ bookingTime: -1 })
    res.json({ success: true, data: bookings })
  } catch (error) {
    console.error("Error fetching all bookings (admin):", error)
    res.status(500).json({ success: false, message: "Server error fetching bookings" })
  }
})

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (for admin)
// @access  Private (Admin only)
router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  const { status } = req.body
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    booking.status = status
    await booking.save()
    res.json({ success: true, message: "Booking status updated", data: booking })
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({ success: false, message: "Server error updating booking status" })
  }
})

module.exports = router
