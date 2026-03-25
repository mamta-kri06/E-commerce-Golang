# 🛒 E-Commerce Web Application

A full-featured e-commerce web application with **React.js (Vite)** frontend and **Go (Gin + GORM)** backend.  
Users can browse products, manage wishlist & cart, add delivery addresses, checkout using Razorpay, and track their orders.

---

## 🚀 Features

### 👤 User Features

- **Authentication**
  - JWT-based Login & Signup
  - Protected routes

- **Products**
  - Browse all products
  - View product details (image, price, stock)
  - Category-based filtering

- **Search & Filters**
  - Search products by name
  - Filter by category, price

- **Wishlist ❤️**
  - Add/remove items
  - Persistent per user

- **Cart 🛍️**
  - Add items to cart
  - Update quantity
  - Remove items
  - Auto price calculation

- **Address Management 📍**
  - Add multiple delivery addresses
  - Select address during checkout
  - Mark default address

- **Checkout & Payment 💳**
  - Step-based checkout (Cart → Address → Payment)
  - Integrated with **Razorpay**
  - Secure payment verification (backend)

- **Orders 📦**
  - Order creation after payment
  - Order history page
  - Order status (pending, paid, etc.)
  - Retry payment for failed orders
  - Invoice download (for paid orders)

- **Email Notifications 📧**
  - Order confirmation email 

---

### 🛠 Admin Features (Optional)

- Add new products
- Edit product details
- Delete products
- Manage stock availability

---

## 🧰 Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router
- Context API (Cart, Auth)

### Backend
- Go (Golang)
- Gin Framework
- GORM ORM

### Database
- PostgreSQL

### Authentication
- JWT-based authentication

### Payment Gateway
- Razorpay Integration

### Deployment
- Frontend → Vercel  
- Backend → Render  

---

## 🔄 Application Flow

1. User signs up / logs in  
2. Browses products  
3. Adds items to cart  
4. Proceeds to checkout  
5. Selects delivery address  
6. Makes payment via Razorpay  
7. Order is created & stored  
8. User can track order in "My Orders"  
