# GenZ Media X — Windows Local Setup

**Create. Connect. Grow. Earn.**

A full-stack lifestyle + community + services platform for GenZ creators.

---

## Prerequisites

Install these before starting:

1. **Node.js 18+** — https://nodejs.org (LTS version recommended)
2. **PostgreSQL** — https://www.postgresql.org/download/windows/
   - During install, note the password you set for the `postgres` user
   - Default port: 5432
3. **Git** (optional) — https://git-scm.com

---

## Quick Start (Windows)

### Step 1 — Create the Database

Open **pgAdmin** (installed with PostgreSQL) or open **psql** from the Start menu:

```sql
CREATE DATABASE genzmediax;
```

Or in psql terminal:
```
psql -U postgres
CREATE DATABASE genzmediax;
\q
```

### Step 2 — Configure the Server

```bash
cd server
copy .env.example .env
```

Open `.env` in Notepad and update:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/genzmediax
PORT=3001
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### Step 3 — Install Dependencies

Open **Command Prompt** or **PowerShell** in the project root folder:

```bash
npm run install:all
```

This installs dependencies for root, client, and server automatically.

### Step 4 — Push Database Schema

```bash
cd server
npm run db:push
```

Type `y` when prompted to confirm.

### Step 5 — Seed the Database (Optional but Recommended)

```bash
npm run db:seed
```

This creates an admin account and sample content.

**Admin credentials:** `admin@genzmediax.com` / `admin123`

### Step 6 — Start the App

Go back to the root folder:
```bash
cd ..
npm run dev
```

This starts both the server (port 3001) and client (port 5173) simultaneously.

Open your browser: **http://localhost:5173**

---

## Running Separately

If you prefer to run server and client in separate terminals:

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

---

## VS Code Tips

1. Open the root `genz-media-x` folder in VS Code
2. Install the **Thunder Client** extension to test API endpoints
3. The client auto-proxies `/api` requests to `http://localhost:3001`
4. Server uses `tsx watch` for hot-reload — changes restart automatically

---

## Project Structure

```
genz-media-x/
├── client/           # React + Vite frontend (port 5173)
│   ├── src/
│   │   ├── pages/    # All page components
│   │   ├── components/
│   │   ├── contexts/ # AuthContext
│   │   └── lib/      # api.ts — all API hooks
│   └── public/       # logo.png, favicon
├── server/           # Express 4 backend (port 3001)
│   ├── src/
│   │   ├── routes/   # auth, posts, users, etc.
│   │   ├── db/       # Drizzle ORM + schema
│   │   └── lib/      # auth helpers
│   └── .env          # Your config (not committed)
└── package.json      # Root scripts
```

---

## API Endpoints

All endpoints are prefixed with `/api`:

- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET  /api/auth/me` — Get current user
- `GET  /api/posts` — List posts (with `?category=` and `?search=`)
- `POST /api/posts` — Create post (auth required)
- `GET  /api/categories` — All categories
- `GET  /api/trending` — Trending posts
- `GET  /api/notifications` — Your notifications
- `GET  /api/messages` — Your conversations
- `GET  /api/requirements` — Requirements board
- `GET  /api/admin/stats` — Admin stats (admin only)

---

## Troubleshooting

**"Cannot connect to database"**
- Check PostgreSQL is running (Services in Task Manager)
- Verify DATABASE_URL in `server/.env`
- Make sure the `genzmediax` database exists

**"Port already in use"**
- Change PORT in `server/.env` to another port (e.g. 3002)
- Update `client/vite.config.ts` proxy target to match

**"npm: command not found"**
- Restart your terminal after installing Node.js
- Or add Node.js to your PATH manually

**White screen / API errors**
- Make sure server is running on port 3001
- Check browser console for errors (F12)
- Ensure `npm run db:push` was run successfully
