import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { checkAuth } from './auth';
import * as dataService from './dataService';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RouteConfig<T> {
    schema?: z.ZodType<T>;
    isPublic?: boolean;
    handler: (req: VercelRequest, res: VercelResponse, validatedBody: T) => Promise<unknown> | unknown;
    rateLimit?: {
        limit: number;
        windowMs: number;
    };
}

/**
 * Factory function to create robust, secure, and standardized API endpoints.
 * Handles: Auth, CORS methods, Rate Limiting, Zod Validation, and centralized Error Handling.
 */
export function createApiHandler(routes: Partial<Record<HttpMethod, RouteConfig<unknown>>>) {
    return async (req: VercelRequest, res: VercelResponse) => {
        const method = req.method as HttpMethod;
        const route = routes[method];

        // 1. Method Validation
        if (!route) {
            res.setHeader('Allow', Object.keys(routes));
            return res.status(405).json({ 
                error: 'Method Not Allowed',
                message: `Method ${method} is not supported for this endpoint.` 
            });
        }

        try {
            // 2. Authentication Guardrail
            if (!route.isPublic) {
                const isAuthenticated = checkAuth(req, res);
                if (!isAuthenticated) return; // checkAuth handles the 401 response
            }

            // 3. Availability Guardrail (Rate Limiting)
            if (route.rateLimit) {
                const clientIp = (req.headers['x-forwarded-for'] as string) || 'unknown';
                const isAllowed = await dataService.checkRateLimit(clientIp, route.rateLimit.limit, route.rateLimit.windowMs);
                if (!isAllowed) {
                    await dataService.createSystemEvent('SECURITY_ALERT', `Rate limit exceeded for ${req.url}`, { ip: clientIp });
                    res.setHeader('X-Guardrail-Type', 'RATE_LIMIT');
                    res.setHeader('Retry-After', String(Math.ceil(route.rateLimit.windowMs / 1000)));
                    return res.status(429).json({ message: 'Too many requests. Please wait before retrying.' });
                }
            }

            // 4. Integrity Guardrail (Schema Validation)
            let validatedBody = req.body;
            if (route.schema) {
                const result = route.schema.safeParse(req.body);
                if (!result.success) {
                    return res.status(400).json({ 
                        message: 'Validation Error', 
                        errors: result.error.flatten().fieldErrors 
                    });
                }
                validatedBody = result.data;
            }

            // 5. Execution
            await route.handler(req, res, validatedBody);

        } catch (error) {
            console.error(`[API Error] ${req.method} ${req.url}:`, error);
            const message = error instanceof Error ? error.message : 'An unexpected internal server error occurred.';
            
            // Standardized Error Response
            if (!res.headersSent) {
                res.status(500).json({ message });
            }
        }
    };
}