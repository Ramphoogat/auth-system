# Migration Guide: React/Express to Next.js

This guide outlines the steps to migrate your current project (React + TypeScript + Tailwind CSS + Express) to a unified **Next.js** architecture using the **App Router**.

## 1. Why Next.js?

Next.js provides a unified framework for both your frontend and backend. It simplifies routing, improves SEO with Server-Side Rendering (SSR), and offers built-in optimizations.

---

## 2. Migration Commands

To start the migration, you should create a new Next.js project and then move your existing code into it.

### Step 1: Initialize Next.js

Run this command in your root directory (`f:\auth`):

```bash
npx create-next-app@latest next-app --typescript --tailwind --eslint
```

During the prompt, select:

- **Would you like to use `src/` directory?** Yes
- **Would you like to use App Router?** Yes
- **Would you like to customize the default import alias?** No (or `@/*`)

### Step 2: Install Additional Dependencies

In your new `next-app` directory, install the libraries you were using in your Express server (e.g., database drivers, JWT, etc.):

```bash
cd next-app
npm install lucide-react clsx tailwind-merge # Popular UI utils
# Add your specific server dependencies here, e.g.:
# npm install mongoose jsonwebtoken dotenv
```

---

## 3. Structural Changes

### Old Structure (Vite + Express)

```text
f:\auth\
├── client/              # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── tailwind.config.js
└── server/              # Express Backend
    ├── src/
    │   ├── routes/
    │   ├── controllers/
    │   └── models/
    └── index.ts
```

### New Unified Structure (Next.js)

```text
f:\auth\next-app\
├── src/
│   ├── app/             # The core of Next.js
│   │   ├── layout.tsx   # Global layout (Navbar, Footer)
│   │   ├── page.tsx     # Homepage (formerly App.tsx / Home)
│   │   ├── api/         # ALL BACKEND ROUTES GO HERE
│   │   │   └── activity/
│   │   │       └── route.ts  # replaces server/src/routes/activityRoutes.ts
│   │   └── profile/
│   │       └── page.tsx      # replaces client profile page
│   ├── components/      # Shared UI components
│   ├── lib/             # Server utilities (DB connections, auth functions)
│   └── types/           # Shared TypeScript interfaces
├── public/              # Static assets (images, fonts)
├── .env.local           # Merged environment variables
├── tailwind.config.ts   # Unified Tailwind config
└── next.config.ts       # Next.js specific settings
```

---

## 4. How to Port Your Code

### A. Frontend (React to Next.js Components)

1.  **Components**: Move `client/src/components/*` to `next-app/src/components/*`.
2.  **Pages**: Next.js uses file-based routing.
    - `client/src/pages/Login.tsx` → `next-app/src/app/login/page.tsx`.
3.  **Hooks/State**: Move custom hooks to `next-app/src/hooks/`.
4.  **Client Directives**: In Next.js, components are Server Components by default. Add `'use client';` at the top of files that use `useState`, `useEffect`, or browser APIs.

### B. Backend (Express to Next.js API Routes)

Express routes are replaced by files in `app/api/`.

**Before (Express):**

```typescript
// server/src/routes/activityRoutes.ts
router.get("/", (req, res) => {
  res.json({ message: "Hello" });
});
```

**After (Next.js API Route):**

```typescript
// src/app/api/activity/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

---

## 5. Next Steps

1.  **Merge `.env` files**: Combine `client/.env` and `server/.env` into one `.env.local` in `next-app`.
2.  **Update Imports**: Fix import paths in your components (e.g., from `../../components/...` to `@/components/...`).
3.  **Test**: Run `npm run dev` in the `next-app` directory to see your new application in action!
