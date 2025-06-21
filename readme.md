# SecureAuth

A full-stack authentication system built with **React**, **Redux Toolkit**, **RTK Query**, **Node.js**, **Express**, **Prisma**, and **PostgreSQL**. It features secure login, registration, email verification, password resets, role-based access control, and JWT-powered session management — all wrapped in a modern UI using **Shadcn UI** and **Tailwind CSS**.

## Features

- User Registration & Login
- JWT Access & Refresh Tokens with Auto-Refresh
- Email Verification with OTP
- Forgot Password Flow with Secure Token
- Role-Based Access Control (RBAC)
- Multer + Cloudinary Image Uploads
- RTK Query for API Caching & Error Handling
- Reusable UI Components with Shadcn UI & Tailwind
- Zod-based Schema Validation
- Protected Routes & Middleware
- Structured Logging & Clean Architecture

## Tech Stack

**Frontend:**

- React
- Redux Toolkit + RTK Query
- TypeScript
- Tailwind CSS + Shadcn UI
- React Router DOM
- Vite

**Backend:**

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Zod
- JWT (Access & Refresh Tokens)
- Multer + Cloudinary
- Nodemailer + Mailtrap (for emails)

## Screenshots

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/akgbytes/secure-auth.git
cd akgbytes
```

### 2. Setup Environment Variables

Create a .env file in both the frontend/ and backend/ directories using .env.example as a guide.

### 3. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Setup the Database

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Start the development servers

```bash
cd frontend && npm run dev
cd ../backend && npm run dev
```
