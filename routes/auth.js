const express = require("express")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const router = express.Router()

// Helper function to generate JWT token
const getSignedJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1h",
  })
}

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  const { username, email, password, dob, userType } = req.body

  // Basic validation
  if (!username || !email || !password || !dob) {
    return res.status(400).json({ success: false, message: "Please enter all fields" })
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ success: false, message: "User with this email already exists" })
  }

  try {
    const user = await User.create({
      username,
      email,
      password,
      dob,
      userType: userType || "user", // Default to 'user' if not provided
    })

    const token = getSignedJwtToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        walletBalance: user.walletBalance,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ success: false, message: "Server error during registration" })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide an email and password" })
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" })
    }

    const token = getSignedJwtToken(user._id)

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        walletBalance: user.walletBalance,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ success: false, message: "Server error during login" })
  }
})

module.exports = router
