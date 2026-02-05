

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataService from '../../_lib/dataService';
import { taskService } from '../../_lib/taskService';
import * as aiOrchestrator from '../../_lib/aiOrchestratorService';
import { AbTest, PerformanceMetrics, TaskError } from '../../../types';
import { checkAuth } from '../../_lib/auth';

const runAgent = async (taskId: string, productId: number, metrics: PerformanceMetrics) => {
    const startTime = Date.now();
    try {
        const product = await dataService.findProductById(productId);
        if (!product) {
            throw new Error('Product not found.');
        }

        const abTest = await aiOrchestrator.execute<AbTest>('runAbTestAgent', product, metrics);
        
        const latencyMs = Date.now() - startTime;
        await taskService.succeed(taskId, {
            type: 'ab_test_result',
            payload: abTest
        }, { latencyMs });
    } catch (error) {
        const taskError: TaskError = {
            code: 'AB_TEST_AGENT_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error during A/B test generation.',
            phase: 'processing',
        };
        await taskService.fail(taskId, taskError, { latencyMs: Date.now() - startTime });
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
        if (!checkAuth(req, res)) return;

        const { id } = req.query;
        const { metrics } = req.body;
        const productId = parseInt(id as string, 10);
        
        if(!metrics) {
            return res.status(400).json({ message: 'Performance metrics are required.' });
        }

        const taskId = `task_ab_${productId}_${Date.now()}`;
        await taskService.create(taskId, productId, 'AbTestAgent');

        runAgent(taskId, productId, metrics);

        res.status(202).json({ task_id: taskId });
    } catch (error) {
        console.error(`Error in /api/products/${req.query.id}/ab-test:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
