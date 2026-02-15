# Full Stack Authentication & Role-Based Dashboard Boilerplate

This repository contains a rigorous, production-ready Full Stack Authentication System with a specialized Role-Based Access Control (RBAC) Dashboard. It is split into two main parts: a **Client** (React frontend) and a **Server** (Node.js/Express backend).

This project demonstrates a complete user lifecycle, from secure registration to role-specific dashboard access, all wrapped in a premium, modern UI.

---

## 1. Project Architecture & Features

### Client-Side (Frontend)

Built with **React 19**, **Vite**, and **Tailwind CSS v4**, focusing on performance and a high-end user experience.

#### **Key Features:**

- **Authentication Hub:**
  - **Login & Signup:** sleek forms with real-time validation.
  - **Forgot Password:** initiating password reset via email.
  - **OTP Verification:** secure 6-digit code entry for account verification.
  - **Reset Password:** final step in the account recovery process.
- **Role-Based Dashboards:**
  - **Dashboard Switcher:** unique component to simulate different user roles (Admin, Author, Editor, User) instantly.
  - **Persistent Layout:** sidebar navigation that adapts based on the active role.
  - **Role-Specific Pages:**
    - **Admin Dashboard:** system analytics, user management, and global settings.
    - **Author Dashboard:** content creation tools and draft management.
    - **Editor Dashboard:** review queues and editorial tools.
    - **User Dashboard:** basic profile and activity usage.
- **Advanced UI/UX:**
  - **Liquid Chrome Background:** a WebGL-powered, interactive background using OGL.
  - **Theme System:** toggle between Light and Dark modes with persistent preference storage.
  - **Notification Center:** a robust toast and notification system for non-intrusive alerts.
  - **Profile Management:** modal-based profile editing for streamlined user updates.

### Server-Side (Backend)

Built with **Node.js**, **Express v5**, and **TypeScript**, ensuring type safety and scalability.

#### **Key Features:**

- **Security First:**
  - **JWT Authentication:** stateless, secure token-based session handling.
  - **Bcrypt Hashing:** industry-standard password encryption.
  - **Middleware Protection:** custom middleware to protect routes and verify user roles.
- **Data Management:**
  - **MongoDB & Mongoose:** flexible schema modeling for Users and System Settings.
- **Communication:**
  - **Email Service:** integrated `nodemailer` / `resend` for transactional emails (OTPs, localized notifications).
- **API Structure:**
  - **MVC Pattern:** clean separation of Models, Views (Response logic), and Controllers.
  - **Modular Routes:** dedicated route files for Auth and Settings.

---

## 2. Project File Structure

Below is the comprehensive map of the file structure for both Client and Server.

### Root Directory

```
/root
├── client/                 # React Frontend Application
├── server/                 # Node.js Backend Application
├── PROJECT_REPORT.md       # Detailed project status report
└── README.md               # This documentation file
```

### Client Structure (`/client`)

The frontend is organized for scalability, with distinct separation for common components and role-specific pages.

```
/client
├── package.json
├── src/
│   ├── components/                 # Reusable UI Components
│   │   ├── DashboardLayout.tsx     # Main wrapper with Sidebar/Params
│   │   ├── DashboardSwitcher.tsx   # Role switching controls
│   │   ├── LiquidChrome.tsx        # WebGL Background effect
│   │   ├── NotificationCenter.tsx  # Notification history/list
│   │   ├── NotificationToast.tsx   # Individual toast item
│   │   ├── Profile.tsx             # User profile display
│   │   ├── ProfileEditModal.tsx    # Edit profile form modal
│   │   ├── ProtectedRoute.tsx      # Auth guard wrapper
│   │   ├── Settings.tsx            # App-wide settings UI
│   │   ├── ThemeToggle.tsx         # Dark/Light mode switch
│   │   ├── Toast.tsx               # Toast primitives
│   │   └── ToastProvider.tsx       # Context for toast system
│   │
│   ├── pages/                      # Page Definitions
│   │   ├── Login.tsx               # Login screen
│   │   ├── Signup.tsx              # Registration screen
│   │   ├── ForgotPassword.tsx      # Recovery init screen
│   │   ├── ResetPassword.tsx       # New password entry
│   │   ├── VerifyOtp.tsx           # OTP entry screen
│   │   ├── PrivacyPolicy.tsx       # Static legal page
│   │   ├── TermsOfService.tsx      # Static legal page
│   │   │
│   │   ├── admin/                  # Admin-specific Views
│   │   │   ├── adminDashboard.tsx
│   │   │   ├── AdminComponents.tsx
│   │   │   └── Settings.tsx
│   │   │
│   │   ├── author/                 # Author-specific Views
│   │   │   ├── authorDashboard.tsx
│   │   │   └── AuthorComponents.tsx
│   │   │
│   │   ├── editor/                 # Editor-specific Views
│   │   │   ├── editorDashboard.tsx
│   │   │   └── EditorComponents.tsx
│   │   │
│   │   └── users/                  # Standard User Views
│   │       ├── userDashboard.tsx
│   │       └── UsersComponents.tsx
│   │
│   ├── App.tsx                     # Main Router configuration
│   └── main.tsx                    # Entry point
```

### Server Structure (`/server`)

The back-end follows a strict Controller-Service-Model architecture.

```
/server
├── package.json
├── App.ts                          # App Entry point (Express setup)
├── src/
│   ├── controllers/                # Request Handlers
│   │   ├── authController.ts       # Login, Signup, OTP logic
│   │   └── settingsController.ts   # System config handlers
│   │
│   ├── middleware/                 # Request Interceptors
│   │   └── auth.ts                 # JWT verification & Role checks
│   │
│   ├── models/                     # Database Schemas (Mongoose)
│   │   ├── Users.ts                # User data model
│   │   └── SystemSettings.ts       # Global app settings model
│   │
│   ├── routes/                     # API Endpoint Definitions
│   │   ├── authRoutes.ts           # /api/auth endpoints
│   │   └── settings.ts             # /api/settings endpoints
│   │
│   └── utils/                      # Helper Functions
│       ├── emailService.ts         # Email sending logic
│       └── roleDelegation.ts       # Role utility functions
```

---

## 3. Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- npm or pnpm

### Running the Client

1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    _The app will be available at `http://localhost:5173`._

### Running the Server

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your `.env` file (copy from `.env.example` if available) with:
    - `PORT`
    - `MONGO_URI`
    - `JWT_SECRET`
4.  Start the server:
    ```bash
    npm run dev
    ```
    _The server will run on `http://localhost:5000` (or your configured port)._

---

## 4. API Documentation Summary

### Auth Endpoints (`/api/auth`)

- `POST /signup`: Register a new user.
- `POST /login`: Authenticate and receive a JWT.
- `POST /verify-otp`: Verify account email.
- `POST /forgot-password`: Request a password reset link.
- `POST /reset-password`: Set a new password.

### Settings Endpoints (`/api/settings`)

- `GET /`: Retrieve global system settings.
- `PUT /`: Update system settings (Admin only).

---
