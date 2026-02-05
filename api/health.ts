
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const start = Date.now();
        // Simple query to test connection
        await query('SELECT 1');
        const duration = Date.now() - start;

        // Check table existence to ensure schema is ready
        const tableCheck = await query("SELECT to_regclass('public.products')");
        const hasSchema = tableCheck.rows[0].to_regclass !== null;

        res.status(200).json({ 
            status: 'healthy', 
            latency: duration,
            schemaReady: hasSchema,
            database: 'Supabase PostgreSQL'
        });
    } catch (error) {
        console.error('Health Check Failed:', error);
        res.status(500).json({ 
            status: 'unhealthy', 
            error: error instanceof Error ? error.message : 'Database unreachable' 
        });
    }
}
