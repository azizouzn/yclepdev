
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataService from '../../_lib/dataService';
import { taskService } from '../../_lib/taskService';
import { runAutoLinking } from '../../_lib/agentOrchestrator';
import type { TaskError } from '../../../types';
import { checkAuth } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    if (!checkAuth(req, res)) return;

    try {
        const { id } = req.query;
        const { contentType } = req.body;
        const contentId = parseInt(id as string, 10);

        if (!contentType || !['article', 'guide'].includes(contentType)) {
            return res.status(400).json({ message: 'A valid contentType ("article" or "guide") is required.' });
        }

        const taskId = `task_autolink_${contentType}_${contentId}_${Date.now()}`;
        await taskService.create(taskId, contentId, 'InternalLinkingAgent');

        // Run in background
        runAutoLinking(taskId, contentId, contentType as 'article' | 'guide');

        res.status(202).json({ task_id: taskId });

    } catch (error) {
        console.error(`Error in /api/content/${req.query.id}/autolink:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
