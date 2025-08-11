const mongoose = require("mongoose")

const ContactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please add a last name"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please use a valid email",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number cannot be longer than 20 characters"],
    },
    subject: {
      type: String,
      enum: ["general_inquiry", "technical_support", "partnership", "cafe_listing", "billing", "feedback", "other"],
      required: true,
    },
    message: {
      type: String,
      required: [true, "Please add a message"],
      trim: true,
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new",
    },
    adminResponse: {
      type: String,
      trim: true,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    respondedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Contact", ContactSchema)
