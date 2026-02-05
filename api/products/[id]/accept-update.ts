
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

        const product = await dataService.findProductById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        
        // The new analysis is passed in the body from the client state
        const { newAnalysis } = req.body;
        if (!newAnalysis) {
            return res.status(400).json({ message: 'New analysis data is required.' });
        }

        const updatedProduct = await dataService.updateProduct(productId, {
            analysisResult: newAnalysis,
            score: newAnalysis.product_analysis.overall_score,
            status: ContentStatus.COMPLETED,
            staleReason: undefined, // Clear stale reason
            // The client will clear these optimistically, but we clear them on the server too
            diffReport: undefined, 
            newAnalysis: undefined,
        });

        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error(`Error in /api/products/${req.query.id}/accept-update:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
