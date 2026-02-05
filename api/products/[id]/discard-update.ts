import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataService from '../../_lib/dataService';
import { ContentStatus } from '../../../types';
import { checkAuth } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    if (!checkAuth(req, res)) return;

    try {
        const { id } = req.query;
        const productId = parseInt(id as string, 10);

        const updatedProduct = await dataService.updateProduct(productId, {
            status: ContentStatus.PUBLISHED, // Revert to published
            staleReason: undefined,
            diffReport: undefined, 
            newAnalysis: undefined,
        });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error(`Error in /api/products/${req.query.id}/discard-update:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
