
# Yclep - AI Affiliate Marketing Platform

[![Architecture: Vercel Stack](https://img.shields.io/badge/Architecture-Vercel%20Stack%20(Postgres%2C%20KV)-black?logo=vercel)](https://vercel.com)
[![AI Engine: Gemini API](https://img.shields.io/badge/AI%20Engine-Gemini%20API-blueviolet.svg)](https://ai.google.dev/gemini-api)
[![Tech Stack: React & TypeScript](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript-282c34.svg?logo=react)](https://reactjs.org/)

Yclep is an advanced AI-powered platform for affiliate marketing automation.

## 🚀 Quick Start (Manual Setup)

Since this is a custom environment, follow these exact steps to start the app:

### 1. Generate Configuration
Run this command first. It will create the `config.env` file with your API keys and database credentials (already pre-configured in the script).

```bash
npm run setup
```

### 2. Install & Initialize Database
Install dependencies and push the schema to your Supabase database.

```bash
npm install
npm run db:init
```

### 3. Launch
Start the server (Backend + Frontend).

```bash
npm run start
```

- **Admin Dashboard**: `http://localhost:3000/admin` (Password: `admin123`)
- **Public Site**: `http://localhost:3000/site`

## 🛠️ Troubleshooting

- **Files Missing?**: If `config.env` doesn't appear, run `npm run setup` again.
- **Database Error?**: Ensure your password in `config.env` is URL-encoded if it contains special characters (the setup script handles this for you).
