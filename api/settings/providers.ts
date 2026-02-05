import { z } from 'zod';
import { createApiHandler } from '../_lib/apiHandler';
import * as dataService from '../_lib/dataService';

const ProviderSettingsSchema = z.array(z.object({
    provider_name: z.string(),
    api_key_env_var_name: z.string(),
    is_active: z.boolean(),
    priority: z.number()
}));

export default createApiHandler({
    PUT: {
        schema: ProviderSettingsSchema,
        handler: async (req, res, body) => {
            const updatedProviders = await dataService.updateApiProviders(body);
            res.status(200).json(updatedProviders);
        }
    }
});