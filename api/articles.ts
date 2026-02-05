
import { z } from 'zod';
import { createApiHandler } from './_lib/apiHandler';
import * as dataService from './_lib/dataService';
import { taskService } from './_lib/taskService';
import { startArticleGeneration } from './_lib/agentOrchestrator';

const CreateArticleSchema = z.object({
    topic: z.string().min(5, "Topic must be at least 5 characters").max(300, "Topic too long"),
});

export default createApiHandler({
    GET: {
        isPublic: true,
        handler: async (req, res) => {
            const articles = await dataService.getAllArticles();
            res.status(200).json(articles);
        }
    },
    POST: {
        schema: CreateArticleSchema,
        rateLimit: { limit: 5, windowMs: 60 * 1000 },
        handler: async (req, res, body) => {
            const { topic } = body;
            
            const newArticle = await dataService.createArticle(topic);
            const taskId = `task_art_${newArticle.id}`;
            
            await taskService.create(taskId, newArticle.id, 'ArticleGeneratorOrchestrator');
            
            // Trigger Agent Workflow
            startArticleGeneration(taskId, newArticle.id, topic);

            res.status(202).json({ task_id: taskId, content_id: newArticle.id });
        }
    }
});
