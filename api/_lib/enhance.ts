

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataService from './_lib/dataService';
import { taskService } from './_lib/taskService';
import * as aiOrchestrator from './_lib/aiOrchestratorService';
import type { TaskError } from '../types';
import { checkAuth } from './_lib/auth';

const runAgent = async (taskId: string, articleId: number, feedback: string) => {
    const startTime = Date.now();
    try {
        const article = await dataService.findArticleById(articleId);
        if (!article || !article.analysisResult?.html_content) {
            throw new Error('Article or its HTML content not found.');
        }

        const newHtml = await aiOrchestrator.execute<string>('runContentEnhancementAgent', article.analysisResult.html_content, feedback);
        
        article.analysisResult.html_content = newHtml;
        await dataService.updateArticle(articleId, { analysisResult: article.analysisResult });

        const latencyMs = Date.now() - startTime;
        await taskService.succeed(taskId, {
            type: 'enhancement_result',
            payload: { content_id: articleId, content_type: 'article', analysisResult: article.analysisResult }
        }, { latencyMs });
    } catch (error) {
        const taskError: TaskError = {
            code: 'ENHANCEMENT_AGENT_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error during content enhancement.',
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
        const { feedback } = req.body;
        const articleId = parseInt(id as string, 10);

        if (!feedback) {
            return res.status(400).json({ message: 'Feedback is required.' });
        }

        const taskId = `task_enh_art_${articleId}_${Date.now()}`;
        await taskService.create(taskId, articleId, 'ContentEnhancementAgent');

        runAgent(taskId, articleId, feedback);

        res.status(202).json({ task_id: taskId });
    } catch (error) {
        console.error(`Error in /api/articles/${req.query.id}/enhance:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
