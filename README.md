# 🎬 CineBook — Movie Ticket Booking System

A full-stack movie ticket booking web application built with **React + Vite** on the frontend and **Node.js + Express + SQLite** on the backend. Users can browse movie shows, select seats, book tickets, and cancel bookings — all in real time.

---

## ✨ Features

- 🎭 **Browse Shows** — Choose from 4 movies with different showtimes
- 🪑 **Interactive Seat Map** — Visual 20-seat grid showing available, selected, and booked seats
- 🎟️ **Book Tickets** — Select multiple seats and confirm booking in one click
- ❌ **Cancel Bookings** — Cancel any booking to free up seats instantly
- 💰 **Price Summary** — Live price calculation (₹350 per seat)
- 🔔 **Toast Notifications** — Success/error feedback for every action
- 🔄 **Real-time Updates** — Seat map refreshes after every booking or cancellation

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite 7 | Build tool & dev server |
| Vanilla CSS | Custom styling |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js (≥18) | Runtime |
| Express 5 | HTTP server & REST API |
| SQLite (via `sqlite` + `sqlite3`) | Persistent seat data |
| CORS | Cross-origin request handling |

---

## 📁 Project Structure

```
movie-ticket-booking-system/
│
├── src/                        # React frontend
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Component styles
│   ├── index.css               # Global styles & CSS variables
│   └── main.jsx                # React entry point
│
├── server/                     # Express backend
│   ├── index.js                # API server & SQLite logic
│   ├── database.sqlite         # Auto-generated SQLite database
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Backend env variable template
│
├── public/                     # Static assets
├── index.html                  # HTML entry point (Vite)
├── vite.config.js              # Vite config + dev proxy
├── vercel.json                 # Vercel SPA routing config
├── render.yaml                 # Render deployment config
├── .env.example                # Frontend env variable template
├── .gitignore
└── package.json                # Frontend dependencies
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js **v18 or higher**
- npm

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/movie-ticket-booking-system.git
cd movie-ticket-booking-system
```

### 2. Install dependencies

```bash
# Frontend (root)
npm install

# Backend
cd server
npm install
cd ..
```

### 3. Set up environment variables

**Frontend** — copy `.env.example` to `.env.local`:
```bash
copy .env.example .env.local
```
Leave `VITE_API_URL` blank in development. The Vite dev server proxies `/api` → `localhost:5000` automatically.

**Backend** — copy `server/.env.example` to `server/.env`:
```bash
copy server\.env.example server\.env
```

Default backend `.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 4. Start the backend

```bash
cd server
npm run dev
```

You should see:
```
✅ Database initialized with 20 seats.
🚀 Server running on port 5000
```

### 5. Start the frontend

Open a new terminal:
```bash
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🔌 API Reference

Base URL (local): `http://localhost:5000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns `{ status: "ok" }` |
| `GET` | `/api/seats` | Returns all 20 seats with their status |
| `POST` | `/api/book` | Books one or more seats |
| `POST` | `/api/cancel` | Cancels one or more booked seats |

### `POST /api/book`
**Request body:**
```json
{ "seatIds": [1, 3, 7] }
```
**Response:**
```json
{ "message": "Seats booked successfully", "bookedSeats": [1, 3, 7] }
```

### `POST /api/cancel`
**Request body:**
```json
{ "seatIds": [1, 3, 7] }
```
**Response:**
```json
{ "message": "Booking cancelled successfully", "cancelledSeats": [1, 3, 7] }
```

---

## 🗄️ Database

The app uses **SQLite** with a single `seats` table:

```sql
CREATE TABLE seats (
  id     INTEGER PRIMARY KEY,   -- Seat number (1–20)
  status TEXT DEFAULT 'available'  -- 'available' | 'booked'
);
```

The database file (`server/database.sqlite`) is auto-created on first run and pre-populated with 20 seats. It is excluded from Git via `.gitignore`.

---

## 🎞️ Available Shows

| # | Movie | Time | Genre | Duration | Rating |
|---|---|---|---|---|---|
| 1 | 🎬 Interstellar | 10:00 AM | Sci-Fi | 2h 49m | ⭐ 8.6 |
| 2 | 🔥 Dune: Part Two | 1:30 PM | Adventure | 2h 46m | ⭐ 8.5 |
| 3 | 🕷️ Venom 3 | 4:00 PM | Action | 1h 49m | ⭐ 7.0 |
| 4 | 🌙 Oppenheimer | 7:30 PM | Drama | 3h | ⭐ 8.9 |

> Note: All shows share the same pool of 20 seats (seat state is global across shows).

---

## 🌍 Deployment

### Frontend → Vercel
- Framework: **Vite**
- Root Directory: `/` (repo root)
- Build Command: `npm run build`
- Output Directory: `dist`
- Env Variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend → Render
- Runtime: **Node**
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Env Variables: `NODE_ENV=production`, `CLIENT_URL=https://your-app.vercel.app`

> ⚠️ SQLite data is **reset on every restart** on Render's free tier (ephemeral filesystem). For persistent data, migrate to PostgreSQL or another hosted database.

---

## 📦 Scripts

### Frontend (root)
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at localhost:5173 |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

### Backend (`server/`)
| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (auto-restart) |
| `npm start` | Start server with node (production) |

---

## 📄 License

ISC
