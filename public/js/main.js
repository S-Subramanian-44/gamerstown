// Main JavaScript functionality for GAMERSTOWN

// Initialize window.GAMERSTOWN object at the very top
window.GAMERSTOWN = window.GAMERSTOWN || {}

// --- Utility functions (defined globally and attached to window.GAMERSTOWN) ---

window.GAMERSTOWN.validateEmail = (email) => {
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return emailRegex.test(String(email).toLowerCase())
}

window.GAMERSTOWN.validatePassword = (password) => password.length >= 6

window.GAMERSTOWN.isValidPhone = (phone) => {
  // Simple check for 10 digits
  return /^\d{10}$/.test(phone)
}

window.GAMERSTOWN.isValidDate = (dateString) => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}

// Form validation helpers (simplified for this context, using showMessage)
window.GAMERSTOWN.showFieldError = (fieldId, message) => {
  const field = document.getElementById(fieldId)
  if (field) {
    field.classList.add("border-red-500")

    // Remove existing error message
    const existingError = field.parentNode.querySelector(".field-error")
    if (existingError) {
      existingError.remove()
    }

    // Add new error message
    const errorDiv = document.createElement("div")
    errorDiv.className = "field-error text-red-500 text-sm mt-1"
    errorDiv.textContent = message
    field.parentNode.appendChild(errorDiv)
  }
}

window.GAMERSTOWN.clearFieldError = (fieldId) => {
  const field = document.getElementById(fieldId)
  if (field) {
    field.classList.remove("border-red-500")
    const errorDiv = field.parentNode.querySelector(".field-error")
    if (errorDiv) {
      errorDiv.remove()
    }
  }
}

window.GAMERSTOWN.clearAllFieldErrors = () => {
  document.querySelectorAll(".field-error").forEach((error) => error.remove())
  document.querySelectorAll(".border-red-500").forEach((field) => {
    field.classList.remove("border-red-500")
  })
}

// Notification functions
window.GAMERSTOWN.showMessage = (message, type = "info", duration = 3000) => {
  const container = document.getElementById("message-container")
  if (!container) {
    // Fallback if message container is not present on the page
    alert(message)
    return
  }

  const messageElement = document.createElement("div")
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500", // Alias for error
  }

  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
    warning: "fas fa-exclamation-triangle",
    danger: "fas fa-exclamation-triangle",
  }

  messageElement.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 max-w-sm`
  messageElement.innerHTML = `
    <i class="${icons[type]}"></i>
    <span class="flex-1">${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-2 hover:bg-white/20 rounded p-1">
        <i class="fas fa-times text-sm"></i>
    </button>
`

  container.appendChild(messageElement)

  // Animate in
  messageElement.style.transform = "translateX(100%)"
  messageElement.style.opacity = "0"

  setTimeout(() => {
    messageElement.style.transform = "translateX(0)"
    messageElement.style.opacity = "1"
    messageElement.style.transition = "all 0.3s ease"
  }, 100)

  // Auto remove after duration
  setTimeout(() => {
    if (container.contains(messageElement)) {
      messageElement.style.transform = "translateX(100%)"
      messageElement.style.opacity = "0"
      setTimeout(() => {
        if (container.contains(messageElement)) {
          container.removeChild(messageElement)
        }
      }, 300)
    }
  }, duration)
}

window.GAMERSTOWN.showSuccess = (message) => window.GAMERSTOWN.showMessage(message, "success")
window.GAMERSTOWN.showError = (message) => window.GAMERSTOWN.showMessage(message, "error")
window.GAMERSTOWN.showInfo = (message) => window.GAMERSTOWN.showMessage(message, "info")
window.GAMERSTOWN.showWarning = (message) => window.GAMERSTOWN.showMessage(message, "warning")

// Formatting functions
window.GAMERSTOWN.formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

window.GAMERSTOWN.formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString("en-US", options)
}

window.GAMERSTOWN.formatTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

window.GAMERSTOWN.formatDateTime = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  return new Date(dateString).toLocaleDateString("en-US", options)
}

// Booking related functions (simplified as status is now handled by backend)
window.GAMERSTOWN.updateBookingStatus = (booking) => {
  // This function might be less critical if backend handles status,
  // but can be used for client-side display logic based on current time.
  const bookingDate = new Date(booking.date)
  const [startHour, startMinute] = booking.slot.split("-")[0].split(":").map(Number)
  const bookingStart = new Date(bookingDate)
  bookingStart.setHours(startHour, startMinute, 0, 0)

  const now = new Date()

  if (booking.status === "cancelled") {
    return "Cancelled"
  } else if (booking.status === "completed") {
    return "Completed"
  } else if (now >= bookingStart) {
    // If current time is past booking start, consider it completed for display purposes
    return "Completed"
  } else {
    return "Upcoming"
  }
}

// General utilities
window.GAMERSTOWN.debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

window.GAMERSTOWN.showLoading = (element, text = "Loading...") => {
  if (element) {
    element.innerHTML = `
        <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span class="text-gray-600">${text}</span>
        </div>
    `
  }
}

window.GAMERSTOWN.getUrlParameter = (name) => {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]")
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
  var results = regex.exec(location.search)
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
}

window.GAMERSTOWN.setUrlParameter = (key, value) => {
  const url = new URL(window.location)
  if (value) {
    url.searchParams.set(key, value)
  } else {
    url.searchParams.delete(key)
  }
  window.history.replaceState({}, "", url)
}

window.GAMERSTOWN.saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

window.GAMERSTOWN.getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return defaultValue
  }
}

window.GAMERSTOWN.saveToSessionStorage = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to sessionStorage:", error)
  }
}

window.GAMERSTOWN.getFromSessionStorage = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Error reading from sessionStorage:", error)
    return defaultValue
  }
}

window.GAMERSTOWN.serializeForm = (form) => {
  const formData = new FormData(form)
  const data = {}
  for (const [key, value] of formData.entries()) {
    data[key] = value
  }
  return data
}

window.GAMERSTOWN.populateForm = (form, data) => {
  Object.keys(data).forEach((key) => {
    const field = form.querySelector(`[name="${key}"]`)
    if (field) {
      if (field.type === "checkbox") {
        field.checked = data[key]
      } else if (field.type === "radio") {
        const radioButton = form.querySelector(`[name="${key}"][value="${data[key]}"]`)
        if (radioButton) radioButton.checked = true
      } else {
        field.value = data[key]
      }
    }
  })
}

// Utility function for handling API errors
window.GAMERSTOWN.handleApiError = (error, defaultMessage = "An unexpected error occurred.") => {
  let errorMessage = defaultMessage
  if (error.responseJSON && error.responseJSON.message) {
    errorMessage = error.responseJSON.message
  } else if (error.message) {
    errorMessage = error.message
  } else if (typeof error === "string") {
    errorMessage = error
  }
  window.GAMERSTOWN.showMessage(errorMessage, "danger")
  console.error("API Error Details:", error)
}

// Homepage specific functions
window.GAMERSTOWN.loadCitiesForHomepage = async () => {
  try {
    const citySelect = document.getElementById("citySelect")
    if (citySelect) {
      const cities = await window.GAMERSTOWN.apiClient.getDistinctCities()

      citySelect.innerHTML = '<option value="">Select City</option>'
      cities.forEach((city) => {
        const option = document.createElement("option")
        option.value = city.toLowerCase()
        option.textContent = city
        citySelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error loading cities for homepage:", error)
    window.GAMERSTOWN.showError("Failed to load cities.")
  }
}

window.GAMERSTOWN.loadPopularCities = async () => {
  try {
    const citiesGrid = document.getElementById("citiesGrid")
    if (citiesGrid) {
      const cities = await window.GAMERSTOWN.apiClient.getDistinctCities()
      citiesGrid.innerHTML = ""
      // Display up to 6 popular cities
      cities.slice(0, 6).forEach((city) => {
        const cityCard = window.GAMERSTOWN.createCityCard(city)
        citiesGrid.appendChild(cityCard)
      })
    }
  } catch (error) {
    console.error("Error loading popular cities:", error)
  }
}

window.GAMERSTOWN.createCityCard = (city) => {
  const card = document.createElement("div")
  card.className =
    "group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer"
  card.onclick = () => window.GAMERSTOWN.searchByCity(city)

  // City images mapping (can be expanded or fetched from backend if available)
  const cityImages = {
    Bangalore: "/images/cafe1-1.png",
    Mumbai: "/images/cafe2-1.png",
    Delhi: "/images/cafe3-1.png",
    Hyderabad: "/images/cafe4-1.png",
    Chennai: "/images/cafe5-1.png",
    Coimbatore: "/images/cafe6-1.png",
  }

  const imageUrl = cityImages[city] || "/placeholder.svg?height=48&width=48&text=City+Image"

  card.innerHTML = `
    <img src="${imageUrl}" 
         alt="${city}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
    <div class="p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">${city}</h3>
        <p class="text-gray-600">Discover gaming cafés in ${city}</p>
        <div class="mt-4 flex items-center text-primary">
            <span class="text-sm font-medium">Explore now</span>
            <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
        </div>
    </div>
`

  return card
}

window.GAMERSTOWN.searchCafes = () => {
  const city = document.getElementById("citySelect")?.value
  const search = document.getElementById("searchInput")?.value

  const params = new URLSearchParams()
  if (city) params.append("city", city)
  if (search) params.append("search", search)

  window.location.href = `explore.html?${params.toString()}`
}

window.GAMERSTOWN.searchByCity = (city) => {
  window.location.href = `explore.html?city=${encodeURIComponent(city.toLowerCase())}`
}

window.GAMERSTOWN.setupSearchFunctionality = () => {
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        window.GAMERSTOWN.searchCafes()
      }
    })
  }
}

// Intersection Observer for animations (if needed for specific elements)
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate-fade-in-up")
    }
  })
}, observerOptions)

document.addEventListener("DOMContentLoaded", () => {
  const animateElements = document.querySelectorAll(".animate-on-scroll")
  animateElements.forEach((el) => observer.observe(el))
})
