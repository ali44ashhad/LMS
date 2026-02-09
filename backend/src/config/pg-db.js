import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'mydb',
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: process.env.SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Get schema from environment (nesta for production, nestalocal for development)
export const DB_SCHEMA = process.env.DB_SCHEMA || 'nesta';

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;
