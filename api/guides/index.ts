import { z } from 'zod';
import { createApiHandler } from '../_lib/apiHandler';
import * as dataService from '../_lib/dataService';

const CreateGuideSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    html_content: z.string().min(1, "Content is required"),
    embedded_product_ids: z.array(z.number()).optional().default([]),
});

export default createApiHandler({
    GET: {
        isPublic: true,
        handler: async (req, res) => {
            const guides = await dataService.getAllGuides();
            res.status(200).json(guides);
        }
    },
    POST: {
        schema: CreateGuideSchema,
        rateLimit: { limit: 10, windowMs: 60 * 1000 },
        handler: async (req, res, body) => {
            const { title, html_content, embedded_product_ids } = body;
            
            // Buffer overflow protection logic is handled by Zod max() but kept logic for event logging if needed in dataService
            if (title.length > 200) {
                 const clientIp = (req.headers['x-forwarded-for'] as string) || 'unknown';
                 await dataService.createSystemEvent('SECURITY_ALERT', 'Guide Title Buffer Check', { ip: clientIp });
            }

            const newGuide = await dataService.createGuide(title, html_content, embedded_product_ids);
            res.status(201).json(newGuide);
        }
    }
});