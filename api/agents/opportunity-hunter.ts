
import { createApiHandler } from '../_lib/apiHandler';
import { taskService } from '../_lib/taskService';
import * as aiOrchestrator from '../_lib/aiOrchestratorService';
import { Opportunity, TaskError } from '../../types';

const runAgent = async (taskId: string) => {
    const startTime = Date.now();
    try {
        const opportunities = await aiOrchestrator.execute<Opportunity[]>('runOpportunityHunterAgent');
        const latencyMs = Date.now() - startTime;
        await taskService.succeed(taskId, {
            type: 'opportunity_hunter_result',
            payload: opportunities
        }, { latencyMs });
    } catch (error) {
        const taskError: TaskError = {
            code: 'OPPORTUNITY_HUNTER_FAILED',
            message: error instanceof Error ? error.message : 'Opportunity Hunter agent failed.',
            phase: 'collection',
        };
        await taskService.fail(taskId, taskError, { latencyMs: Date.now() - startTime });
    }
};

export default createApiHandler({
    POST: {
        handler: async (req, res) => {
            const taskId = `task_opp_${Date.now()}`;
            await taskService.create(taskId, -1, 'OpportunityHunterAgent');

            // Run in background
            runAgent(taskId);

            res.status(202).json({ task_id: taskId });
        }
    }
});
