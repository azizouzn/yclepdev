import type { VercelRequest, VercelResponse } from '@vercel/node';
import { taskService } from '../_lib/taskService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // PRODUCTION NOTE: You might want to secure this endpoint or use signed URLs
        // if task data could be sensitive.
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        const { id } = req.query;
        const taskId = id as string;

        const task = await taskService.get(taskId);

        if (!task) {
            // It's possible the request comes in before the task is fully created in a distributed system.
            // Returning a 404 might cause the client to stop polling prematurely.
            // A 200 with a specific status is more robust for polling clients.
            return res.status(200).json({ status: 'queued', message: 'Task not found, it may be initializing.' });
        }
        
        res.status(200).json(task);
    } catch (error) {
        console.error(`Error in /api/tasks/${req.query.id}:`, error);
        res.status(500).json({ status: 'failed', message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
