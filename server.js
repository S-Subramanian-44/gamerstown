require("dotenv").config()
const express = require("express")
const path = require("path")
const connectDB = require("./config/db")
const cookieParser = require("cookie-parser") // If you decide to use cookies for auth

// Route files
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const cafeRoutes = require("./routes/cafes")
const bookingRoutes = require("./routes/bookings")
const paymentRoutes = require("./routes/payments")
const reviewRoutes = require("./routes/reviews")
const adminRoutes = require("./routes/admins") // For admin-specific routes
const feedbackRoutes = require("./routes/feedback")
const contactRoutes = require("./routes/contact")

// Connect to database
connectDB()

const app = express()

// Body parser
app.use(express.json())

// Cookie parser (if using cookies for auth)
app.use(cookieParser())

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")))

// Mount routers
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/cafes", cafeRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/admins", adminRoutes) // Mount admin routes
app.use("/api/feedback", feedbackRoutes)
app.use("/api/contact", contactRoutes)

// Catch-all for serving HTML files (SPA-like routing for client-side)
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"))
})

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"))
})

app.get("/explore", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "explore.html"))
})

app.get("/venue/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "venue.html"))
})

app.get("/user-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user-dashboard.html"))
})

app.get("/help-center", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "help-center.html"))
})

app.get("/contact-us", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact-us.html"))
})

app.get("/terms-of-service", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "terms-of-service.html"))
})

// Default route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
})
