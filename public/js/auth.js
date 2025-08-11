// auth.js
// Handles client-side authentication (login, logout, token management)

;(() => {
  const TOKEN_KEY = "token"
  const USER_KEY = "user"

  window.GAMERSTOWN = window.GAMERSTOWN || {}

  window.GAMERSTOWN.auth = {
    setAuth: (token, user) => {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      window.GAMERSTOWN.auth.updateUI()
    },

    getToken: () => {
      return localStorage.getItem(TOKEN_KEY)
    },

    getUserData: () => {
      const user = localStorage.getItem(USER_KEY)
      return user ? JSON.parse(user) : null
    },

    isAuthenticated: () => {
      return !!window.GAMERSTOWN.auth.getToken() && !!window.GAMERSTOWN.auth.getUserData()
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.GAMERSTOWN.showMessage("Logged out successfully.", "info")
      window.GAMERSTOWN.auth.updateUI()
      setTimeout(() => {
        window.location.href = "/index.html" // Redirect to login page after logout
      }, 1000)
    },

    updateUI: () => {
      const authButtons = document.getElementById("authButtons")
      const userMenu = document.getElementById("userMenu")
      const userNameSpan = document.getElementById("userName")
      const navUserNameSpan = document.getElementById("nav-user-name") // For user-dashboard.html

      if (window.GAMERSTOWN.auth.isAuthenticated()) {
        const user = window.GAMERSTOWN.auth.getUserData()
        if (authButtons) authButtons.style.display = "none"
        if (userMenu) userMenu.style.display = "flex"
        if (userNameSpan) userNameSpan.textContent = `Welcome, ${user.username || user.email.split("@")[0]}`
        if (navUserNameSpan) navUserNameSpan.textContent = user.username || user.email.split("@")[0]
      } else {
        if (authButtons) authButtons.style.display = "flex"
        if (userMenu) userMenu.style.display = "none"
      }
    },

    checkAuthAndRedirect: (redirectPath = "/login.html") => {
      if (!window.GAMERSTOWN.auth.isAuthenticated()) {
        window.GAMERSTOWN.showMessage("You need to be logged in to access this page.", "warning")
        setTimeout(() => {
          window.location.href = redirectPath
        }, 1500)
      }
    },
  }

  // Initial UI update on page load
  document.addEventListener("DOMContentLoaded", () => {
    window.GAMERSTOWN.auth.updateUI()
  })
})()
