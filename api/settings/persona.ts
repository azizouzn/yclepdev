import { z } from 'zod';
import { createApiHandler } from '../_lib/apiHandler';
import * as dataService from '../_lib/dataService';

const UpdatePersonaSchema = z.object({
    persona: z.enum(['friendly_and_helpful', 'witty_and_informal', 'expert_and_technical'])
});

export default createApiHandler({
    GET: {
        handler: async (req, res) => {
            const persona = await dataService.getPersona();
            res.status(200).json({ persona });
        }
    },
    PUT: {
        schema: UpdatePersonaSchema,
        handler: async (req, res, body) => {
            const { persona } = body;
            const updatedPersona = await dataService.updatePersona(persona);
            res.status(200).json({ persona: updatedPersona });
        }
    }
});