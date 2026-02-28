**🚀 Nijatech – Full Stack Technology E-Commerce Platform**
**📌 Project Overview**

**Nijatech** is a full-stack MERN-based technology e-commerce platform built from scratch.
The platform allows users to explore and purchase laptops, computers, monitors, keyboards, and various tech accessories.

Authentication is required for placing orders, and the system includes a fully functional role-based admin dashboard for managing products, users, and orders.

This project was designed and developed entirely by me — including frontend architecture, backend API, database design, authentication system, and admin panel.

**🛠 Tech Stack**

**🎨 Frontend**
React
Tailwind CSS
React Router
Redux Toolkit
React Redux
Axios
Swiper
Recharts
Canvas Confetti
React Hot Toast
SweetAlert2
Lucide React

**⚙ Backend**
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
Bcrypt.js
Multer (Image Upload)
Nodemailer (Email System)
Crypto (Password Reset Tokens)
CORS
Dotenv

**🔐 Authentication & Authorization**
JWT-based authentication (stored in localStorage)
Password hashing with bcrypt
Role-based access control (admin / user)
Protected routes middleware
Admin-only routes
Secure password reset system with:
reset token
expiration time
email verification link

**Middleware Structure**
protect → verifies token & attaches user
isAdmin → allows admin-only access

**🛒 E-Commerce Features**
**👤 User Features**

Register / Login / Logout
Profile update (including avatar upload)
Browse products
Advanced filtering & search
Wishlist system
Add to cart
Checkout system
Order history
Cancel non-delivered orders

**🧾 Order System**
Each order linked to authenticated user
Order status tracking (processing, delivered)
Address & phone required
Admin can:
Update order status
View all orders
View total sales statistics

**📦 Order Model Highlights**
Linked to user (ObjectId reference)
Stores order items snapshot
Delivery & payment tracking
Timestamps enabled

**📊 Admin Dashboard**
Fully custom built admin panel including:
📈 Order statistics
💰 Total sales calculation (paid orders)
👥 User management
📦 Product CRUD operations
🧾 Order management
🔔 Notification system
⚙ Settings page
🆘 Help center

Dashboard includes data visualization using Recharts.

**🖼 Main Pages**
**Public Pages**
Home
Products
Product Details
Brands
About
Contact
FAQ
Warranty
Delivery & Payment

**Auth Pages**
Login / Register
Forgot Password
Reset Password

**User Pages**
Profile
Wishlist
Checkout
Order Success

**Admin Pages**
Dashboard
Users
Orders
Products
Settings
Help Center
Notifications

**🏗 Project Architecture**
**📁 Client Structure**

client/
└── src/
├── api/
├── assets/
├── components/
├── pages/
├── redux/
├── routes/
└── utils/

**📁 Server Structure**
server/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── uploads/
└── .env

**🔒 Security Highlights**
Hashed passwords
Protected API routes
Admin role enforcement
Order cancellation restrictions
JWT verification middleware
Reset password token expiration lo

**📈 Business Logic Highlights**
Order snapshot structure (price preserved even if product changes)
Paid-only sales aggregation
Delivery status tracking
Real-time admin statistics
Structured MVC backend architecture

**👨‍💻 Author**
Developed by **Nicat Allahverdiyev**

MERN Stack Developer
Passionate about building scalable, secure and user-focused web applications.