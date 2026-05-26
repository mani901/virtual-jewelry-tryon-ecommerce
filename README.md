# Zewar House : AI-Powered Jewellery E-Commerce Platform

> A full-stack MERN e-commerce platform for a Pakistani women's jewellery brand, featuring an **AI Virtual Try-On system** that detects face shape and overlays jewellery in real time using MediaPipe, OpenCV, and a trained RandomForest classifier.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [AI Model — Virtual Try-On System](#ai-model--virtual-try-on-system)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Stripe Test Credentials](#stripe-test-credentials)
- [Security Notes](#security-notes)

---

## Overview

**Zewar House** is a modern e-commerce platform built specifically for women's jewellery — including Necklaces, Earrings, Rings, Bracelets, and Anklets — with product cataloguing by material (Gold, Silver, Diamond, Pearl, Gemstone).

What sets this platform apart is its **AI-powered Virtual Try-On** feature: customers upload or capture a photo, the system classifies their face shape (oval, round, square, heart, diamond, or oblong), and then overlays the selected jewellery item directly onto the photo using facial landmark detection. Personalised style recommendations are provided based on the detected face shape.

The platform is split into three independently runnable apps sharing a single MongoDB database, plus a FastAPI microservice for the AI model.

---

## Live Demo

| App | URL |
|---|---|
| Customer Storefront | `http://localhost:5173` |
| Admin Dashboard | `http://localhost:5174` |
| Backend REST API | `http://localhost:4000` |
| AI Model API (FastAPI) | `http://localhost:8000` |

---

## Features

### Customer Storefront
- Browse jewellery by category and material
- Product detail pages with high-quality images
- **AI Virtual Try-On** — upload or capture a photo to see jewellery on your face
- Face shape detection with personalised jewellery recommendations
- Shopping cart with persistent state
- Stripe-powered checkout
- Order history and user profiles
- Fully responsive UI (mobile-first)

### Admin Dashboard
- Secure admin login (JWT-based)
- Full product CRUD — add, edit, delete jewellery listings
- Image uploads via Cloudinary
- Order management and status updates
- User management

### AI Virtual Try-On
- Real-time face detection using MediaPipe FaceMesh (468 landmarks)
- 6-class face shape classification (RandomForest, scikit-learn)
- Accurate jewellery overlay with alpha blending and landmark-based positioning
- Supports: Earrings, Necklaces, Rings, Nose Rings, Headpieces
- Camera capture or file upload with drag-and-drop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB |
| Authentication | JWT |
| Payments | Stripe |
| Image Storage | Cloudinary |
| AI Microservice | Python, FastAPI, Uvicorn |
| Face Detection | MediaPipe FaceMesh |
| Image Processing | OpenCV, Pillow |
| ML Classifier | scikit-learn (RandomForest) |
| Data Processing | NumPy, Pandas |

---

## AI Model — Virtual Try-On System

### Architecture

The AI system is a standalone FastAPI microservice (`ai-model/`) that the React frontend communicates with independently of the Node.js backend.

```
Customer uploads photo
        │
        ▼
FastAPI /try-on endpoint
        │
        ├── MediaPipe FaceMesh → 468 facial landmarks
        │
        ├── Geometric ratio extraction
        │     ├── face_ratio       (height / width)
        │     ├── jaw_ratio        (jaw_width / cheekbone_width)
        │     ├── cheek_jaw_ratio
        │     └── forehead_chin_ratio
        │
        ├── RandomForest Classifier → face shape (one of 6)
        │
        ├── Landmark-based jewellery overlay (OpenCV + alpha blending)
        │
        └── Returns: face_shape + recommendations + try-on image URL
```

### Face Shape Classification

| Face Shape | Description |
|---|---|
| Oval | Balanced proportions, slightly narrower jaw |
| Round | Similar width and height, soft angles |
| Square | Strong jaw, roughly equal width throughout |
| Heart | Wide forehead, narrow chin |
| Diamond | Wide cheekbones, narrow forehead and jaw |
| Oblong | Longer than wide, even proportions |

**Model:** RandomForest (200 estimators, balanced class weights, 75/25 train-test split)  
**Saved model:** `ai-model/app/saved_models/face_shape_model.pkl`  
**Face detector:** `ai-model/app/saved_models/face_landmarker.task` (MediaPipe, 3.7 MB)

### Jewellery Overlay Positioning

Each jewellery type is anchored to specific facial landmarks and scaled dynamically based on face size:

| Type | Anchor Landmark | Scale |
|---|---|---|
| Earrings | Ear / eye level | 15% of face height |
| Glasses | Eye centre | 1.2× eye distance |
| Nose Ring | Nostril centre | 5% of face height |
| Headpiece | Forehead top | 30% of face height |

### AI API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze-face` | Returns detected face shape and feature ratios |
| `POST` | `/try-on` | Returns try-on image URL and style recommendations |
| `GET` | `/download/{filename}` | Download generated try-on image |
| `GET` | `/health` | Service health check |

---

## Project Structure

```
mern-ecommerce-admin-panel/
├── backend/                    # Express + Mongoose REST API (port 4000)
│   ├── config/
│   │   └── mongodb.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── seed.js                 # Seeds 50 jewellery products
│
├── frontend/                   # React customer storefront (Vite, port 5173)
│   └── src/
│       ├── components/
│       │   └── VirtualTryOn.jsx   # AI try-on modal
│       ├── context/
│       │   └── ShopContext.jsx    # Cart state (flat structure, no sizes)
│       └── pages/
│           ├── Product.jsx        # "Try On" button integration
│           ├── Cart.jsx
│           └── PlaceOrder.jsx
│
├── admin/                      # React admin dashboard (Vite, port 5174)
│
└── ai-model/                   # FastAPI AI microservice (port 8000)
    ├── requirements.txt
    └── app/
        ├── main.py             # FastAPI server, CORS, endpoints
        ├── model/
        │   ├── face_analyzer.py      # Landmark extraction
        │   ├── jewelry_overlay.py    # OpenCV overlay & alpha blending
        │   ├── recommender.py        # Face-shape → style recommendations
        │   └── train_face_shape.py   # Model training script
        ├── saved_models/
        │   ├── face_shape_model.pkl
        │   └── face_landmarker.task
        ├── assets/
        │   ├── face_shape_dataset/   # Training images by shape
        │   └── jewelry_assets/       # Overlay PNGs (RGBA)
        ├── uploads/
        └── outputs/
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.9
- MongoDB running locally (`mongodb://localhost:27017`)
- A [Cloudinary](https://cloudinary.com/) account
- A [Stripe](https://stripe.com/) account (test keys are fine)

### 1. Clone the Repository

```bash
git clone https://github.com/mani901/virtual-jewelry-tryon-ecommerce.git
cd virtual-jewelry-tryon-ecommerce
```

### 2. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Admin panel
cd ../admin && npm install

# AI model
cd ../ai-model && pip install -r requirements.txt
```

### 3. Seed the Database

```bash
cd backend && node seed.js
```

This clears and re-inserts 50 sample jewellery products.

---

## Environment Variables

### `backend/.env`

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your_jwt_secret

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
```

> `MONGODB_URI` must **not** include a database name — `mongodb.js` appends `/zewar-house` automatically.

### `frontend/.env` and `admin/.env`

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_AI_MODEL_URL=http://localhost:8000
```

---

## Running the Application

Open four terminals and run each service:

```bash
# Terminal 1 — Node.js backend
cd backend && npm run dev

# Terminal 2 — React customer storefront
cd frontend && npm run dev

# Terminal 3 — React admin dashboard
cd admin && npm run dev

# Terminal 4 — FastAPI AI microservice
cd ai-model && uvicorn app.main:app --reload --port 8000
```

### Admin Login

| Field | Value |
|---|---|
| Email | `admin@gmail.com` |
| Password | `admin123` |

---

## API Reference

### Node.js Backend (port 4000)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/user/login` | User login |
| `POST` | `/api/user/register` | User registration |
| `GET` | `/api/product/list` | List all products |
| `POST` | `/api/product/add` | Add product (admin) |
| `DELETE` | `/api/product/remove` | Remove product (admin) |
| `POST` | `/api/cart/add` | Add item to cart |
| `POST` | `/api/order/place` | Place an order (Stripe) |
| `GET` | `/api/order/userorders` | Get user's order history |

### AI Microservice (port 8000)

| Method | Route | Input | Output |
|---|---|---|---|
| `POST` | `/analyze-face` | Image file | `{ face_shape, features, points }` |
| `POST` | `/try-on` | Image file + `jewelry_type` | `{ face_shape, download_url, recommendations }` |
| `GET` | `/download/{filename}` | — | Try-on image (JPEG) |
| `GET` | `/health` | — | Service status |

**Accepted `jewelry_type` values:** `earrings`, `glasses`, `nose_ring`, `headpiece`

---

## Stripe Test Credentials

Use these in development — no real charges occur:

| Field | Value |
|---|---|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| ZIP | Any 5 digits |

---

## Security Notes

- Never commit `.env` files — add them to `.gitignore`
- Use a strong, random `JWT_SECRET` in production
- Rotate Cloudinary and Stripe keys if ever exposed
- The AI microservice has CORS open to all origins (`*`) — restrict this in production
- Generated try-on images in `ai-model/app/outputs/` should be periodically cleaned up in production

---

## Domain

**Categories:** Necklaces · Earrings · Rings · Bracelets · Anklets  
**Materials:** Gold · Silver · Diamond · Pearl · Gemstone  
**Currency:** PKR (₨)  

---

*Built for demonstrating MERN stack development, computer vision, and machine learning integration for an e-commerce use case.*
