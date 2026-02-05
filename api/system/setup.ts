
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { query } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // In a real prod environment, you would secure this with a token.
        // Since this is a setup script for an authenticated admin dashboard (or initial setup),
        // we can optionally check the admin password from the header if provided, 
        // or rely on the fact that it's an idempotent operation (safe to run multiple times).
        
        const schemaPath = path.join(path.resolve(), 'database_schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            return res.status(500).json({ message: 'Schema file (database_schema.sql) not found on server.' });
        }

        const sql = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon to vaguely simulate separate statements if needed, 
        // but pg driver often handles the whole block.
        await query(sql);

        // Seed Settings if needed
        try {
            const checkSettings = await query("SELECT * FROM settings WHERE key = 'api_providers'");
            if (checkSettings.rowCount === 0) {
                const defaultProviders = [
                    { provider_name: 'gemini', api_key_env_var_name: 'API_KEY', is_active: true, priority: 1 }
                ];
                await query("INSERT INTO settings (key, value) VALUES ('api_providers', $1)", [JSON.stringify(defaultProviders)]);
                await query("INSERT INTO settings (key, value) VALUES ('persona', $1)", [JSON.stringify('friendly_and_helpful')]);
            }
        } catch (e) {
            // Ignore seeding errors if table didn't exist previously (it should now)
        }

        return res.status(200).json({ message: 'Database initialized successfully!' });

    } catch (error) {
        console.error('Setup Error:', error);
        return res.status(500).json({ 
            message: 'Failed to initialize database.', 
            error: error instanceof Error ? error.message : String(error) 
        });
    }
}
