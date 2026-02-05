
import { z } from 'zod';
import { createApiHandler } from '../_lib/apiHandler';
import * as aiOrchestrator from '../_lib/aiOrchestratorService';

// Define schema for runtime safety
const MonitorEventSchema = z.object({
    agentEvent: z.any() // Allows flexibility for now, can be tightened later
});

export default createApiHandler({
    POST: {
        // Monitor agent might need to be accessible by system processes, 
        // but for now we keep it secure.
        schema: MonitorEventSchema,
        handler: async (req, res, body) => {
            const { agentEvent } = body;
            
            // The AI orchestrator will handle provider logic
            const monitorReport = await aiOrchestrator.execute('runMonitorAgent', agentEvent);
            
            res.status(200).json(monitorReport);
        }
    }
});
