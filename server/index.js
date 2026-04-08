import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS — allow localhost in dev and the Vercel frontend in production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.CLIENT_URL, // e.g. https://your-app.vercel.app
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (curl, Postman, same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health-check (Render pings this to confirm the service is up)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Database initialization
let db;
(async () => {
    db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS seats (
            id INTEGER PRIMARY KEY,
            status TEXT DEFAULT 'available'
        )
    `);

    // Initialize 20 seats if table is empty
    const count = await db.get('SELECT COUNT(*) as count FROM seats');
    if (count.count === 0) {
        for (let i = 1; i <= 20; i++) {
            await db.run('INSERT INTO seats (id) VALUES (?)', [i]);
        }
    }
    console.log('✅ Database initialized with 20 seats.');
})();

// ── API Endpoints ──────────────────────────────────────────────

// GET all seats
app.get('/api/seats', async (req, res) => {
    try {
        const seats = await db.all('SELECT * FROM seats ORDER BY id');
        res.json(seats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/book  — body: { seatIds: number[] }
app.post('/api/book', async (req, res) => {
    const { seatIds } = req.body;
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({ error: 'seatIds must be a non-empty array' });
    }

    try {
        const placeholders = seatIds.map(() => '?').join(',');
        const available = await db.all(
            `SELECT * FROM seats WHERE id IN (${placeholders}) AND status = 'available'`,
            seatIds
        );

        if (available.length !== seatIds.length) {
            return res.status(400).json({ error: 'Some seats are already booked or invalid' });
        }

        await db.run(
            `UPDATE seats SET status = 'booked' WHERE id IN (${placeholders})`,
            seatIds
        );
        res.json({ message: 'Seats booked successfully', bookedSeats: seatIds });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/cancel  — body: { seatIds: number[] }
app.post('/api/cancel', async (req, res) => {
    const { seatIds } = req.body;
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({ error: 'seatIds must be a non-empty array' });
    }

    try {
        const placeholders = seatIds.map(() => '?').join(',');
        await db.run(
            `UPDATE seats SET status = 'available' WHERE id IN (${placeholders})`,
            seatIds
        );
        res.json({ message: 'Booking cancelled successfully', cancelledSeats: seatIds });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

