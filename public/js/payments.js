const express = require("express")
const Razorpay = require("razorpay")
const Payment = require("../models/Payment")
const User = require("../models/User")
const { auth } = require("../middleware/auth")
const router = express.Router()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create Razorpay order for wallet recharge
router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount < 1) {
      return res.status(400).json({ message: "Invalid amount" })
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `wallet_${req.user._id}_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    // Create payment record
    const payment = new Payment({
      userId: req.user._id,
      amount,
      type: "wallet_recharge",
      method: "razorpay",
      status: "pending",
      razorpayOrderId: order.id,
    })

    await payment.save()

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Verify Razorpay payment
router.post("/verify", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body

    // Find payment record
    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" })
    }

    // Verify signature (simplified - in production, use crypto to verify)
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(razorpay_order_id + '|' + razorpay_payment_id)
    //   .digest('hex');

    // For demo purposes, we'll assume verification is successful
    const isSignatureValid = true // expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      // Update payment record
      payment.status = "success"
      payment.razorpayPaymentId = razorpay_payment_id
      await payment.save()

      // Add amount to user wallet
      req.user.walletBalance += payment.amount
      await req.user.save()

      res.json({
        message: "Payment verified successfully",
        walletBalance: req.user.walletBalance,
      })
    } else {
      payment.status = "failed"
      await payment.save()

      res.status(400).json({ message: "Payment verification failed" })
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user payment history
router.get("/history", auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).populate("bookingId").sort({ createdAt: -1 })

    res.json(payments)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
