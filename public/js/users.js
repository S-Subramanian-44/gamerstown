const express = require("express")
const User = require("../models/User")
const { auth } = require("../middleware/auth")
const router = express.Router()

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone } = req.body

    const user = await User.findById(req.user._id)
    if (name) user.name = name
    if (phone) user.phone = phone

    await user.save()

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        walletBalance: user.walletBalance,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
