<div align="center">

<img src="public/fav_icon1.png" alt="ActiveCore Logo" width="80" height="80" />

# ⚡ ActiveCore — Frontend

### Premium Workout Wear E-Commerce Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)


</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏋️ Overview

**ActiveCore** is a full-featured, production-ready e-commerce platform built for a premium workout wear brand. It delivers a seamless shopping experience with real-time notifications, Stripe-powered payments, Google OAuth, and a fully functional admin dashboard — all wrapped in a performant, responsive UI.

This repository contains the **frontend** application. The backend is built separately and communicates via a RESTful API with JWT authentication and WebSocket support for live notifications.

---

## ✨ Features

### 🛍️ Customer-Facing
- **Product Catalog** — Browse products with advanced filters, category navigation, and variant selection (size/color)
- **Product Details** — Rich product pages with image galleries, reviews & ratings, and a buying modal
- **Search** — Live product search modal with instant results
- **Shopping Cart** — Persistent cart managed via Redux with real-time quantity updates
- **Wishlist** — Save and manage favorite products across sessions
- **Secure Checkout** — Stripe-integrated payment flow with a dedicated checkout component
- **Order Tracking** — View full order history and individual order statuses
- **Authentication** — Email/password login, Google OAuth, OTP verification, forgot/reset password
- **User Profile** — Manage personal details and account settings
- **Real-Time Notifications** — WebSocket-powered notification bell with live updates

### 🔐 Admin Dashboard
- **Dashboard Analytics** — Key metrics with animated charts (Chart.js) and count-up statistics
- **Product Management** — Full CRUD for products, variants, categories, and product types
- **Inventory Management** — Monitor and update stock levels
- **Order Management** — View, filter, and update order statuses with a detailed modal
- **User Management** — Browse and manage customer accounts
- **Notification Management** — Send and manage platform-wide notifications

### 🎨 UI/UX
- Smooth page transitions and scroll-velocity-based animations (GSAP + Motion)
- Banner & testimonial sliders
- Skeleton loading states for all async content
- Toast notifications via Sonner
- PDF invoice generation with jsPDF
- Fully responsive design across all breakpoints

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 |
| **Build Tool** | Vite 6 |
| **State Management** | Redux Toolkit + RTK Query |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios (with interceptors) |
| **Payments** | Stripe (React Stripe.js) |
| **Authentication** | JWT + Google OAuth (`@react-oauth/google`) |
| **Real-Time** | WebSockets (custom `notificationSocket` service) |
| **Animations** | GSAP v3 + Motion (Framer Motion) |
| **Charts** | Chart.js v4 |
| **PDF Generation** | jsPDF + jsPDF-AutoTable |
| **UI Components** | shadcn/ui (New York style) + Lucide React icons |
| **Date Utilities** | date-fns |
| **Linting** | ESLint with React Hooks + React Refresh plugins |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── routes.jsx              # Centralized route definitions
│   ├── store.js                # Redux store configuration
│   ├── guards/                 # Route protection components
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicOnlyRoute.jsx
│   │   └── RoleProtectedRoute.jsx
│   └── layouts/
│       ├── MainLayout.jsx      # Customer-facing layout (Navbar + Footer)
│       └── AdminLayout.jsx     # Admin panel layout (Sidebar)
│
├── features/                   # Feature-sliced architecture
│   ├── auth/                   # Login, Signup, OTP, Password reset
│   ├── products/               # Product listing, filters, details, reviews
│   ├── cart/                   # Cart state, API, cart page
│   ├── wishlist/               # Wishlist state, API, wishlist page
│   ├── orders/                 # Orders, payment, Stripe checkout
│   ├── notifications/          # Real-time notification slice & page
│   ├── admin/                  # Full admin dashboard & management pages
│   └── marketing/              # Home, About, Contact pages
│
├── services/
│   ├── axiosInstance.js        # Axios with auth interceptors & token refresh
│   ├── apiBase.js              # RTK Query base API configuration
│   ├── notificationSocket.js   # WebSocket connection manager
│   └── stripe.js               # Stripe initialization
│
├── shared/
│   ├── components/             # Reusable UI: Navbar, Footer, Modals, Loaders
│   └── utils/                  # Helper functions & animation utilities
│
└── components/
    └── ui/                     # shadcn/ui components (e.g., Sonner toaster)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** or **yarn**
- A running instance of the [ActiveCore Backend](#)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adinathmk/activecore-frontend.git
   cd activecore-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in the required values (see [Environment Variables](#-environment-variables)).

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:8000/api

# WebSocket URL for real-time notifications
VITE_WS_BASE_URL=ws://localhost:8000/ws

# Stripe publishable key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# Google OAuth client ID
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
```

> **Note:** Never commit your `.env` file. Add it to `.gitignore`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 🏗️ Architecture

### State Management
The app uses **Redux Toolkit** with a feature-sliced architecture. Each feature owns its slice, async thunks, and RTK Query API definitions — keeping state logic colocated with the feature it belongs to.

### API Layer
A centralized **Axios instance** handles all HTTP requests with:
- Automatic JWT access token injection
- Silent token refresh on 401 responses
- Centralized error normalization via `getErrorMessage.js`

RTK Query is layered on top for declarative data fetching, caching, and cache invalidation.

### Route Guards
Three route guards protect navigation:
- `ProtectedRoute` — Requires authentication
- `PublicOnlyRoute` — Redirects authenticated users away from login/signup
- `RoleProtectedRoute` — Restricts admin routes to users with the `admin` role

### Real-Time Notifications
A custom `notificationSocket.js` service manages the WebSocket lifecycle (connect, reconnect, message dispatch) and integrates with the Redux notification slice to update the UI live.


---

<div align="center">

Built with ❤️ by [Adinath MK](https://github.com/adinathmk)

⭐ Star this repo if you found it helpful!

</div>
