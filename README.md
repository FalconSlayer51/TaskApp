# Task Tracker

Task list, kanban board, and a small analytics dashboard. You get a personal workspace when you sign up. You can invite people who already have an account and share one board with them.

## Live deployment

| Service | URL |
|---|---|
| Frontend | [https://taskapp-1-fg7z.onrender.com/](https://taskapp-1-fg7z.onrender.com/) |
| Backend API | [https://taskapp-a7iu.onrender.com](https://taskapp-a7iu.onrender.com) |

Guests see the landing page at `/`. After sign-in you land on `/dashboard`. The production frontend is built with `VITE_API_URL=https://taskapp-a7iu.onrender.com`. The API allows CORS from `https://taskapp-1-fg7z.onrender.com`.

Health check: `GET https://taskapp-a7iu.onrender.com/health`

## Features

- Email/password auth with JWT
- Public landing page at `/` with product docs and sharing guidance
- Personal workspace on signup; extra workspaces when someone invites you
- Invite picker (owners): searchable list of existing accounts — they must sign up first
- Task CRUD, assignee, due date, search, filters, sort, pagination
- Kanban board (drag on desktop; status control on phones)
- Dashboard KPIs and charts for the **selected** workspace
- Light / dark / system theme (saved in the browser)
- Named sidebar on desktop; bottom tabs on phones
- Workspace-scoped data refreshes about every 15 seconds (and on tab focus) for collaboration

## How sharing works

1. Both people create accounts.
2. The owner opens **Settings**, searches the directory, and taps **Add**.
3. The invitee keeps their personal workspace **and** gets the shared one in the workspace switcher (sidebar, header, or Settings).
4. Both people must **select that shared workspace**. Then they see the same tasks, including assigned ones.

Assigned work does **not** appear on the assignee’s personal board. Switching is how you open the shared space.

Updates from other people are not instant. The app rechecks about every 15 seconds, or when you click back into the tab.

### If a task status does not update

**Refresh the page.** Then confirm both of you have the **same workspace** selected. If you were looking at a background window, click that window or wait about 15 seconds.

## Requirements

- Node.js 20+
- MongoDB locally or Atlas (whitelist your IP if you use Atlas)

## Environment (local)

Copy `backend/.env.example` to `backend/.env` and set:

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `4000`) |
| `MONGODB_URI` | Mongo connection string |
| `JWT_SECRET` | Signing secret for access tokens |
| `CLIENT_ORIGIN` | Frontend origin for CORS (`http://localhost:5173`) |

For local dev, leave `frontend/.env` empty (or omit it). Vite proxies `/api` to `http://localhost:4000`. For production builds, set `VITE_API_URL` to the API origin (no `/api` suffix).

## Run locally

Use **two terminals**. The API must be running or the UI will fail with connection errors.

Terminal 1 (API, port 4000):

```bash
cd backend
npm install
npm run dev
```

Terminal 2 (UI, port 5173):

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Guests see the landing page. After you sign in, you land on `/dashboard`.

## Deploy on Render

Two services from the same repo.

### Backend (Web Service)

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

Environment: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (frontend URL, no trailing slash). Render sets `PORT` automatically.

### Frontend (Static Site)

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Environment: `VITE_API_URL` = backend URL (e.g. `https://taskapp-a7iu.onrender.com`). Rebuild after changing this variable.

**SPA routing:** add a rewrite `/*` → `/index.html` so routes like `/tasks` work on refresh.

## API

Base URL (production): `https://taskapp-a7iu.onrender.com`  
All JSON routes are under `/api`. Local dev uses the Vite proxy: `http://localhost:5173/api/...` → `http://localhost:4000/api/...`.

### Authentication

Protected routes expect:

```
Authorization: Bearer <jwt>
```

Task and analytics routes also expect the active workspace:

```
X-Workspace-Id: <workspaceId>
```

If the header is missing, the API falls back to the user’s personal workspace.

### Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/health` | — | `{ ok: true }` — not under `/api` |
| `POST` | `/api/auth/register` | — | Body: `{ name, email, password }` → `{ token, user }` |
| `POST` | `/api/auth/login` | — | Body: `{ email, password }` → `{ token, user }` |
| `GET` | `/api/auth/me` | Bearer | Current user |
| `PATCH` | `/api/auth/me` | Bearer | Body: `{ name }` |
| `GET` | `/api/workspaces` | Bearer | List memberships → `{ items: PublicWorkspace[] }` |
| `GET` | `/api/workspaces/:id/members` | Bearer | Any member → `{ items: PublicMember[] }` |
| `GET` | `/api/workspaces/:id/directory` | Bearer | **Owner only** — users not yet in workspace → `{ items: DirectoryUser[] }` |
| `POST` | `/api/workspaces/:id/invites` | Bearer | **Owner only** — Body: `{ userId }` or `{ email }` → `{ member }` |
| `DELETE` | `/api/workspaces/:id/members/:userId` | Bearer | Owner removes member, or member leaves self |
| `GET` | `/api/tasks` | Bearer + workspace | Query filters below → paginated `{ items, page, limit, total, totalPages }` |
| `POST` | `/api/tasks` | Bearer + workspace | Body: `{ title, description?, status?, priority?, dueDate?, assigneeId? }` |
| `GET` | `/api/tasks/:id` | Bearer + workspace | Single task |
| `PATCH` | `/api/tasks/:id` | Bearer + workspace | Partial update (any member) |
| `DELETE` | `/api/tasks/:id` | Bearer + workspace | |
| `GET` | `/api/analytics` | Bearer + workspace | KPIs and chart data for current workspace |

**`GET /api/tasks` query parameters**

| Param | Values |
|---|---|
| `status` | `todo` \| `in_progress` \| `done` |
| `priority` | `low` \| `medium` \| `high` |
| `search` | Title substring (case-insensitive) |
| `assignedToMe` | `true` — only tasks assigned to the current user |
| `page` | Default `1` |
| `limit` | Default `10`, max `200` |
| `sort` | `createdAt` \| `dueDate` \| `priority` |
| `order` | `asc` \| `desc` |

Errors return JSON with a `message` and optional field `errors[]`. `401` clears the client session; `403` when not a workspace member or lacking owner permission.

## Design decisions

**Stack.** TypeScript end-to-end. Backend: Express MVC, Mongoose, Zod validators, JWT. Frontend: Vite, React, TanStack Query, Zustand, shadcn/ui, React Router.

**Workspaces as tenancy.** Every task belongs to one `workspaceId`. The client sends `X-Workspace-Id` on API calls; list, board, and analytics only show data for the selected workspace. Users get a personal workspace at registration; shared workspaces are added via membership rows, not by copying tasks.

**Sharing without email.** Invites look up existing accounts (`GET .../directory`, `POST .../invites` with `userId`). No SMTP, no magic links. Owners add people from Settings; invitees see the new workspace in the switcher after polling (~15s) or on tab focus.

**One board, many views.** List and kanban read the same task collection for the current workspace. Assignee is metadata on the task (`assigneeId`), not a separate inbox on the assignee’s personal workspace. To see assigned work, switch to the shared workspace.

**Collaboration refresh.** No WebSockets or SSE. TanStack Query polls workspace-scoped queries every 15 seconds and refetches on window focus. Mutations invalidate the caller’s cache immediately; other users may lag until the next poll — document tells users to refresh if status looks stale.

**Auth and CORS.** Stateless JWT in `Authorization`. Single allowed frontend origin via `CLIENT_ORIGIN`. Passwords hashed with bcrypt; API validates all input with Zod before controllers run.

**Deploy split.** Frontend is a static site on Render; backend is a Node web service. `VITE_API_URL` points the built SPA at the API. SPA rewrite (`/*` → `index.html`) fixes client-side routes on refresh. Free-tier services may sleep; first request after idle can be slow.

**Mobile.** Bottom tab bar and 44px touch targets on phones; kanban uses status select instead of drag-and-drop on small screens.

## Layout

- `backend/` — Express MVC (`src/models`, `src/controllers`, `src/routes`)
- `frontend/` — Vite React app, feature folders under `src/features`
