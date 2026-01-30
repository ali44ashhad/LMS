import './config/env.js'; // MUST be first
import app from './app.js';
import pool from './config/pg-db.js';

// Test PostgreSQL connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ PostgreSQL connection error:', err);
    } else {
        console.log('✅ PostgreSQL connected:', res.rows[0].now);
    }
});

// Only start server if not in Vercel environment
const PORT = process.env.PORT || 5006;

// Check if we're running in Vercel (Vercel sets VERCEL env variable)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}
