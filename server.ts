import dotenv from 'dotenv';
// CRITICAL: Load environment variables BEFORE importing any other modules
dotenv.config({ path: 'config.env' });

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from './api/_db';
import { logger } from './utils/logger';

// --- FAIL-SAFE: Hardcoded Fallback for Mobile/Cloud Environments ---
// If config.env fails to load, these values ensure the app still runs.
if (!process.env.DATABASE_URL) {
  logger.warn('⚠️ config.env not found. Using local fallback placeholders — replace with real credentials.');
  // Use non-sensitive placeholders to avoid leaking keys in the repo.
  process.env.API_KEY = process.env.API_KEY || 'REPLACE_WITH_API_KEY';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'please-change-me';
}
// -------------------------------------------------------------------

// Import API handlers
import productsHandler from './api/products';
import articlesHandler from './api/articles';
import guidesHandler from './api/guides/index';
import guideIdHandler from './api/guides/[id]';
import contentIdHandler from './api/content/[id]';
import contentStatusHandler from './api/content/[id]/status';
import contentAutolinkHandler from './api/content/[id]/autolink';
import tasksHandler from './api/tasks/[id]';
import tasksContinueHandler from './api/tasks/continue';
import settingsStatusHandler from './api/settings/status';
import settingsPersonaHandler from './api/settings/persona';
import settingsProvidersHandler from './api/settings/providers';
import eventsHandler from './api/events';
import commandHandler from './api/command';
import recommendationsHandler from './api/recommendations';
import systemSetupHandler from './api/system/setup';

// Agent & Action Handlers
import oppHunterHandler from './api/agents/opportunity-hunter';
import marketSentinelHandler from './api/agents/market-sentinel';
import seoStrategistHandler from './api/agents/seo-strategist';
import monitorHandler from './api/agents/monitor';
import suggestionsHandler from './api/products/[id]/suggestions';
import enhanceHandler from './api/products/[id]/enhance';
import abTestHandler from './api/products/[id]/ab-test';
import visualsHandler from './api/products/[id]/visuals';
import videoScriptHandler from './api/products/[id]/video-script';
import refreshHandler from './api/products/[id]/refresh';
import acceptUpdateHandler from './api/products/[id]/accept-update';
import discardUpdateHandler from './api/products/[id]/discard-update';
import articleSuggestionsHandler from './api/articles/[id]/suggestions';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to wrap Vercel-style async handlers for Express and catch errors
const wrap = (handler: (req: Request, res: Response) => Promise<unknown> | unknown) => {
  return async (req: Request, res: Response) => {
    try {
      await Promise.resolve(handler(req, res));
    } catch (err) {
      logger.error('Handler error:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

// --- Auto-Initialize Database ---
const initDbOnStartup = async () => {
  logger.info('🔌 Attempting to auto-initialize database...');
  try {
    // Try to read from root first, then fallback to relative
    let schemaPath = path.join(__dirname, 'database_schema.sql');
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.join(process.cwd(), 'database_schema.sql');
    }

    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await query(sql);
      logger.info('✅ Database tables verified/created successfully.');

      // Seed default settings if they don't exist
      try {
        const checkSettings = await query("SELECT * FROM settings WHERE key = 'api_providers'");
        if (checkSettings.rowCount === 0) {
          const defaultProviders = [
            { provider_name: 'gemini', api_key_env_var_name: 'API_KEY', is_active: true, priority: 1 }
          ];
          await query("INSERT INTO settings (key, value) VALUES ('api_providers', $1)", [JSON.stringify(defaultProviders)]);
          await query("INSERT INTO settings (key, value) VALUES ('persona', $1)", [JSON.stringify('friendly_and_helpful')]);
          logger.info('⚙️  Default settings seeded.');
        }
      } catch (seedErr) {
        logger.warn('⚠️ Settings seed check failed (tables might be fresh):', seedErr);
      }

    } else {
      logger.warn('⚠️ database_schema.sql not found. Skipping auto-init.');
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('⚠️ Auto-init warning (This is normal if connection details are wrong):', msg);
  }
};

// --- API Routes Mapping ---

// System Setup (For mobile users)
app.all('/api/system/setup', wrap(systemSetupHandler));

// Products
app.all('/api/products', wrap(productsHandler));
app.all('/api/products/:id/suggestions', wrap(suggestionsHandler));
app.all('/api/products/:id/enhance', wrap(enhanceHandler));
app.all('/api/products/:id/ab-test', wrap(abTestHandler));
app.all('/api/products/:id/visuals', wrap(visualsHandler));
app.all('/api/products/:id/video-script', wrap(videoScriptHandler));
app.all('/api/products/:id/refresh', wrap(refreshHandler));
app.all('/api/products/:id/accept-update', wrap(acceptUpdateHandler));
app.all('/api/products/:id/discard-update', wrap(discardUpdateHandler));

// Articles
app.all('/api/articles', wrap(articlesHandler));
app.all('/api/articles/:id/suggestions', wrap(articleSuggestionsHandler));

// Guides
app.all('/api/guides', wrap(guidesHandler));
app.all('/api/guides/:id', wrap(guideIdHandler));

// General Content
app.all('/api/content/:id', wrap(contentIdHandler));
app.all('/api/content/:id/status', wrap(contentStatusHandler));
app.all('/api/content/:id/autolink', wrap(contentAutolinkHandler));

// Tasks
app.all('/api/tasks/continue', wrap(tasksContinueHandler));
app.all('/api/tasks/:id', wrap(tasksHandler));

// Agents
app.all('/api/agents/opportunity-hunter', wrap(oppHunterHandler));
app.all('/api/agents/market-sentinel', wrap(marketSentinelHandler));
app.all('/api/agents/seo-strategist', wrap(seoStrategistHandler));
app.all('/api/agents/monitor', wrap(monitorHandler));

// Settings & System
app.all('/api/settings/status', wrap(settingsStatusHandler));
app.all('/api/settings/persona', wrap(settingsPersonaHandler));
app.all('/api/settings/providers', wrap(settingsProvidersHandler));
app.all('/api/events', wrap(eventsHandler));
app.all('/api/command', wrap(commandHandler));
app.all('/api/recommendations', wrap(recommendationsHandler));


// --- Serve Frontend (Static Files) ---
// Serve static files from the 'dist' directory (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle Client-side routing (SPA)
// Any request that doesn't match an API route is sent to index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API Endpoint not found' });
  }
  // Fallback to index.html if it exists, otherwise send a basic message
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Yclep Backend is Running. Build the frontend to see the UI.');
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`\n  ================================================\n  🚀 Yclep Platform is Running!\n  ================================================\n  \n  📡 Port: ${PORT}\n  🔑 Environment: ${process.env.NODE_ENV || 'development'}\n  \n  👉 Admin Dashboard: http://localhost:${PORT}/admin\n  👉 Public Site:     http://localhost:${PORT}/site\n  \n  Checking Env Vars:\n  - API_KEY: ${process.env.API_KEY ? '✅ Loaded' : '❌ Missing'}\n  - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Loaded' : '❌ Missing'}\n  ================================================\n  `);

  // Run DB init in background so it doesn't block server startup
  initDbOnStartup().catch(err => logger.error('Background DB Init Failed:', err));
});
