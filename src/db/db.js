import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Helpful startup validation (won't log the full URL)
const url = process.env.DATABASE_URL || '';
if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a postgres connection string (postgresql://...)');
}

export const db = drizzle(pool);

