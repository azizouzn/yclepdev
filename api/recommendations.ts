
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as aiOrchestrator from './_lib/aiOrchestratorService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { categories, products } = req.body;
        if (!categories || !Array.isArray(categories) || !products || !Array.isArray(products)) {
            return res.status(400).json({ message: 'Preferred categories and products are required.' });
        }

        const recommendation = await aiOrchestrator.execute<{ text: string; productIds: number[] }>('runPersonalizationAgent', categories, products);
        
        res.status(200).json(recommendation);

    } catch (error) {
        console.error(`Error in /api/recommendations:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
