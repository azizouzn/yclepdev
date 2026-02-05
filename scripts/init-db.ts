
import dotenv from 'dotenv';
// Load config.env explicitly
dotenv.config({ path: 'config.env' });

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set in config.env.');
    (process as any).exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();

    console.log('📄 Reading database_schema.sql...');
    // Look for schema in the root directory (one level up from scripts)
    const schemaPath = path.join(__dirname, '../database_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🚀 Executing schema creation...');
    await client.query(schemaSql);

    console.log('✅ Database initialized successfully!');
    
    // Optional: Seed initial settings if they don't exist
    const checkSettings = await client.query("SELECT * FROM settings WHERE key = 'api_providers'");
    if (checkSettings.rowCount === 0) {
        console.log('⚙️  Seeding default settings...');
        const defaultProviders = [
            { provider_name: 'gemini', api_key_env_var_name: 'API_KEY', is_active: true, priority: 1 }
        ];
        await client.query("INSERT INTO settings (key, value) VALUES ('api_providers', $1)", [JSON.stringify(defaultProviders)]);
        await client.query("INSERT INTO settings (key, value) VALUES ('persona', $1)", [JSON.stringify('friendly_and_helpful')]);
    }

  } catch (err) {
    console.error('❌ Error initializing database:', err);
    (process as any).exit(1);
  } finally {
    await client.end();
  }
};

initDb();
