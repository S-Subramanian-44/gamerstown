const express = require("express")
const Payment = require("../models/Payment")
const User = require("../models/User")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/payments/recharge
// @desc    Recharge user's wallet
// @access  Private (User only)
router.post("/recharge", protect, authorize("user"), async (req, res) => {
  const { amount } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Please provide a valid amount to recharge" })
  }

  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    user.walletBalance += amount
    await user.save()

    const payment = new Payment({
      userId: user._id,
      amount,
      type: "recharge",
      paymentMethod: "wallet", // Assuming wallet recharge is the method
      status: "completed",
    })
    await payment.save()

    res.status(200).json({
      success: true,
      message: `Wallet recharged successfully with ₹${amount.toFixed(2)}`,
      data: { walletBalance: user.walletBalance },
    })
  } catch (error) {
    console.error("Error recharging wallet:", error)
    res.status(500).json({ success: false, message: "Server error during wallet recharge" })
  }
})

// @route   GET /api/payments/history
// @desc    Get payment history for the authenticated user
// @access  Private (User only)
router.get("/history", protect, authorize("user"), async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate({
        path: "bookingId",
        populate: {
          path: "cafeId",
          select: "name", // Only populate cafe name for booking details
        },
        select: "date slot cafeId", // Select relevant booking fields
      })
      .sort({ createdAt: -1 }) // Sort by most recent

    res.status(200).json({ success: true, data: payments })
  } catch (error) {
    console.error("Error fetching payment history:", error)
    res.status(500).json({ success: false, message: "Server error fetching payment history" })
  }
})

// Admin routes (protected and authorized)
// @route   GET /api/payments/admin
// @desc    Get all payments (for admin)
// @access  Private (Admin only)
router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "username email")
      .populate({
        path: "bookingId",
        populate: {
          path: "cafeId",
          select: "name",
        },
        select: "date slot cafeId",
      })
      .sort({ createdAt: -1 })
    res.json({ success: true, data: payments })
  } catch (error) {
    console.error("Error fetching all payments (admin):", error)
    res.status(500).json({ success: false, message: "Server error fetching payments" })
  }
})

module.exports = router
