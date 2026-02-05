import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataService from '../_lib/dataService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
        
        const providers = await dataService.getApiProviders();
        
        const providersWithStatus = providers.map(provider => ({
            ...provider,
            isConfigured: !!process.env[provider.api_key_env_var_name]
        }));

        res.status(200).json(providersWithStatus);

    } catch (error) {
        console.error(`Error in /api/settings/status:`, error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
    }
}
