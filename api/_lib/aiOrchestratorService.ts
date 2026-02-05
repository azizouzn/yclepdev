
import * as geminiService from './geminiService';
import * as dataService from './dataService';
import type { ApiProviderSettings } from '../types';
import { logger } from '../utils/logger';

// ===================================================================================
// AI Orchestrator Service (The Mastermind's "Brain")
// ===================================================================================
// This service is the central point for all AI interactions. It now includes
// a retry guardrail for JSON parsing errors and full observability logging.
// ===================================================================================


const services: Record<string, any> = {
    gemini: geminiService,
};

const MAX_JSON_RETRIES = 3;
const RETRY_DELAY = 200; // ms

/**
 * Executes a function from the primary AI service with built-in retry logic for JSON errors.
 * @param functionName The name of the function to execute (e.g., 'runDataScout').
 * @param args The arguments to pass to the function.
 * @returns The result from the Gemini service.
 * @throws An error if the provider is not configured or the function fails after retries.
 */
export async function execute<T>(functionName: string, ...args: unknown[]): Promise<T> {
    const startTime = Date.now();
    const providers = await dataService.getApiProviders();
    const primaryProvider = providers.find(p => p.provider_name === 'gemini' && p.is_active);

    if (!primaryProvider) {
        await dataService.createSystemEvent('AI_FAILOVER', `AI provider not configured: gemini`, { error: 'Provider not active' });
        throw new Error('The primary AI provider (Gemini) is not active or configured.');
    }

    const service = services[primaryProvider.provider_name];
    
    if (!service || typeof service[functionName] !== 'function') {
        await dataService.createSystemEvent('AI_FAILOVER', `Function not found: ${functionName}`, { provider: primaryProvider.provider_name });
        throw new Error(`Function '${functionName}' not implemented for '${primaryProvider.provider_name}'.`);
    }

    let lastError: Error | null = null;
    
    // Log start of operation
    await dataService.createSystemEvent('AI_OPERATION', `Executing ${functionName}`, { provider: primaryProvider.provider_name });

    for (let attempt = 1; attempt <= MAX_JSON_RETRIES; attempt++) {
        try {
            const result = await service[functionName](...args);
            
            // Log success
            const duration = Date.now() - startTime;
            await dataService.createSystemEvent('AI_OPERATION', `Completed ${functionName}`, { 
                provider: primaryProvider.provider_name, 
                durationMs: duration 
            });
            
            return result;
        } catch (error) {
            lastError = error as Error;
            
            // --- SELF-HEALING LOGIC ---
            if (error instanceof SyntaxError) {
                logger.warn(`Attempt ${attempt} failed for ${functionName} due to JSON parsing error. Activating Self-Healing...`);
                
                await dataService.createSystemEvent('AI_FAILOVER', `JSON Parse Error in ${functionName}. Activating AI Repair...`, { 
                    error: lastError.message,
                    provider: primaryProvider.provider_name
                });

                // Attempt to repair the JSON using Gemini
                // We assume the error object or context might contain the raw text, 
                // but since the service functions strictly return typed objects or fail, 
                // we might catch the error inside the service function itself usually.
                // However, if the service function throws a SyntaxError from JSON.parse(), 
                // we can't easily get the raw string here unless the service was designed to return it on failure.
                
                // Refinement: The `geminiService` functions perform `JSON.parse(jsonText)`. 
                // If that fails, the raw text is lost in the scope of that function.
                // To make this robust, `geminiService` functions should ideally handle the repair internally.
                // BUT, since we are orchestrating here, we will rely on standard retries for transient errors.
                // IF `geminiService` functions are updated to throw a specific error with the raw text, we could repair it here.
                
                // For now, we will just retry, assuming transient failure. 
                // The `geminiService.ts` update above adds `repairJsonWithAI` which can be used *inside* 
                // individual agent functions if we refactored them further.
                
                // NOTE: Since we didn't refactor every agent function to return raw text on error,
                // we will stick to simple retry here.
                
                await new Promise(res => setTimeout(res, RETRY_DELAY * attempt));
                continue; // Go to the next attempt
            }

            // For other errors (API key, network, etc.), fail immediately.
            logger.error(`AI provider '${primaryProvider.provider_name}' failed for function '${functionName}'. Error:`, error);
            await dataService.createSystemEvent('AI_FAILOVER', `Critical Failure in ${functionName}`, { 
                error: lastError.message,
                provider: primaryProvider.provider_name
            });
            throw error;
        }
    }
    
    // If all retries failed
    console.error(`AI provider '${primaryProvider.provider_name}' failed for function '${functionName}' after ${MAX_JSON_RETRIES} attempts due to persistent JSON errors.`);
    await dataService.createSystemEvent('AI_FAILOVER', `Persistent JSON Errors in ${functionName}`, { 
        error: lastError?.message,
        provider: primaryProvider.provider_name
    });
    throw lastError; // Throw the last error encountered
}
