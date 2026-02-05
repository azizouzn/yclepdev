import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Load environment variables
dotenv.config({ path: 'config.env' });

// Suppress git-related stderr warnings
const originalStderrWrite = process.stderr.write;
process.stderr.write = function (str: string | Buffer, ...args: any[]): boolean {
  const message = str.toString();
  if (!message.includes('fatal: not a git repository') && 
      !message.includes('.git') &&
      !message.includes('fatal:')) {
    return originalStderrWrite.apply(process.stderr, [str, ...args]);
  }
  return true;
} as any;

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../api/_db';
import { logger } from '../utils/logger';

// Fallback environment variables
if (!process.env.DATABASE_URL) {
  logger.warn('⚠️ config.env not found. Using fallback values.');
  process.env.API_KEY = process.env.API_KEY || 'REPLACE_WITH_API_KEY';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'please-change-me';
}

// Import all API handlers
import productsHandler from './products';
import articlesHandler from './articles';
import guidesHandler from './guides/index';
import guideIdHandler from './guides/[id]';
import contentIdHandler from './content/[id]';
import contentStatusHandler from './content/[id]/status';
import contentAutolinkHandler from './content/[id]/autolink';
import tasksHandler from './tasks/[id]';
import tasksContinueHandler from './tasks/continue';
import settingsStatusHandler from './settings/status';
import settingsPersonaHandler from './settings/persona';
import settingsProvidersHandler from './settings/providers';
import eventsHandler from './events';
import commandHandler from './command';
import recommendationsHandler from './recommendations';
import systemSetupHandler from './system/setup';
import gitHandler from './system/git';

// Agent handlers
import oppHunterHandler from './agents/opportunity-hunter';
import marketSentinelHandler from './agents/market-sentinel';
import seoStrategistHandler from './agents/seo-strategist';
import monitorHandler from './agents/monitor';
import suggestionsHandler from './products/[id]/suggestions';
import enhanceHandler from './products/[id]/enhance';
import abTestHandler from './products/[id]/ab-test';
import visualsHandler from './products/[id]/visuals';
import videoScriptHandler from './products/[id]/video-script';
import refreshHandler from './products/[id]/refresh';
import acceptUpdateHandler from './products/[id]/accept-update';
import discardUpdateHandler from './products/[id]/discard-update';
import articleSuggestionsHandler from './articles/[id]/suggestions';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request wrapper for error handling
const wrap = (handler: (req: Request, res: Response) => Promise<unknown> | unknown) => {
  return async (req: Request, res: Response) => {
    try {
      await Promise.resolve(handler(req, res));
    } catch (err) {
      logger.error('Handler error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
};

// API Routes
app.all('/api/system/setup', wrap(systemSetupHandler));
app.all('/api/system/git', wrap(gitHandler));

app.all('/api/products', wrap(productsHandler));
app.all('/api/products/:id/suggestions', wrap(suggestionsHandler));
app.all('/api/products/:id/enhance', wrap(enhanceHandler));
app.all('/api/products/:id/ab-test', wrap(abTestHandler));
app.all('/api/products/:id/visuals', wrap(visualsHandler));
app.all('/api/products/:id/video-script', wrap(videoScriptHandler));
app.all('/api/products/:id/refresh', wrap(refreshHandler));
app.all('/api/products/:id/accept-update', wrap(acceptUpdateHandler));
app.all('/api/products/:id/discard-update', wrap(discardUpdateHandler));

app.all('/api/articles', wrap(articlesHandler));
app.all('/api/articles/:id/suggestions', wrap(articleSuggestionsHandler));

app.all('/api/guides', wrap(guidesHandler));
app.all('/api/guides/:id', wrap(guideIdHandler));

app.all('/api/content/:id', wrap(contentIdHandler));
app.all('/api/content/:id/status', wrap(contentStatusHandler));
app.all('/api/content/:id/autolink', wrap(contentAutolinkHandler));

app.all('/api/tasks/continue', wrap(tasksContinueHandler));
app.all('/api/tasks/:id', wrap(tasksHandler));

app.all('/api/agents/opportunity-hunter', wrap(oppHunterHandler));
app.all('/api/agents/market-sentinel', wrap(marketSentinelHandler));
app.all('/api/agents/seo-strategist', wrap(seoStrategistHandler));
app.all('/api/agents/monitor', wrap(monitorHandler));

app.all('/api/settings/status', wrap(settingsStatusHandler));
app.all('/api/settings/persona', wrap(settingsPersonaHandler));
app.all('/api/settings/providers', wrap(settingsProvidersHandler));
app.all('/api/events', wrap(eventsHandler));
app.all('/api/command', wrap(commandHandler));
app.all('/api/recommendations', wrap(recommendationsHandler));

// Main handler for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
