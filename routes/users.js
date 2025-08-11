const express = require("express")
const User = require("../models/User")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private (User/Admin)
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password") // Exclude password
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ success: false, message: "Server error fetching profile" })
  }
})

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private (User/Admin)
router.put("/profile", protect, async (req, res) => {
  const { username, email, phone, dob } = req.body

  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Update fields if provided
    if (username) user.username = username
    if (email) user.email = email
    if (phone) user.phone = phone
    if (dob) user.dob = dob

    await user.save()

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
        dob: user.dob,
        walletBalance: user.walletBalance,
      },
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    // Handle unique email constraint error
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email or username already in use." })
    }
    res.status(500).json({ success: false, message: "Server error updating profile" })
  }
})

// Admin routes (protected and authorized)
// @route   GET /api/users/admin
// @desc    Get all users (for admin)
// @access  Private (Admin only)
router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password") // Exclude passwords
    res.json({ success: true, data: users })
  } catch (error) {
    console.error("Error fetching all users (admin):", error)
    res.status(500).json({ success: false, message: "Server error fetching users" })
  }
})

// @route   GET /api/users/:id
// @desc    Get single user by ID (for admin)
// @access  Private (Admin only)
router.get("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    res.json({ success: true, data: user })
  } catch (error) {
    console.error("Error fetching user by ID (admin):", error)
    res.status(500).json({ success: false, message: "Server error fetching user" })
  }
})

// @route   PUT /api/users/:id/wallet
// @desc    Update user's wallet balance (for admin)
// @access  Private (Admin only)
router.put("/:id/wallet", protect, authorize("admin"), async (req, res) => {
  const { amount } = req.body
  if (typeof amount !== "number") {
    return res.status(400).json({ success: false, message: "Please provide a valid amount" })
  }

  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    user.walletBalance = amount // Set exact amount, or use += for adding
    await user.save()
    res.json({ success: true, message: "Wallet balance updated", data: user.walletBalance })
  } catch (error) {
    console.error("Error updating user wallet (admin):", error)
    res.status(500).json({ success: false, message: "Server error updating wallet" })
  }
})

// @route   DELETE /api/users/:id
// @desc    Delete user by ID (for admin)
// @access  Private (Admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    res.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user (admin):", error)
    res.status(500).json({ success: false, message: "Server error deleting user" })
  }
})

module.exports = router
