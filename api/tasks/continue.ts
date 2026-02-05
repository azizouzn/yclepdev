
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as agentOrchestrator from '../_lib/agentOrchestrator';
import { taskService } from '../_lib/taskService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    try {
        const { taskId } = req.body;
        if (!taskId) {
            return res.status(400).json({ message: 'taskId is required.' });
        }

        const task = await taskService.get(taskId);
        if (!task) {
            console.warn(`[${taskId}] Continue trigger received for a non-existent task.`);
            return res.status(202).json({ message: 'Task not found, may be processing.' });
        }
        
        // Respond immediately to not hold up the calling function (fire-and-forget)
        res.status(202).json({ message: 'Task continuation triggered.' });

        // Execute the correct continuation logic based on the agent orchestrator
        if (task.agent === 'MastermindOrchestrator') {
            await agentOrchestrator.continueFullAnalysis(taskId);
        } else if (task.agent === 'ArticleGeneratorOrchestrator') {
            await agentOrchestrator.continueArticleGeneration(taskId);
        } else {
            console.warn(`[${taskId}] No continuation logic for agent: ${task.agent}`);
        }

    } catch (error) {
        // This is out-of-band, so we can't respond to the original request.
        // Log the error for monitoring.
        console.error(`Error in /api/tasks/continue:`, error);
    }
}
