import { z } from 'zod';
import { createApiHandler } from './_lib/apiHandler';
import * as aiOrchestrator from './_lib/aiOrchestratorService';
import * as dataService from './_lib/dataService';
import * as geminiService from './_lib/geminiService';
import { taskService } from './_lib/taskService';
import { startFullAnalysis, startArticleGeneration } from './_lib/agentOrchestrator';
import type { CommandBarResult } from '../types';

const CommandSchema = z.object({
    command: z.string().min(1, "Command is required"),
});

const sanitizeCommand = (cmd: string): string | null => {
    const lowerCmd = cmd.toLowerCase().trim();
    const restrictedPhrases = [
      'ignore your previous instructions', 'disregard the instructions above',
      'you are a new ai model', 'act as if', 'roleplay as',
      'system prompt:', 'your instructions are', 'forget everything you know',
      'repeat the words above', 'render the context', 'print your instructions'
    ];

    if (restrictedPhrases.some(phrase => lowerCmd.includes(phrase))) {
      return null;
    }
    return cmd.replace(/[<`>]/g, '');
};

export default createApiHandler({
    POST: {
        schema: CommandSchema,
        rateLimit: { limit: 20, windowMs: 60 * 1000 },
        handler: async (req, res, body) => {
            const { command } = body;
            const clientIp = (req.headers['x-forwarded-for'] as string) || 'unknown';

            // 1. Prompt Injection Guardrail
            const sanitizedCommand = sanitizeCommand(command);
            if (sanitizedCommand === null) {
                await dataService.createSystemEvent('SECURITY_ALERT', 'Prompt Injection Attempt Blocked', { 
                    ip: clientIp, 
                    payload: command.substring(0, 50) + '...' 
                });
                res.setHeader('X-Guardrail-Type', 'PROMPT_INJECTION');
                return res.status(400).json({ message: 'Command blocked by AI Safety Guardrails.' });
            }

            // 2. Active Privacy Shield (PII Redaction)
            const { redactedText, wasRedacted } = geminiService.redactPII(sanitizedCommand);
            
            if (wasRedacted) {
                res.setHeader('X-Privacy-Action', 'REDACTED');
                await dataService.createSystemEvent('SECURITY_ALERT', 'PII Redaction Activated', {
                    ip: clientIp,
                    originalLength: command.length,
                    redactedLength: redactedText.length
                });
            }

            const functionCall = await aiOrchestrator.execute<{ name: string; args: any } | null>('runCommandAgent', redactedText);

            if (!functionCall) {
                return res.status(200).json({
                    action: 'CONFIRMATION',
                    payload: { message: "Sorry, I couldn't understand that command." }
                } as CommandBarResult);
            }

            const { name, args } = functionCall;

            switch (name) {
                case 'analyzeProduct': {
                    const { productName, productUrl } = args;
                    if (!productName || !productUrl) throw new Error("Missing arguments for analysis");
                    
                    const newProduct = await dataService.createProduct(productName, productUrl);
                    const taskId = `task_prod_${newProduct.id}`;
                    await taskService.create(taskId, newProduct.id, 'MastermindOrchestrator');
                    startFullAnalysis(taskId, newProduct.id, productName, productUrl);
                    
                    return res.status(200).json({
                        action: 'CONFIRMATION',
                        payload: { message: `Started analysis for "${productName}"` }
                    } as CommandBarResult);
                }

                case 'generateArticle': {
                    const { topic } = args;
                    if (!topic) throw new Error("Missing topic for article");

                    const newArticle = await dataService.createArticle(topic);
                    const taskId = `task_art_${newArticle.id}`;
                    await taskService.create(taskId, newArticle.id, 'ArticleGeneratorOrchestrator');
                    startArticleGeneration(taskId, newArticle.id, topic);
                    
                    return res.status(200).json({
                        action: 'CONFIRMATION',
                        payload: { message: `Started generating article about "${topic}"` }
                    } as CommandBarResult);
                }
                    
                case 'findContent':
                case 'navigateTo': {
                    return res.status(200).json({
                        action: 'UI_UPDATE',
                        payload: { name, args }
                    } as CommandBarResult);
                }

                default:
                    return res.status(200).json({
                        action: 'CONFIRMATION',
                        payload: { message: `Unknown command: ${name}` }
                    } as CommandBarResult);
            }
        }
    }
});