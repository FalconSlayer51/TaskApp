# Task Tracker

Task list, kanban board, and a small analytics dashboard. You get a personal workspace when you sign up. You can invite people who already have an account and share one board with them.

## Features

- Email/password auth with JWT
- Personal workspace on signup; extra workspaces when someone invites you
- Invite picker (owners): searchable list of existing accounts — they must sign up first
- Task CRUD, assignee, due date, search, filters, sort, pagination
- Kanban board (drag on desktop; status control on phones)
- Dashboard KPIs and charts for the **selected** workspace
- Light / dark / system theme (saved in the browser)
- Named sidebar on desktop; bottom tabs on phones

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

Open `http://localhost:5173`. Guests see a landing page that explains every feature. After you sign in, you land on the dashboard.

## Layout

- `backend/` — Express MVC (`src/models`, `src/controllers`, `src/routes`)
- `frontend/` — Vite React app, feature folders under `src/features`
