require("dotenv").config()
const mongoose = require("mongoose")
const Cafe = require("../models/Cafe")
const User = require("../models/User")
const connectDB = require("../config/db")
const bcrypt = require("bcryptjs")

connectDB()

const cafes = [
  {
    name: "Pixel Palace",
    address: "123 Gaming Rd",
    city: "Bangalore",
    description: "A high-end gaming cafe with the latest PCs and consoles.",
    hourlyRate: 150,
    images: ["/images/cafe1-1.png", "/images/cafe1-2.png", "/images/cafe1-3.png", "/images/cafe1-4.png"],
    amenities: ["High-speed Wi-Fi", "Snacks & Drinks", "Private Booths", "VR Zone"],
    games: ["Valorant", "CS:GO", "Dota 2", "Apex Legends", "Fortnite"],
    openingTime: "09:00",
    closingTime: "23:00",
    averageRating: 4.5,
    totalReviews: 120,
  },
  {
    name: "Cyber Arena",
    address: "456 Tech Ave",
    city: "Mumbai",
    description: "Spacious cafe with a focus on esports and competitive gaming.",
    hourlyRate: 180,
    images: ["/images/cafe2-1.png", "/images/cafe2-2.png", "/images/cafe2-3.png", "/images/cafe2-4.png"],
    amenities: ["Esports Stage", "Pro Gaming Chairs", "Food Court", "Streaming Booths"],
    games: ["League of Legends", "Overwatch 2", "Rainbow Six Siege", "PUBG"],
    openingTime: "10:00",
    closingTime: "00:00",
    averageRating: 4.7,
    totalReviews: 95,
  },
  {
    name: "Game Nexus",
    address: "789 Play St",
    city: "Delhi",
    description: "Community-focused cafe, perfect for casual gaming and meetups.",
    hourlyRate: 120,
    images: ["/images/cafe3-1.png", "/images/cafe3-2.png", "/images/cafe3-3.png", "/images/cafe3-4.png"],
    amenities: ["Board Games", "Retro Consoles", "Coffee Bar", "Lounge Area"],
    games: ["Minecraft", "Among Us", "Rocket League", "Fall Guys"],
    openingTime: "08:00",
    closingTime: "22:00",
    averageRating: 4.2,
    totalReviews: 150,
  },
  {
    name: "Elite Gaming Hub",
    address: "101 Victory Lane",
    city: "Hyderabad",
    description: "Premium gaming experience with top-tier hardware and comfortable setups.",
    hourlyRate: 200,
    images: ["/images/cafe4-1.png", "/images/cafe4-2.png", "/images/cafe4-3.png", "/images/cafe4-4.png"],
    amenities: ["Ergonomic Chairs", "4K Monitors", "Noise-Cancelling Headsets", "VIP Rooms"],
    games: ["Cyberpunk 2077", "Red Dead Redemption 2", "God of War", "Elden Ring"],
    openingTime: "11:00",
    closingTime: "01:00",
    averageRating: 4.8,
    totalReviews: 80,
  },
  {
    name: "Arcade Alley",
    address: "222 Retro Blvd",
    city: "Chennai",
    description: "A nostalgic spot with classic arcade games and modern setups.",
    hourlyRate: 100,
    images: ["/images/cafe5-1.png", "/images/cafe5-2.png", "/images/cafe5-3.png", "/images/cafe5-4.png"],
    amenities: ["Arcade Machines", "Snack Bar", "Themed Decor", "Party Rooms"],
    games: ["Street Fighter", "Mortal Kombat", "Pac-Man", "Tekken"],
    openingTime: "09:00",
    closingTime: "23:00",
    averageRating: 4.0,
    totalReviews: 110,
  },
  {
    name: "Next Level Lounge",
    address: "333 Future St",
    city: "Coimbatore",
    description: "Modern and vibrant cafe, ideal for both casual and serious gamers.",
    hourlyRate: 160,
    images: ["/images/cafe6-1.png", "/images/cafe6-2.png", "/images/cafe6-3.png", "/images/cafe6-4.png"],
    amenities: ["Comfortable Seating", "Latest Gen Consoles", "Energy Drinks", "Tournaments"],
    games: ["FIFA 24", "NBA 2K", "Call of Duty", "Forza Horizon"],
    openingTime: "10:00",
    closingTime: "00:00",
    averageRating: 4.6,
    totalReviews: 70,
  },
]

const seedData = async () => {
  try {
    await Cafe.deleteMany()
    await User.deleteMany({ userType: { $ne: "admin" } }) // Keep existing admin if any, or delete all users

    await Cafe.insertMany(cafes)
    console.log("Cafes seeded successfully!")

    // Create a default admin user if not exists
    const adminUser = await User.findOne({ email: "admin@gamerstown.com" })
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("adminpassword", 10) // Hash the password
      await User.create({
        username: "AdminUser",
        email: "admin@gamerstown.com",
        password: hashedPassword,
        userType: "admin",
        dob: new Date("1990-01-01"), // Dummy DOB
        phone: "9876543210",
      })
      console.log("Default admin user created!")
    } else {
      console.log("Admin user already exists.")
    }

    process.exit()
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

seedData()
