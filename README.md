# 🛒 MERN E-Commerce App with Admin Panel

A full-stack E-commerce Admin Panel featuring an AR-powered Virtual Jewelry Try-On system. Built using a FastAPI backend, React/MERN stack, and Computer Vision for real-time jewelry simulation.

---

## 🚀 Features

- **Tech Stack**: MERN (MongoDB, Express, React, Node.js), TailwindCSS  
- 🔐 Authentication & Authorization (Admin/User roles)  
- 🛍️ Product Management (CRUD)  
- 🧺 Shopping Cart and Checkout Flow  
- 💳 Stripe Payment Integration  
- ☁️ Image Uploads with Cloudinary  
- 🧑‍💻 Admin Dashboard for Order & Product Management  
- 📦 Order History and User Profiles  
- ⚙️ Environment configuration using `.env`  
- 📡 REST API for all operations  
- 🌐 Fully responsive UI  

---

## 📁 Folder Structure

```
ecommerce-app/
├── backend/
├── frontend/
└── admin/
ai-model
```

---

## ⚙️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/mern-ecommerce-app.git
cd mern-ecommerce-app
```

---

### 2️⃣ Configure Environment Variables

#### 📦 `backend/.env.sample`

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

> Copy this into a file named `.env` in the `backend/` folder.

---

#### 🌐 `frontend/.env.sample` and `admin/.env.sample`

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

> Copy this into `.env` files in both `frontend/` and `admin/` folders.

---

### 3️⃣ Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Admin (if separate)
cd ../admin
npm install
```

---

### 4️⃣ Run the Application

```bash
# Backend
cd backend
npm run server

# Frontend
cd ../frontend
npm run dev

# Admin (if separate)
cd ../admin
npm run dev
```

---

### 5️⃣ Open in Browser

```text
🖥️ Frontend: http://localhost:5173  
🛠️ Admin Panel: http://localhost:5174 (if separate)  
📡 Backend API: http://localhost:4000
```

---

## 📝 Notes

```text
- Ensure MongoDB is running (locally or via MongoDB Atlas)
- Stripe keys and Cloudinary credentials are required
- Don't forget to set strong values for JWT_SECRET and Admin credentials
- Always use .env files locally and NEVER commit them
```

---

## 💳 Stripe Test Info

```text
Use Stripe test card for development:
Card Number: 4242 4242 4242 4242  
Expiry: Any future date  
CVC: Any 3 digits  
```

---

## 📌 Final Note

This project is designed for learning and practical implementation of the MERN stack with real-world features like admin dashboards and payments. It is ready for local deployment and can be extended further with additional features like reviews, product filters, analytics, and more. Remember to always secure your environment variables and sensitive credentials.

Happy Coding! 💻🚀
