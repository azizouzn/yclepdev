
import { createApiHandler } from '../_lib/apiHandler';
import * as dataService from '../_lib/dataService';
import { taskService } from '../_lib/taskService';
import * as aiOrchestrator from '../_lib/aiOrchestratorService';
import { ContentStatus, TaskError } from '../../types';

const runAgent = async (taskId: string) => {
    const startTime = Date.now();
    try {
        const staleProducts = [];
        const productsToCheck = (await dataService.getAllProducts()).filter(p => p.status === ContentStatus.PUBLISHED);

        for (const product of productsToCheck) {
            const { isStale, reason } = await aiOrchestrator.execute<{ isStale: boolean; reason: string }>('runMarketSentinelAgent', product);
            if (isStale) {
                await dataService.updateProduct(product.id, {
                    status: ContentStatus.STALE,
                    staleReason: reason,
                });
                staleProducts.push({ id: product.id, reason });
            }
        }
        
        const latencyMs = Date.now() - startTime;
        await taskService.succeed(taskId, {
            type: 'market_sentinel_result',
            payload: staleProducts
        }, { latencyMs });
    } catch (error) {
        const taskError: TaskError = {
            code: 'MARKET_SENTINEL_FAILED',
            message: error instanceof Error ? error.message : 'Market Sentinel agent failed.',
            phase: 'collection',
        };
        await taskService.fail(taskId, taskError, { latencyMs: Date.now() - startTime });
    }
};

export default createApiHandler({
    POST: {
        handler: async (req, res) => {
            const taskId = `task_sntl_${Date.now()}`;
            await taskService.create(taskId, -1, 'MarketSentinelAgent');

            runAgent(taskId);

            res.status(202).json({ task_id: taskId });
        }
    }
});
