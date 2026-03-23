# AmarktAI Marketing — Frontend

The React frontend for the AmarktAI Marketing platform.

---

## Tech Stack

| Technology      | Version | Purpose                                   |
|-----------------|---------|-------------------------------------------|
| React           | 19      | UI framework                              |
| Vite            | 6+      | Build tool and dev server                 |
| TypeScript      | 5+      | Type safety                               |
| Tailwind CSS    | 4+      | Utility-first styling                     |
| shadcn/ui       | latest  | Accessible component library              |
| framer-motion   | latest  | Animations and transitions                |
| react-router-dom| 7+      | Client-side routing                       |

---

## Development Setup

**Prerequisites:** Node.js 18+

```bash
cd app
npm install
npm run dev
```

Dev server runs at: **http://localhost:5173**

The Vite dev server proxies `/api` requests to the backend at `http://localhost:8000`. To change the backend URL, set `VITE_API_URL` in `app/.env`.

---

## Available Scripts

| Script          | Command           | Description                          |
|-----------------|-------------------|--------------------------------------|
| Dev server      | `npm run dev`     | Start with HMR at localhost:5173     |
| Production build| `npm run build`   | Type-check + build to `dist/`        |
| Lint            | `npm run lint`    | Run ESLint across all source files   |
| Preview         | `npm run preview` | Preview the production build locally |

---

## Environment Variables

Create `app/.env` (or `app/.env.local`) to override defaults:

| Variable       | Default      | Description                                           |
|----------------|--------------|-------------------------------------------------------|
| `VITE_API_URL` | *(relative)* | Backend base URL. Set to `http://localhost:8000` for local dev if not using Vite proxy. |

All Vite env vars must be prefixed with `VITE_` to be exposed to the browser.

---

## Folder Structure

```
app/
├── public/               # Static assets (favicon, etc.)
├── src/
│   ├── app/              # Page-level route components
│   │   ├── dashboard/    # Main dashboard views
│   │   ├── auth/         # Login and registration pages
│   │   └── ...           # Feature pages
│   ├── components/
│   │   ├── ui/           # shadcn/ui base components
│   │   ├── layout/       # App shell, sidebar, header
│   │   ├── dashboard/    # Dashboard-specific widgets
│   │   └── auth/         # Auth form components
│   ├── hooks/            # Custom React hooks
│   ├── lib/
│   │   ├── api.ts        # Axios/fetch API client
│   │   ├── auth.ts       # Auth helpers (token storage)
│   │   └── utils.ts      # General utilities
│   ├── types/            # TypeScript interfaces and types
│   ├── App.tsx           # Root component with router
│   └── main.tsx          # App entry point
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Authentication

Authentication uses **JWT tokens** issued by the FastAPI backend.

- Tokens are stored in `localStorage` under the key `amarktai_token`
- All authenticated API requests include the header: `Authorization: Bearer <token>`
- The `AuthProvider` context wraps the app and exposes the `useAuth()` hook
- `useAuth()` returns `{ user, token, login, logout, isAuthenticated }`
- Protected routes redirect unauthenticated users to `/login`

There is no external auth provider. No Clerk. No Supabase.

---

## Production Build

```bash
npm run build
```

Output is written to `app/dist/`. Serve this directory with Nginx using `try_files $uri /index.html` to support client-side routing.

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for full Nginx configuration.
