// Reviews functionality for GAMERSTOWN

class ReviewsManager {
  constructor() {
    this.reviews = this.loadMockReviews()
  }

  loadMockReviews() {
    return {
      1: [
        {
          _id: "1",
          userId: { username: "GamerPro123" },
          rating: 5,
          comment:
            "Amazing gaming setup! The PCs are top-notch and the staff is very helpful. Had an incredible gaming session with friends.",
          createdAt: "2024-12-15T10:30:00Z",
        },
        {
          _id: "2",
          userId: { username: "TechGuru" },
          rating: 4,
          comment:
            "Good facilities and friendly staff. The gaming chairs are comfortable and the internet speed is excellent. Will definitely visit again!",
          createdAt: "2024-12-10T15:20:00Z",
        },
        {
          _id: "3",
          userId: { username: "EsportsPlayer" },
          rating: 5,
          comment: "Perfect for competitive gaming. Low latency, high refresh rate monitors, and great atmosphere.",
          createdAt: "2024-12-08T18:45:00Z",
        },
      ],
      2: [
        {
          _id: "4",
          userId: { username: "CasualGamer" },
          rating: 4,
          comment: "Great place for casual gaming. The food court is a nice touch. Prices are reasonable.",
          createdAt: "2024-12-12T14:20:00Z",
        },
        {
          _id: "5",
          userId: { username: "StreamerLife" },
          rating: 5,
          comment: "Excellent for streaming! Good lighting and professional setup. Staff helped with technical issues.",
          createdAt: "2024-12-05T20:15:00Z",
        },
      ],
      3: [
        {
          _id: "6",
          userId: { username: "RPGFan" },
          rating: 5,
          comment: "Luxury gaming at its finest! The VR setup is incredible and the premium seating is so comfortable.",
          createdAt: "2024-12-14T16:30:00Z",
        },
        {
          _id: "7",
          userId: { username: "CompetitivePlayer" },
          rating: 4,
          comment: "High-end equipment and great for tournaments. A bit pricey but worth it for the quality.",
          createdAt: "2024-12-09T12:10:00Z",
        },
      ],
      4: [
        {
          _id: "8",
          userId: { username: "FamilyGamer" },
          rating: 4,
          comment: "Family-friendly environment. Kids loved the variety of games. Staff is patient with beginners.",
          createdAt: "2024-12-11T11:45:00Z",
        },
      ],
      5: [
        {
          _id: "9",
          userId: { username: "RetroGamer" },
          rating: 5,
          comment: "Nostalgia overload! Love the classic arcade games. Takes me back to my childhood.",
          createdAt: "2024-12-13T19:20:00Z",
        },
        {
          _id: "10",
          userId: { username: "ArcadeFan" },
          rating: 4,
          comment: "Great collection of retro games. The atmosphere is authentic and fun.",
          createdAt: "2024-12-07T17:30:00Z",
        },
      ],
      6: [
        {
          _id: "11",
          userId: { username: "SportsGamer" },
          rating: 5,
          comment: "Best place for FIFA and NBA 2K! The controllers are in perfect condition and the screens are huge.",
          createdAt: "2024-12-16T21:15:00Z",
        },
      ],
    }
  }

  getCafeReviews(cafeId) {
    return this.reviews[cafeId] || []
  }

  addReview(cafeId, review) {
    if (!this.reviews[cafeId]) {
      this.reviews[cafeId] = []
    }

    const newReview = {
      _id: Date.now().toString(),
      userId: { username: "CurrentUser" },
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString(),
    }

    this.reviews[cafeId].unshift(newReview)
    return newReview
  }

  renderReviews(cafeId, containerId) {
    const container = document.getElementById(containerId)
    if (!container) return

    const reviews = this.getCafeReviews(cafeId)

    if (reviews.length === 0) {
      container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-star text-4xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">No reviews yet</h3>
                    <p class="text-gray-500">Be the first to review this gaming café!</p>
                </div>
            `
      return
    }

    container.innerHTML = reviews.map((review) => this.createReviewCard(review)).join("")
  }

  createReviewCard(review) {
    const date = new Date(review.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    const stars = Array.from({ length: 5 }, (_, i) =>
      i < review.rating ? '<i class="fas fa-star text-yellow-400"></i>' : '<i class="far fa-star text-gray-300"></i>',
    ).join("")

    return `
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-900">${review.userId.username}</h4>
                        <div class="flex items-center mt-1">
                            ${stars}
                            <span class="ml-2 text-sm text-gray-600">${review.rating}/5</span>
                        </div>
                    </div>
                    <span class="text-sm text-gray-500">${date}</span>
                </div>
                <p class="text-gray-700">${review.comment}</p>
            </div>
        `
  }

  calculateAverageRating(cafeId) {
    const reviews = this.getCafeReviews(cafeId)
    if (reviews.length === 0) return 0

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }
}

// Create global instance
window.reviewsManager = new ReviewsManager()

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = ReviewsManager
}
