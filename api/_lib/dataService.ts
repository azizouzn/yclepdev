
import { query } from '../_db';
import { ContentStatus, type Product, type Article, type BrandPersona, type ApiProviderSettings, SystemEvent, SystemEventType, Guide } from '../../types';

// --- Rate Limiting (Using a simplified in-memory approach or DB if strict) ---
// For simplicity and speed, we'll use a simple in-memory map for rate limits 
// since they are transient. For distributed systems, use Redis.
const rateLimits = new Map<string, number[]>();

export const checkRateLimit = async (identifier: string, limit: number, windowMs: number): Promise<boolean> => {
    const now = Date.now();
    const timestamps = rateLimits.get(identifier) || [];
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    
    if (validTimestamps.length >= limit) {
        return false;
    }
    validTimestamps.push(now);
    rateLimits.set(identifier, validTimestamps);
    return true;
};

// --- Product Operations ---

export const getAllProducts = async (): Promise<Product[]> => {
    const res = await query('SELECT * FROM products ORDER BY created_at DESC');
    return res.rows.map(row => ({
        ...row,
        analysisResult: row.analysis_result,
        visualAssets: row.visual_assets,
        videoScript: row.video_script,
        performanceMetrics: row.performance_metrics,
        staleReason: row.stale_reason,
        isEnhanced: row.is_enhanced,
        newAnalysis: row.new_analysis,
        diffReport: row.diff_report
    }));
};

export const findProductById = async (id: number): Promise<Product | undefined> => {
    const res = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
        ...row,
        analysisResult: row.analysis_result,
        visualAssets: row.visual_assets,
        videoScript: row.video_script,
        performanceMetrics: row.performance_metrics,
        staleReason: row.stale_reason,
        isEnhanced: row.is_enhanced,
        newAnalysis: row.new_analysis,
        diffReport: row.diff_report
    };
};

export const createProduct = async (name: string, url: string): Promise<Product> => {
    const res = await query(
        `INSERT INTO products (title, affiliate_url, status, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         RETURNING *`,
        [name, url, ContentStatus.ANALYZING]
    );
    return res.rows[0];
};

export const updateProduct = async (id: number, updates: Partial<Product>): Promise<Product | undefined> => {
    // Map frontend camelCase fields to DB snake_case columns
    const dbUpdates: Record<string, unknown> = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.score !== undefined) dbUpdates.score = updates.score;
    if (updates.keywords) dbUpdates.keywords = updates.keywords;
    if (updates.analysisResult) dbUpdates.analysis_result = updates.analysisResult;
    if (updates.visualAssets) dbUpdates.visual_assets = updates.visualAssets;
    if (updates.videoScript) dbUpdates.video_script = updates.videoScript;
    if (updates.performanceMetrics) dbUpdates.performance_metrics = updates.performanceMetrics;
    if (updates.staleReason !== undefined) dbUpdates.stale_reason = updates.staleReason; // Allow null to clear
    if (updates.isEnhanced !== undefined) dbUpdates.is_enhanced = updates.isEnhanced;
    if (updates.newAnalysis !== undefined) dbUpdates.new_analysis = updates.newAnalysis;
    if (updates.diffReport !== undefined) dbUpdates.diff_report = updates.diffReport;

    const keys = Object.keys(dbUpdates);
    if (keys.length === 0) return findProductById(id);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = keys.map(key => dbUpdates[key]);

    const res = await query(
        `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
    );

    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
        ...row,
        analysisResult: row.analysis_result,
        visualAssets: row.visual_assets,
        videoScript: row.video_script,
        performanceMetrics: row.performance_metrics,
        staleReason: row.stale_reason,
        isEnhanced: row.is_enhanced,
        newAnalysis: row.new_analysis,
        diffReport: row.diff_report
    };
};

// --- Article Operations ---

export const getAllArticles = async (): Promise<Article[]> => {
    const res = await query('SELECT * FROM articles ORDER BY created_at DESC');
    return res.rows.map(row => ({
        ...row,
        analysisResult: row.analysis_result,
        enhancementSuggestions: row.enhancement_suggestions
    }));
};

export const findArticleById = async (id: number): Promise<Article | undefined> => {
    const res = await query('SELECT * FROM articles WHERE id = $1', [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
        ...row,
        analysisResult: row.analysis_result,
        enhancementSuggestions: row.enhancement_suggestions
    };
};

export const createArticle = async (topic: string): Promise<Article> => {
    const res = await query(
        `INSERT INTO articles (title, status, created_at) VALUES ($1, $2, NOW()) RETURNING *`,
        [topic, ContentStatus.GENERATING]
    );
    return res.rows[0];
};

export const updateArticle = async (id: number, updates: Partial<Article>): Promise<Article | undefined> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.keywords) dbUpdates.keywords = updates.keywords;
    if (updates.analysisResult) dbUpdates.analysis_result = updates.analysisResult;
    if (updates.enhancementSuggestions) dbUpdates.enhancement_suggestions = updates.enhancementSuggestions;

    const keys = Object.keys(dbUpdates);
    if (keys.length === 0) return findArticleById(id);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = keys.map(key => dbUpdates[key]);

    const res = await query(
        `UPDATE articles SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
    );

    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
        ...row,
        analysisResult: row.analysis_result,
        enhancementSuggestions: row.enhancement_suggestions
    };
};

// --- Guide Operations ---

export const getAllGuides = async (): Promise<Guide[]> => {
    const res = await query('SELECT * FROM guides ORDER BY created_at DESC');
    return res.rows.map(row => ({
        ...row,
        embedded_product_ids: row.embedded_product_ids || []
    }));
};

export const findGuideById = async (id: number): Promise<Guide | undefined> => {
    const res = await query('SELECT * FROM guides WHERE id = $1', [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
        ...row,
        embedded_product_ids: row.embedded_product_ids || []
    };
};

export const createGuide = async (title: string, html_content: string, embedded_product_ids: number[]): Promise<Guide> => {
    const res = await query(
        `INSERT INTO guides (title, html_content, embedded_product_ids, status, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) 
         RETURNING *`,
        [title, html_content, embedded_product_ids, ContentStatus.DRAFT]
    );
    return { ...res.rows[0], embedded_product_ids: res.rows[0].embedded_product_ids || [] };
};

export const updateGuide = async (id: number, updates: Partial<Guide>): Promise<Guide | undefined> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.html_content) dbUpdates.html_content = updates.html_content;
    if (updates.embedded_product_ids) dbUpdates.embedded_product_ids = updates.embedded_product_ids;
    if (updates.status) dbUpdates.status = updates.status;

    const keys = Object.keys(dbUpdates);
    if (keys.length === 0) return findGuideById(id);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = keys.map(key => dbUpdates[key]);

    const res = await query(
        `UPDATE guides SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
    );
    if (res.rows.length === 0) return undefined;
    return { ...res.rows[0], embedded_product_ids: res.rows[0].embedded_product_ids || [] };
};

// --- Content Deletion ---

export const deleteContentById = async (id: number): Promise<boolean> => {
    // Try deleting from all tables. The ID might overlap but in a real app we'd have global IDs or type checks.
    // For this implementation, we assume IDs are unique enough or we check properly.
    // Since we don't have the type passed here easily, we try all.
    
    const pRes = await query('DELETE FROM products WHERE id = $1', [id]);
    if (pRes.rowCount && pRes.rowCount > 0) return true;
    
    const aRes = await query('DELETE FROM articles WHERE id = $1', [id]);
    if (aRes.rowCount && aRes.rowCount > 0) return true;
    
    const gRes = await query('DELETE FROM guides WHERE id = $1', [id]);
    if (gRes.rowCount && gRes.rowCount > 0) return true;

    return false;
};

export const updateContentStatus = async (id: number, status: ContentStatus): Promise<Product | Article | Guide | undefined> => {
    // Determine type first
    let res = await query('UPDATE products SET status = $2 WHERE id = $1 RETURNING *', [id, status]);
    if (res.rows.length > 0) return res.rows[0];

    res = await query('UPDATE articles SET status = $2 WHERE id = $1 RETURNING *', [id, status]);
    if (res.rows.length > 0) return res.rows[0];

    res = await query('UPDATE guides SET status = $2 WHERE id = $1 RETURNING *', [id, status]);
    if (res.rows.length > 0) return res.rows[0];

    return undefined;
};

// --- Event Operations ---

export const getEvents = async (): Promise<SystemEvent[]> => {
    const res = await query('SELECT * FROM system_events ORDER BY timestamp DESC LIMIT 50');
    return res.rows;
};

export const markEventsAsRead = async (): Promise<SystemEvent[]> => {
    await query('UPDATE system_events SET read = TRUE');
    return getEvents();
};

export const createSystemEvent = async (type: SystemEventType, message: string, details?: Record<string, unknown>): Promise<SystemEvent> => {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const res = await query(
        `INSERT INTO system_events (id, type, details, timestamp, read) VALUES ($1, $2, $3, NOW(), FALSE) RETURNING *`,
        [id, type, { message, ...details }]
    );
    return res.rows[0];
};

// --- Settings Operations ---

export const getPersona = async (): Promise<BrandPersona> => {
    const res = await query("SELECT value FROM settings WHERE key = 'persona'");
    if (res.rows.length > 0) return res.rows[0].value;
    return 'friendly_and_helpful';
};

export const updatePersona = async (persona: BrandPersona): Promise<BrandPersona> => {
    const res = await query(
        `INSERT INTO settings (key, value) VALUES ('persona', $1) 
         ON CONFLICT (key) DO UPDATE SET value = $1 
         RETURNING value`,
        [JSON.stringify(persona)] // Supabase handles JSONB but sometimes explicit stringify helps with drivers
    );
    // Ensure we return the raw string if it was stored as json
    const val = res.rows[0].value;
    return typeof val === 'string' ? val.replace(/"/g, '') as BrandPersona : val;
};

export const getApiProviders = async (): Promise<ApiProviderSettings[]> => {
    const res = await query("SELECT value FROM settings WHERE key = 'api_providers'");
    if (res.rows.length > 0) return res.rows[0].value;
    return [{ provider_name: 'gemini', api_key_env_var_name: 'API_KEY', is_active: true, priority: 1 }];
};

export const updateApiProviders = async (providers: ApiProviderSettings[]): Promise<ApiProviderSettings[]> => {
    const sortedProviders = providers.sort((a, b) => a.priority - b.priority);
    sortedProviders.forEach((p, index) => { p.priority = index + 1; });
    
    const res = await query(
        `INSERT INTO settings (key, value) VALUES ('api_providers', $1) 
         ON CONFLICT (key) DO UPDATE SET value = $1 
         RETURNING value`,
        [JSON.stringify(sortedProviders)]
    );
    return res.rows[0].value;
};
