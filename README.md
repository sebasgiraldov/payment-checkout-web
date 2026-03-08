# TechStore Payment Checkout Web

![TechStore Banner](https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=1200)

A high-performance, mobile-first e-commerce checkout application built with React, Redux Toolkit, and TypeScript. This project demonstrates a robust, production-ready payment flow integrated with a real-time inventory and payment backend.

## 🚀 Key Features

- **5-Step Professional Flow**: A guided wizard-like checkout process from catalog to success.
- **Global State Management**: Powered by **Redux Toolkit** with full state persistence (`localStorage`) to prevent data loss on page refreshes.
- **Real-Time API Integration**: Connected to a Railway-hosted backend for live product stock, transaction creation, and payment processing.
- **Strict Form Validation**: Implemented using **React Hook Form** and **Zod** for high-integrity user data.
- **Premium UI/UX**: Modern, dark-themed interface with **Framer Motion** animations, optimized for mobile devices (iPhone SE compliant).
- **SEO Optimized**: Fully semantic HTML, metadata, and OpenGraph support.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite |
| **State** | Redux Toolkit, Redux Persist (Custom) |
| **Styling** | Vanilla CSS + Tailwind CSS utilities |
| **Validation** | Zod, React Hook Form |
| **Animations** | Framer Motion (Motion/react) |
| **Testing** | Jest, React Testing Library |
| **Deployment** | Vercel |

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sebasgiraldov/payment-checkout-web.git
   cd payment-checkout-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   VITE_API_BASE_URL=https://payment-checkout-api-staging.up.railway.app/api/v1
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing

The project uses Jest for unit testing of core business logic and Redux state transitions.

```bash
npm test
```

## 🚢 Deployment

This project is configured for seamless deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. In the Vercel dashboard, add the `VITE_API_BASE_URL` environment variable.
3. Vercel will automatically detect the build settings and deploy.

## 📜 Architectural Decisions

- **Clean Code & SOLID**: Logic is decoupled from the UI using Redux slices and dedicated service layers for API communication.
- **Mobile-First Approach**: The UI was designed with a focus on usability on smaller screens while remaining responsive for desktop users.
- **Fail-Safe Persistence**: Global checkout state is mirrored to `localStorage` to ensure a resilient user experience during multi-step processes.

---
Developed with ❤️ by Sebastian Giraldo - Senior Fullstack Engineer.
