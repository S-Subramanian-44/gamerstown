const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // One review per booking
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please add a rating between 1 and 5"],
    },
    comment: {
      type: String,
      maxlength: [500, "Comment can not be more than 500 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function (cafeId) {
  const obj = await this.aggregate([
    {
      $match: { cafeId: cafeId },
    },
    {
      $group: {
        _id: "$cafeId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ])

  try {
    await this.model("Cafe").findByIdAndUpdate(cafeId, {
      averageRating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
      totalReviews: obj[0] ? obj[0].totalReviews : 0,
    })
  } catch (err) {
    console.error(err)
  }
}

// Call getAverageRating after save
ReviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.cafeId)
})

// Call getAverageRating after remove
ReviewSchema.post("remove", async function () {
  await this.constructor.getAverageRating(this.cafeId)
})

module.exports = mongoose.model("Review", ReviewSchema)
