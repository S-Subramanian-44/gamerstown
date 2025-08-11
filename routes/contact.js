const express = require("express")
const Contact = require("../models/Contact")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post("/", async (req, res) => {
  const { firstName, lastName, email, phone, subject, message } = req.body

  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" })
  }

  try {
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
    })

    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully! We will get back to you soon.",
      data: contact,
    })
  } catch (error) {
    console.error("Error submitting contact form:", error)
    res.status(500).json({ success: false, message: "Server error submitting contact form" })
  }
})

// Admin routes
// @route   GET /api/contact/admin
// @desc    Get all contact submissions (for admin)
// @access  Private (Admin only)
router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate("respondedBy", "username")
      .sort({ createdAt: -1 })
    res.json({ success: true, data: contacts })
  } catch (error) {
    console.error("Error fetching all contacts (admin):", error)
    res.status(500).json({ success: false, message: "Server error fetching contacts" })
  }
})

// @route   PUT /api/contact/:id/respond
// @desc    Respond to contact submission (for admin)
// @access  Private (Admin only)
router.put("/:id/respond", protect, authorize("admin"), async (req, res) => {
  const { adminResponse, status } = req.body

  try {
    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact submission not found" })
    }

    contact.adminResponse = adminResponse
    contact.status = status || "resolved"
    contact.respondedBy = req.user.id
    contact.respondedAt = new Date()

    await contact.save()

    res.json({ success: true, message: "Response added successfully", data: contact })
  } catch (error) {
    console.error("Error responding to contact:", error)
    res.status(500).json({ success: false, message: "Server error responding to contact" })
  }
})

module.exports = router
