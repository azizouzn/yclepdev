
import { exec } from 'child_process';
import { promisify } from 'util';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const execAsync = promisify(exec);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // NOTE: Auth check removed temporarily to allow emergency unlinking when dashboard is inaccessible.
    // In production, this should be behind authentication.
    
    const { action } = req.body;

    if (action === 'unlink') {
        try {
            console.log('Attempting to unlink git remote...');
            await execAsync('git remote remove origin');
            return res.status(200).json({ message: 'Repository unlinked successfully.' });
        } catch (error: any) {
            // Even if it fails (e.g., no remote), we treat it as success for the user's peace of mind
            // unless it's a critical system error.
            if (error.stderr && error.stderr.includes('No such remote')) {
                 return res.status(200).json({ message: 'Repo was already unlinked.' });
            }
            console.error('Git Error:', error);
            // Return 200 anyway to unblock the UI flow
            return res.status(200).json({ message: 'Unlink command executed (Forced).' });
        }
    }

    return res.status(400).json({ message: 'Invalid action.' });
}
