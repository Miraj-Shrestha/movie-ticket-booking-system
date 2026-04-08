import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS — open to all origins (suitable for a demo/portfolio app)
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health-check (Render pings this to confirm the service is up)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Database initialization (node:sqlite — built into Node 22+, no install needed) ──
const db = new DatabaseSync(path.join(__dirname, 'database.sqlite'));

db.exec(`
    CREATE TABLE IF NOT EXISTS seats (
        id     INTEGER PRIMARY KEY,
        status TEXT DEFAULT 'available'
    )
`);

// Initialize 20 seats if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM seats').get();
if (count.count === 0) {
    const insert = db.prepare('INSERT INTO seats (id) VALUES (?)');
    for (let i = 1; i <= 20; i++) insert.run(i);
}
console.log('✅ Database initialized with 20 seats.');

// ── API Endpoints ──────────────────────────────────────────────

// GET all seats
app.get('/api/seats', (req, res) => {
    try {
        const seats = db.prepare('SELECT * FROM seats ORDER BY id').all();
        res.json(seats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/book  — body: { seatIds: number[] }
app.post('/api/book', (req, res) => {
    const { seatIds } = req.body;
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({ error: 'seatIds must be a non-empty array' });
    }

    try {
        const placeholders = seatIds.map(() => '?').join(',');
        const available = db
            .prepare(`SELECT * FROM seats WHERE id IN (${placeholders}) AND status = 'available'`)
            .all(...seatIds);

        if (available.length !== seatIds.length) {
            return res.status(400).json({ error: 'Some seats are already booked or invalid' });
        }

        db.prepare(`UPDATE seats SET status = 'booked' WHERE id IN (${placeholders})`).run(...seatIds);
        res.json({ message: 'Seats booked successfully', bookedSeats: seatIds });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/cancel  — body: { seatIds: number[] }
app.post('/api/cancel', (req, res) => {
    const { seatIds } = req.body;
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({ error: 'seatIds must be a non-empty array' });
    }

    try {
        const placeholders = seatIds.map(() => '?').join(',');
        db.prepare(`UPDATE seats SET status = 'available' WHERE id IN (${placeholders})`).run(...seatIds);
        res.json({ message: 'Booking cancelled successfully', cancelledSeats: seatIds });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
