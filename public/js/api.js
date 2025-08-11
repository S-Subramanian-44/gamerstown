// api.js
// Handles all API calls to the backend

;(() => {
  class APIClient {
    constructor() {
      this.baseURL = "/api" // Adjust if your API is on a different origin/port
    }

    async _request(endpoint, method = "GET", data = null, authRequired = false) {
      const url = `${this.baseURL}${endpoint}`
      const headers = {
        "Content-Type": "application/json",
      }

      if (authRequired) {
        const token = window.GAMERSTOWN.auth.getToken()
        if (!token) {
          // Handle case where token is missing for an authenticated request
          window.GAMERSTOWN.showMessage("Authentication required. Please log in.", "danger")
          window.GAMERSTOWN.auth.logout() // Force logout if token is missing
          throw new Error("Authentication token not found.")
        }
        headers["Authorization"] = `Bearer ${token}`
      }

      const config = {
        method,
        headers,
      }

      if (data) {
        config.body = JSON.stringify(data)
      }

      try {
        const response = await fetch(url, config)
        const responseData = await response.json()

        if (!response.ok) {
          // If response is not OK (e.g., 401, 404, 500)
          if (response.status === 401 && authRequired) {
            window.GAMERSTOWN.showMessage("Session expired or invalid. Please log in again.", "danger")
            window.GAMERSTOWN.auth.logout() // Force logout on 401
          }
          // Throw an error with the message from the backend
          const error = new Error(responseData.message || "Something went wrong")
          error.statusCode = response.status
          error.responseJSON = responseData // Attach full response for more details
          throw error
        }

        return responseData
      } catch (error) {
        console.error("API request failed:", error)
        // Re-throw to be caught by the calling function
        throw error
      }
    }

    // Auth Endpoints
    register(userData) {
      return this._request("/auth/register", "POST", userData)
    }

    login(credentials) {
      return this._request("/auth/login", "POST", credentials)
    }

    // User Endpoints
    getUserProfile() {
      return this._request("/users/profile", "GET", null, true)
    }

    updateUserProfile(userData) {
      return this._request("/users/profile", "PUT", userData, true)
    }

    // Cafe Endpoints
    getAllCafes(filters = {}) {
      const params = new URLSearchParams(filters).toString()
      return this._request(`/cafes${params ? `?${params}` : ""}`)
    }

    getCafeById(id) {
      return this._request(`/cafes/${id}`)
    }

    getDistinctCities() {
      return this._request("/cafes/cities/distinct")
    }

    // Booking Endpoints
    getCafeAvailability(cafeId, date) {
      return this._request(`/bookings/cafe/${cafeId}/availability?date=${date}`)
    }

    createBooking(bookingData) {
      return this._request("/bookings", "POST", bookingData, true)
    }

    getUserBookings() {
      return this._request("/bookings/user", "GET", null, true)
    }

    cancelBooking(bookingId, reason = "") {
      return this._request(`/bookings/${bookingId}/cancel`, "PUT", { reason }, true)
    }

    // Payment Endpoints
    rechargeWallet(amount) {
      return this._request("/payments/recharge", "POST", { amount }, true)
    }

    getPaymentHistory() {
      return this._request("/payments/history", "GET", null, true)
    }

    // Review Endpoints
    submitReview(reviewData) {
      return this._request("/reviews", "POST", reviewData, true)
    }

    getCafeReviews(cafeId) {
      return this._request(`/reviews/cafe/${cafeId}`)
    }
  }

  // Attach an instance of APIClient to the global GAMERSTOWN object
  window.GAMERSTOWN = window.GAMERSTOWN || {}
  window.GAMERSTOWN.apiClient = new APIClient()
})()
