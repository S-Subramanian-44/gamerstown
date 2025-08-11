const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true, // Deprecated in Mongoose 6.x
      // useUnifiedTopology: true, // Deprecated in Mongoose 6.x
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1) // Exit process with failure
  }
}

module.exports = connectDB
