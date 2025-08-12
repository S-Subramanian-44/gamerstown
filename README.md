# 🎮 GAMERSTOWN – Gaming Café Booking Platform

GAMERSTOWN is a **full-stack web application** that allows users to discover, book, and pay for available gaming café time slots in their city.  
Admins (café owners) can register their venues, manage bookings, and block time slots.  
The platform ensures **real-time availability**, **wallet payments**, and **booking management**.

---

## 🚀 Features

### 🧑‍💻 User Features
- **Sign Up / Login** (JWT Authentication)
- **Browse Cafés** by city, amenities, and gaming platforms
- **Real-time Slot Availability** (per date and per café)
- **Wallet System** – Recharge and pay directly
- **Book Slots** for multiple players
- **Manage Bookings** (Upcoming, Completed, Cancelled)
- **View Recent Activity**
- **Leave Reviews** for cafés

### 🏢 Admin Features
- **Add / Update Café Details**
- **Set Opening & Closing Times**
- **Set Hourly Pricing**
- **Manage Bookings**
- **Block Time Slots**

---

## 🛠 Tech Stack

### **Frontend**
- HTML, CSS, JavaScript
- [Tailwind CSS](https://tailwindcss.com/) – UI styling
- Font Awesome Icons
- LocalStorage for temporary booking/wallet data

### **Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- REST API for cafes, bookings, reviews

---
## ⚙️ Installation & Setup

1. **Clone the Repository**
```bash
git clone https://github.com/YOUR_USERNAME/gamerstown.git
cd gamerstown
```

2. **Install Dependencies**
```bash
npm install
```

4. **Set Environment Variables**
   Create a .env file:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret

```
5. **Run the Server**
   Create a .env file:
```bash
npm start
```
Visit http://localhost:5000



--- 
# 🔮 Future Improvements

- Online payment gateway integration

- Push notifications for upcoming bookings

- Dynamic pricing based on demand

- Mobile app version

---
# 🌍 Deployment
The project is deployed on Render:
- 🔗 Live Demo: https://gamerstown.onrender.com/

---
## Let's Connect!

- 🌐 Portfolio: https://subramanian-s-160104.netlify.app/ 
- 📧 Email: subramanian160104@gmail.com

