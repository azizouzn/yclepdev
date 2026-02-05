
import { z } from 'zod';
import { createApiHandler } from './_lib/apiHandler';
import * as dataService from './_lib/dataService';
import { taskService } from './_lib/taskService';
import { startFullAnalysis } from './_lib/agentOrchestrator';

// Robust Schema
const CreateProductSchema = z.object({
    name: z.string().min(1, "Product name is required").max(200, "Name too long"),
    url: z.string().url("Must be a valid URL").refine(url => !url.includes('localhost'), "Localhost URLs are not allowed in production analysis"),
});

export default createApiHandler({
    GET: {
        isPublic: true,
        handler: async (req, res) => {
            const products = await dataService.getAllProducts();
            res.status(200).json(products);
        }
    },
    POST: {
        schema: CreateProductSchema,
        rateLimit: { limit: 10, windowMs: 60 * 1000 }, // Higher limit for demo purposes
        handler: async (req, res, body) => {
            const { name, url } = body;
            
            // Database creation
            const newProduct = await dataService.createProduct(name, url);
            
            // Task Orchestration
            const taskId = `task_prod_${newProduct.id}`;
            await taskService.create(taskId, newProduct.id, 'MastermindOrchestrator');
            
            // Trigger Agent Workflow (Fire & Forget)
            startFullAnalysis(taskId, newProduct.id, name, url);
            
            res.status(202).json({ task_id: taskId, content_id: newProduct.id });
        }
    }
});
