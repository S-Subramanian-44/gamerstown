const express = require("express")
const User = require("../models/User")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// This route is primarily for testing admin access or for future admin-specific functionalities
// @route   GET /api/admins/dashboard
// @desc    Get admin dashboard data (example)
// @access  Private (Admin only)
router.get("/dashboard", protect, authorize("admin"), async (req, res) => {
  try {
    // In a real application, you'd fetch aggregated data for the admin dashboard
    const totalUsers = await User.countDocuments({ userType: "user" })
    const totalAdmins = await User.countDocuments({ userType: "admin" })
    // You could also fetch recent bookings, cafe stats, etc.

    res.status(200).json({
      success: true,
      message: "Welcome to the Admin Dashboard!",
      data: {
        totalUsers,
        totalAdmins,
        // ... more admin specific data
      },
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    res.status(500).json({ success: false, message: "Server error fetching admin dashboard data" })
  }
})

module.exports = router
