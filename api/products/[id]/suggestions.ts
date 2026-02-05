

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataService from '../../_lib/dataService';
import { taskService } from '../../_lib/taskService';
import * as aiOrchestrator from '../../_lib/aiOrchestratorService';
import type { TaskError } from '../../../types';
import { checkAuth } from '../../_lib/auth';

const runAgent = async (taskId: string, productId: number) => {
    const startTime = Date.now();
    try {
        const product = await dataService.findProductById(productId);
        if (!product || !product.analysisResult?.final_output.html_content) {
            throw new Error('Product or its HTML content not found.');
        }

        const suggestions = await aiOrchestrator.execute<string[]>('runImprovementAgent', product.analysisResult.final_output.html_content);
        
        const latencyMs = Date.now() - startTime;
        await taskService.succeed(taskId, {
            type: 'suggestion_result',
            payload: { content_id: productId, content_type: 'product', suggestions }
        }, { latencyMs });
    } catch (error) {
        const taskError: TaskError = {
            code: 'SUGGESTION_AGENT_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error during suggestion generation.',
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
        const productId = parseInt(id as string, 10);

        const taskId = `task_sug_prod_${productId}_${Date.now()}`;
        await taskService.create(taskId, productId, 'ImprovementAgent');

        runAgent(taskId, productId);

        res.status(202).json({ task_id: taskId });
    } catch (error) {
        console.error(`Error in /api/products/${req.query.id}/suggestions:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
