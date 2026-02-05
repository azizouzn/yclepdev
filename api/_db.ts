
import pg from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Load from config.env
dotenv.config({ path: 'config.env' });

// Handle potential ESM/CommonJS interop issues with 'pg'
const { Pool } = pg;

// Check if we are connecting to Supabase to enforce SSL
const isSupabase = process.env.DATABASE_URL?.includes('supabase');

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL environment variable is not set in config.env. The backend will fail to connect to the database.');
}

// Production Database Connection
// Uses connection pooling for efficiency
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL connection. We set rejectUnauthorized to false to allow self-signed certs if needed,
  // but mostly to ensure the connection is encrypted as required by Supabase.
  ssl: isSupabase || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Max clients in the pool
  idleTimeoutMillis: 30000
});

export const query = async (text: string, params?: unknown[]): Promise<pg.QueryResult<any>> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params as any[]);
    const duration = Date.now() - start;
    logger.debug('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database Query Error:', error);
    throw error;
  }
};

// Helper to get a client for transactions
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};
