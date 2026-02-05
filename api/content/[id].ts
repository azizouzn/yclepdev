import { createApiHandler } from '../_lib/apiHandler';
import * as dataService from '../_lib/dataService';

export default createApiHandler({
    DELETE: {
        handler: async (req, res) => {
            const contentId = parseInt(req.query.id as string, 10);
            if (isNaN(contentId)) return res.status(400).json({ message: 'Invalid ID' });
            
            const deleted = await dataService.deleteContentById(contentId);
            
            if (deleted) {
                res.status(204).end();
            } else {
                res.status(404).json({ message: 'Content not found' });
            }
        }
    }
});