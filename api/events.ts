
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataService from './_lib/dataService';
import { checkAuth } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (!checkAuth(req, res)) return;
        
        if (req.method === 'GET') {
            const events = await dataService.getEvents();
            return res.status(200).json(events);
        }
        
        if (req.method === 'POST') {
            // This is used to mark all events as read
            const events = await dataService.markEventsAsRead();
            return res.status(200).json(events);
        }

        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error(`Error in /api/events:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
