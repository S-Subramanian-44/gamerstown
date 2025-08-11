const express = require("express")
const Feedback = require("../models/Feedback")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private (User only)
router.post("/", protect, authorize("user"), async (req, res) => {
  const { feedbackType, subject, message, priority } = req.body

  if (!feedbackType || !subject || !message) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" })
  }

  try {
    const feedback = await Feedback.create({
      userId: req.user.id,
      feedbackType,
      subject,
      message,
      priority: priority || "medium",
    })

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully!",
      data: feedback,
    })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    res.status(500).json({ success: false, message: "Server error submitting feedback" })
  }
})

// @route   GET /api/feedback/user
// @desc    Get user's feedback history
// @access  Private (User only)
router.get("/user", protect, authorize("user"), async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: feedback })
  } catch (error) {
    console.error("Error fetching user feedback:", error)
    res.status(500).json({ success: false, message: "Server error fetching feedback" })
  }
})

// Admin routes
// @route   GET /api/feedback/admin
// @desc    Get all feedback (for admin)
// @access  Private (Admin only)
router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("userId", "username email")
      .populate("respondedBy", "username")
      .sort({ createdAt: -1 })
    res.json({ success: true, data: feedback })
  } catch (error) {
    console.error("Error fetching all feedback (admin):", error)
    res.status(500).json({ success: false, message: "Server error fetching feedback" })
  }
})

// @route   PUT /api/feedback/:id/respond
// @desc    Respond to feedback (for admin)
// @access  Private (Admin only)
router.put("/:id/respond", protect, authorize("admin"), async (req, res) => {
  const { adminResponse, status } = req.body

  try {
    const feedback = await Feedback.findById(req.params.id)

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" })
    }

    feedback.adminResponse = adminResponse
    feedback.status = status || "resolved"
    feedback.respondedBy = req.user.id
    feedback.respondedAt = new Date()

    await feedback.save()

    res.json({ success: true, message: "Response added successfully", data: feedback })
  } catch (error) {
    console.error("Error responding to feedback:", error)
    res.status(500).json({ success: false, message: "Server error responding to feedback" })
  }
})

module.exports = router
