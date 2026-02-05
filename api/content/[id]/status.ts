
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataService from '../../_lib/dataService';
import { ContentStatus } from '../../../types';
import { checkAuth } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== 'PUT') {
            res.setHeader('Allow', ['PUT']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
        if (!checkAuth(req, res)) return;

        const { id } = req.query;
        const { status } = req.body;
        const contentId = parseInt(id as string, 10);

        if (!Object.values(ContentStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const updatedContent = await dataService.updateContentStatus(contentId, status);

        if (updatedContent) {
            return res.status(200).json(updatedContent);
        }

        return res.status(404).json({ message: 'Content not found' });
    } catch (error) {
        console.error(`Error in /api/content/${req.query.id}/status:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
