
import { z } from 'zod';
import { createApiHandler } from '../_lib/apiHandler';
import { taskService } from '../_lib/taskService';
import { runSeoStrategyGeneration } from '../_lib/agentOrchestrator';

const SeoStrategySchema = z.object({
    targetKeyword: z.string().min(1, "Keyword is required"),
});

export default createApiHandler({
    POST: {
        schema: SeoStrategySchema,
        handler: async (req, res, body) => {
            const { targetKeyword } = body;
            const taskId = `task_seo_strat_${Date.now()}`;
            
            await taskService.create(taskId, -1, 'SeoStrategistAgent');

            // Run in background
            runSeoStrategyGeneration(taskId, targetKeyword);

            res.status(202).json({ task_id: taskId });
        }
    }
});
