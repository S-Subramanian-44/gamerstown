const fs = require("fs")
const path = require("path")

console.log("🎮 GAMERSTOWN Setup Script")
console.log("==========================\n")

// Check if .env file exists
const envPath = path.join(__dirname, ".env")
if (!fs.existsSync(envPath)) {
  console.log("❌ .env file not found!")
  console.log("📝 Creating .env file with MongoDB Atlas configuration...")

  const envContent = `PORT=3000
MONGODB_URI=mongodb+srv://subramanian160104:mani2133044@fswd.ijuhyep.mongodb.net/?retryWrites=true&w=majority&appName=fswdredirect
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
# RAZORPAY_KEY_ID=rzp_test_your_key_id
# RAZORPAY_KEY_SECRET=your_razorpay_secret_key
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password`

  fs.writeFileSync(envPath, envContent)
  console.log("✅ .env file created successfully!")
  console.log("⚠️  IMPORTANT: Update JWT_SECRET in .env file for production\n")
} else {
  console.log("✅ .env file found\n")
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, "node_modules")
if (!fs.existsSync(nodeModulesPath)) {
  console.log("❌ Dependencies not installed")
  console.log("📦 Please run: npm install\n")
} else {
  console.log("✅ Dependencies installed\n")
}

console.log("🚀 Setup Instructions:")
console.log("1. Update JWT_SECRET in .env file with a strong, unique key.")
console.log("2. Run: npm run dev (to start development server)")
console.log("3. Run: node scripts/seed-cafes.js (to add sample cafe data to your database)")
console.log("4. Visit: http://localhost:3000")
console.log("5. Register new users through the web interface\n")

console.log("📊 Database:")
console.log("- Using MongoDB Atlas cloud database")
console.log("- All schemas will be created automatically")
console.log("- Run 'node scripts/seed-cafes.js' to add sample cafe data!\n")

console.log("🎯 Ready to start! 🎮")
