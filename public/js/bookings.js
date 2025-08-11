const express = require("express")
const Booking = require("../models/Booking")
const Cafe = require("../models/Cafe")
const User = require("../models/User")
const Payment = require("../models/Payment")
const { auth, adminAuth } = require("../middleware/auth")
const router = express.Router()

// Create booking
router.post("/", auth, async (req, res) => {
  try {
    const { cafeId, date, slot, numberOfPlayers, specialRequests } = req.body

    // Validate cafe
    const cafe = await Cafe.findById(cafeId)
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" })
    }

    // Check availability
    const existingBookings = await Booking.find({
      cafeId,
      date: new Date(date),
      slot,
      status: { $in: ["confirmed", "pending"] },
    })

    const totalBooked = existingBookings.reduce((sum, b) => sum + b.numberOfPlayers, 0)

    if (totalBooked + numberOfPlayers > cafe.numberOfSetups) {
      return res.status(400).json({ message: "Not enough slots available" })
    }

    // Calculate total amount
    const totalAmount = cafe.hourlyPricing * numberOfPlayers

    // Check user wallet balance
    if (req.user.walletBalance < totalAmount) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
        required: totalAmount,
        available: req.user.walletBalance,
      })
    }

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      cafeId,
      date: new Date(date),
      slot,
      numberOfPlayers,
      totalAmount,
      specialRequests,
      status: "confirmed",
      paymentStatus: "paid",
    })

    await booking.save()

    // Deduct from wallet
    req.user.walletBalance -= totalAmount
    await req.user.save()

    // Create payment record
    const payment = new Payment({
      bookingId: booking._id,
      userId: req.user._id,
      amount: totalAmount,
      type: "booking",
      method: "wallet",
      status: "success",
    })

    await payment.save()

    await booking.populate("cafeId", "name address")

    res.status(201).json({
      message: "Booking confirmed successfully",
      booking,
      remainingBalance: req.user.walletBalance,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user bookings
router.get("/user", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("cafeId", "name address city images")
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get admin bookings
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "cafeId",
        match: { adminId: req.user._id },
        select: "name address",
      })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })

    // Filter out bookings where cafeId is null (not belonging to this admin)
    const filteredBookings = bookings.filter((booking) => booking.cafeId)

    res.json(filteredBookings)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Cancel booking
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" })
    }

    // Check if booking can be cancelled (e.g., at least 2 hours before)
    const bookingDateTime = new Date(booking.date)
    const [startHour] = booking.slot.split("-")[0].split(":")
    bookingDateTime.setHours(Number.parseInt(startHour), 0, 0, 0)

    const now = new Date()
    const timeDiff = bookingDateTime.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)

    if (hoursDiff < 2) {
      return res.status(400).json({
        message: "Cannot cancel booking less than 2 hours before the slot",
      })
    }

    // Cancel booking
    booking.status = "cancelled"
    await booking.save()

    // Refund to wallet if payment was successful
    if (booking.paymentStatus === "paid") {
      req.user.walletBalance += booking.totalAmount
      await req.user.save()

      // Create refund payment record
      const refundPayment = new Payment({
        bookingId: booking._id,
        userId: req.user._id,
        amount: booking.totalAmount,
        type: "booking",
        method: "wallet",
        status: "success",
      })
      await refundPayment.save()
    }

    res.json({
      message: "Booking cancelled successfully",
      refundAmount: booking.paymentStatus === "paid" ? booking.totalAmount : 0,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
