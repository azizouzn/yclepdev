

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataService from '../../_lib/dataService';
import { taskService } from '../../_lib/taskService';
import * as aiOrchestrator from '../../_lib/aiOrchestratorService';
import type { TaskError } from '../../../types';
import { checkAuth } from '../../_lib/auth';

const runAgent = async (taskId: string, productId: number, prompt: string, type: 'featured' | 'banner') => {
    const startTime = Date.now();
    try {
        const base64Image = await aiOrchestrator.execute<string>('runVisualAssetAgent', prompt);
        const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;
        
        const product = await dataService.findProductById(productId);
        if(product) {
            const visualAssets = product.visualAssets || {};
            if (type === 'featured') {
                visualAssets.featuredImage = imageDataUrl;
            } else {
                visualAssets.bannerImage = imageDataUrl;
            }
            await dataService.updateProduct(productId, { visualAssets });
        }

        const latencyMs = Date.now() - startTime;
        await taskService.succeed(taskId, {
            type: 'visual_asset_result',
            payload: { content_id: productId, image_type: type, image_data: imageDataUrl }
        }, { latencyMs });
    } catch (error) {
        const taskError: TaskError = {
            code: 'VISUAL_ASSET_AGENT_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error during visual asset generation.',
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
        const { prompt, type } = req.body;
        const productId = parseInt(id as string, 10);
        
        if(!prompt || !type) {
            return res.status(400).json({ message: 'Prompt and type are required.' });
        }

        const taskId = `task_vis_${productId}_${Date.now()}`;
        await taskService.create(taskId, productId, 'VisualAssetAgent');

        runAgent(taskId, productId, prompt, type);

        res.status(202).json({ task_id: taskId });
    } catch (error) {
        console.error(`Error in /api/products/${req.query.id}/visuals:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
