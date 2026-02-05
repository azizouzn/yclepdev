import { z } from 'zod';
import { createApiHandler } from '../_lib/apiHandler';
import * as dataService from '../_lib/dataService';

const UpdateGuideSchema = z.object({
    title: z.string().optional(),
    html_content: z.string().optional(),
    embedded_product_ids: z.array(z.number()).optional(),
    status: z.any().optional(),
});

export default createApiHandler({
    PUT: {
        schema: UpdateGuideSchema,
        handler: async (req, res, body) => {
            const guideId = parseInt(req.query.id as string, 10);
            if (isNaN(guideId)) return res.status(400).json({ message: 'Invalid ID' });

            const updatedGuide = await dataService.updateGuide(guideId, body);
            if (updatedGuide) {
                return res.status(200).json(updatedGuide);
            }
            return res.status(404).json({ message: 'Guide not found' });
        }
    },
    DELETE: {
        handler: async (req, res) => {
            const guideId = parseInt(req.query.id as string, 10);
            if (isNaN(guideId)) return res.status(400).json({ message: 'Invalid ID' });

            const success = await dataService.deleteContentById(guideId);
            if (success) {
                return res.status(204).end();
            }
            return res.status(404).json({ message: 'Guide not found' });
        }
    }
});