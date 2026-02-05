
const fs = require('fs');
const path = require('path');

// Password encoded: @ becomes %40 to prevent parsing errors in connection string
const configContent = `API_KEY=AIzaSyCrrIgfZjj3KDb1vnJ3NuCy3RuY4XpzhaI
DATABASE_URL=postgresql://postgres:Azou%4021%40Azou@db.febnhknmqznmjpujhgup.supabase.co:5432/postgres
ADMIN_PASSWORD=admin123
`;

const schemaContent = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    affiliate_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    score INTEGER DEFAULT 0,
    keywords TEXT,
    analysis_result JSONB,
    visual_assets JSONB,
    video_script JSONB,
    performance_metrics JSONB,
    stale_reason TEXT,
    is_enhanced BOOLEAN DEFAULT FALSE,
    new_analysis JSONB,
    diff_report TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    score INTEGER DEFAULT 0,
    keywords TEXT,
    analysis_result JSONB,
    enhancement_suggestions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guides Table
CREATE TABLE IF NOT EXISTS guides (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    html_content TEXT,
    embedded_product_ids INTEGER[],
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY,
    content_id INTEGER NOT NULL,
    agent TEXT NOT NULL,
    status TEXT NOT NULL,
    plan JSONB,
    current_stage TEXT,
    progress INTEGER DEFAULT 0,
    result JSONB,
    error JSONB,
    metrics JSONB,
    context JSONB,
    completed_steps TEXT[],
    attempt INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- System Events Table
CREATE TABLE IF NOT EXISTS system_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT FALSE
);
`;

try {
    fs.writeFileSync(path.join(__dirname, 'config.env'), configContent);
    console.log('✅ Created config.env with your credentials');
    
    fs.writeFileSync(path.join(__dirname, 'database_schema.sql'), schemaContent);
    console.log('✅ Created database_schema.sql');
    
    console.log('Setup complete. You can now run "npm run db:init"');
} catch (e) {
    console.error('Failed to create files:', e);
}
