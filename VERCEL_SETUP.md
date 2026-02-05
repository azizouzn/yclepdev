# Vercel Deployment Guide - YCLEP Platform

## 🔧 What Was Fixed

Your Vite + Express project had build issues on Vercel because Vercel's default configuration expects either Next.js or standard serverless functions. The following changes enable Vercel to properly build and deploy your application:

### Changes Made:

1. **Created `vercel.json`** - Main configuration file for Vercel
   - Sets up build and output directory paths
   - Configures rewrites to handle both API routes and frontend SPA routing
   - Adds caching headers for optimized performance

2. **Created `api/index.ts`** - Vercel serverless handler
   - Bridges Express application to Vercel's serverless runtime
   - Imports and registers all API route handlers
   - Handles CORS and error management for serverless environment

3. **Updated `package.json`**
   - Added `vercel-build` script
   - Made `prepare` script non-fatal (husky install won't block build)
   - Added missing dependencies

4. **Updated `tsconfig.json`**
   - Changed `moduleResolution` from "bundler" to "node" (required for serverless)
   - Changed `noEmit` to false (needed for build output)
   - Added `outDir` configuration
   - Added `esModuleInterop` for better ES module compatibility
   - Updated build targets for Node.js runtime

5. **Created `.vercelignore`** - Excludes unnecessary files from deployment

---

## 📋 Environment Variables Required

Set these in your Vercel project dashboard (Settings → Environment Variables):

```
DATABASE_URL=postgresql://user:password@host:port/database
API_KEY=your-gemini-api-key
ADMIN_PASSWORD=your-admin-password
```

Optional:
```
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
```

---

## 🚀 Deployment Steps

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to your Vercel account
vercel login

# Deploy from project directory
vercel
```

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Vercel will auto-detect and use the configuration in `vercel.json`
6. Add environment variables in project settings
7. Click "Deploy"

---

## 🔍 Build Process

When you deploy to Vercel, it will:

1. Run `npm install` to install dependencies
2. Execute `npm run build` which:
   - Runs TypeScript compiler (`tsc`)
   - Builds the Vite frontend to `dist/`
3. Create serverless functions from `api/` directory
4. Deploy static frontend files from `dist/`
5. Routes `/api/*` requests to serverless functions
6. Routes all other requests to `index.html` (SPA routing)

---

## ✅ Testing Locally (Before Deployment)

```bash
# Build the project
npm run build

# Install Vercel CLI if not already installed
npm i -g vercel

# Test locally with Vercel's environment
vercel dev

# This runs on http://localhost:3000
# - Frontend: http://localhost:3000
# - API routes: http://localhost:3000/api/*
```

---

## 🐛 Troubleshooting

### Build Fails with "Cannot find module"
- Clear node_modules and rebuild: `rm -rf node_modules && npm install && npm run build`
- Check that all imports use correct paths (especially relative imports in `api/`)

### API Routes Return 404
- Verify route handlers are exported as default functions
- Check `api/index.ts` includes all your route handlers
- Ensure `vercel.json` rewrites are correct

### Environment Variables Not Found
- Check variables are set in Vercel dashboard (not just locally)
- Environment variables from `config.env` won't work on Vercel - use dashboard instead
- API requests can't access environment variables set on client-side

### Database Connection Fails
- Verify `DATABASE_URL` is correct and accessible from Vercel's region
- Most database providers require you to whitelist Vercel's IP ranges
- Check database credentials in Vercel's environment variables section

### "fatal: not a git repository" Error
- This is suppressed in the code - it's just a warning from git
- Not an actual build issue

---

## 📊 Project Structure

```
yclep-platform/
├── api/                          # Serverless API handlers
│   ├── index.ts                 # Main Vercel handler (NEW)
│   ├── _db.ts                   # Database module
│   ├── products.ts
│   ├── articles.ts
│   ├── agents/
│   └── ... (all API routes)
├── src/                          # React frontend source
│   ├── App.tsx
│   └── ...
├── dist/                         # Built frontend (generated)
├── public/                       # Static assets
├── vercel.json                   # Vercel configuration (NEW)
├── .vercelignore                 # Vercel ignore rules (NEW)
├── vite.config.ts               # Vite build config
├── tsconfig.json                # TypeScript config (UPDATED)
├── package.json                 # Dependencies (UPDATED)
└── server.ts                    # Express server (for local dev)
```

---

## 🔐 Security Notes

1. **Never commit `config.env` or `.env` files** - Use Vercel dashboard for secrets
2. **API handlers run in serverless environment** - No persistent state between requests
3. **CORS is configured** - Adjust `CORS_ORIGIN` for your domain
4. **Requests have 10MB limit** - Express middleware configured with this limit

---

## 📈 Performance Tips

1. Frontend assets are served with aggressive caching (1 year)
2. API responses should be designed to be stateless
3. Database connections are pooled - use connection strings with pool settings
4. Each serverless function has ~128MB memory - optimize large operations

---

## 🆘 Getting Help

If deployment still fails:

1. Check Vercel deployment logs (Dashboard → Your Project → Deployments)
2. Look for error messages in build step and function logs
3. Verify all environment variables are set
4. Test locally with `vercel dev` first
5. Check [Vercel docs](https://vercel.com/docs) for framework-specific help

---

## ✨ What's Next

After successful deployment:

1. Test all API endpoints from production URL
2. Monitor database performance and connection limits
3. Set up CI/CD for automatic deployments on push
4. Configure custom domain in Vercel dashboard
5. Enable automatic HTTPS (included by default)

