const mongoose = require("mongoose")

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feedbackType: {
      type: String,
      enum: ["suggestion", "bug_report", "feature_request", "complaint", "compliment", "other"],
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Please add a subject"],
      trim: true,
      maxlength: [200, "Subject cannot be more than 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Please add a message"],
      trim: true,
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
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

module.exports = mongoose.model("Feedback", FeedbackSchema)
