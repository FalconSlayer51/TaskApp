# Task Tracker

Personal task app: React + TypeScript + shadcn/ui on the frontend, Express MVC + MongoDB on the backend. Tasks, a kanban board, and a small analytics dashboard — no sharing or roles.

## Features

- Email/password auth with JWT
- Task CRUD, search, filters, sort, pagination
- Kanban board with drag-and-drop status updates
- Dashboard KPIs and charts
- Light / dark / system theme (saved in the browser)
- Collapsible named sidebar on desktop; off-canvas nav on mobile

## Requirements

- Node.js 20+
- MongoDB locally or Atlas

## Environment

Copy `backend/.env.example` to `backend/.env` and set:

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `4000`) |
| `MONGODB_URI` | Mongo connection string |
| `JWT_SECRET` | Signing secret for access tokens |
| `CLIENT_ORIGIN` | Frontend origin for CORS (`http://localhost:5173`) |

Frontend talks to the API through the Vite proxy (`/api` → `http://localhost:4000`). Optional: set `VITE_API_URL` in `frontend/.env` if the API is on another host.

## Run

Terminal 1:

```bash
cd backend
npm install
npm run dev
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, create an account, and add a task.

## Layout

- `backend/` — Express MVC (`src/models`, `src/controllers`, `src/routes`)
- `frontend/` — Vite React app, feature folders under `src/features`
