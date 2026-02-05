
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { taskService } from '../../_lib/taskService';
import { runRefreshAnalysis } from '../../_lib/agentOrchestrator';
import { checkAuth } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    if (!checkAuth(req, res)) return;

    try {
        const { id } = req.query;
        const productId = parseInt(id as string, 10);

        const taskId = `task_refresh_${productId}_${Date.now()}`;
        await taskService.create(taskId, productId, 'RefreshOrchestrator');

        // Run in background
        runRefreshAnalysis(taskId, productId);

        res.status(202).json({ task_id: taskId });

    } catch (error) {
        console.error(`Error in /api/products/${req.query.id}/refresh:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
