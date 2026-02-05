
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Checks for a valid admin password in the Authorization header.
 * Responds with 401 and returns false if authentication fails.
 * @param req The VercelRequest object.
 * @param res The VercelResponse object.
 * @returns `true` if authenticated, `false` otherwise.
 */
export function checkAuth(req: VercelRequest, res: VercelResponse): boolean {
    const adminPassword = process.env.ADMIN_PASSWORD;

    // If no password is set in the environment, deny access for security.
    if (!adminPassword) {
        console.error('CRITICAL: ADMIN_PASSWORD environment variable is not set.');
        res.status(401).json({ message: 'Authentication is not configured.' });
        return false;
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authorization header missing or malformed.' });
        return false;
    }

    const providedPassword = authHeader.split(' ')[1];
    if (providedPassword !== adminPassword) {
        res.status(401).json({ message: 'Invalid credentials.' });
        return false;
    }

    return true;
}
