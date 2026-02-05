
import {
    type Product,
    type Article,
    ContentStatus,
    type Opportunity,
    type AbTest,
    type PerformanceMetrics,
    type BrandPersona,
    type Task,
    type Guide,
    AnalysisResult,
    ApiProviderSettings,
} from '../types';

const API_BASE = '/api';

// Dynamic import for mock data to keep initial bundle size small
// and only load if the backend is unreachable.
const loadMockData = async (endpoint: string): Promise<any> => {
    const { mockProducts, mockArticles, mockGuides } = await import('../utils/mockData');
    
    if (endpoint.includes('/products')) return mockProducts;
    if (endpoint.includes('/articles')) return mockArticles;
    if (endpoint.includes('/guides')) return mockGuides;
    if (endpoint.includes('/settings/status')) return [{ provider_name: 'gemini', api_key_env_var_name: 'API_KEY', isConfigured: true, is_active: true, priority: 1 }];
    if (endpoint.includes('/settings/persona')) return { persona: 'friendly_and_helpful' };
    
    if (endpoint.includes('/tasks/')) {
        return {
            taskId: 'mock_task',
            status: 'succeeded',
            agent: 'MastermindOrchestrator',
            progress: 100,
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
            contentId: 1,
            result: mockProducts[0].analysisResult 
        };
    }
    return null;
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    const method = options.method?.toUpperCase() || 'GET';
    
    // Secure Auth Injection
    const adminPassword = sessionStorage.getItem('adminPassword');
    if (adminPassword) {
        headers['Authorization'] = `Bearer ${adminPassword}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
            // Detect if API is completely missing (Frontend-only mode)
            if (response.status === 404 && response.url.includes('/api/')) {
                throw new Error('API_NOT_FOUND'); 
            }
            const errorData = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
            throw new Error(errorData.message || `Request failed: ${response.status}`);
        }

        if (response.status === 204) return null as unknown as T;
        return response.json();

    } catch (error) {
        const isApiMissing = error instanceof Error && (error.message === 'API_NOT_FOUND' || error.message.includes('Failed to fetch'));
        
        if (isApiMissing) {
            console.warn(`⚠️ Backend unreachable for ${url}. Switching to Simulation Mode.`);
            if (method === 'GET') {
                const mock = await loadMockData(url);
                if (mock) return mock as T;
            } else {
                // Simulate successful write action
                return { task_id: `mock_task_${Date.now()}`, content_id: 1, status: 'success' } as unknown as T;
            }
        }
        throw error;
    }
}

// --- Typed API Methods ---

export const getProducts = () => apiRequest<Product[]>('/products');
export const getArticles = () => apiRequest<Article[]>('/articles');
export const getGuides = () => apiRequest<Guide[]>('/guides');
export const getSettingsStatus = () => apiRequest<(ApiProviderSettings & { isConfigured: boolean })[]>('/settings/status');

export const createGuide = (title: string, html_content: string, embedded_product_ids: number[]) => 
    apiRequest<Guide>('/guides', { method: 'POST', body: JSON.stringify({ title, html_content, embedded_product_ids }) });

export const updateGuide = (id: number, updates: Partial<Guide>) => 
    apiRequest<Guide>(`/guides/${id}`, { method: 'PUT', body: JSON.stringify(updates) });

export const deleteGuide = (id: number) => apiRequest(`/guides/${id}`, { method: 'DELETE' });

export const createAnalysisTask = (name: string, url: string) => 
    apiRequest<{ task_id: string; content_id: number }>('/products', { method: 'POST', body: JSON.stringify({ name, url }) });

export const getTaskStatus = (taskId: string) => apiRequest<Task>(`/tasks/${taskId}`);

export const deleteContent = (contentId: number) => apiRequest(`/content/${contentId}`, { method: 'DELETE' });

export const updateContentStatus = (contentId: number, status: ContentStatus) => 
    apiRequest<Product | Article | Guide>(`/content/${contentId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const findOpportunities = () => apiRequest<{ task_id: string }>('/agents/opportunity-hunter', { method: 'POST' });

export const monitorContentHealth = () => apiRequest<{ task_id: string }>('/agents/market-sentinel', { method: 'POST' });

export const generateTrendArticle = (topic: string) => 
    apiRequest<{ task_id: string; content_id: number }>('/articles', { method: 'POST', body: JSON.stringify({ topic }) });

export const generateSeoStrategy = (targetKeyword: string) => 
    apiRequest<{ task_id: string }>('/agents/seo-strategist', { method: 'POST', body: JSON.stringify({ targetKeyword }) });

export const generateImprovementSuggestions = (content_id: number) => 
    apiRequest<{ task_id: string }>(`/products/${content_id}/suggestions`, { method: 'POST' });

export const enhanceHtmlContent = (content_id: number, feedback: string) => 
    apiRequest<{ task_id: string }>(`/products/${content_id}/enhance`, { method: 'POST', body: JSON.stringify({ feedback }) });

export const generateArticleImprovementSuggestions = (article_id: number) => 
    apiRequest<{ task_id: string }>(`/articles/${article_id}/suggestions`, { method: 'POST' });

export const enhanceArticleContent = (article_id: number, feedback: string) => 
    apiRequest<{ task_id: string }>(`/articles/${article_id}/enhance`, { method: 'POST', body: JSON.stringify({ feedback }) });

export const enhanceArticleWithAllSuggestions = (article_id: number, suggestions: string[]) => {
    const feedback = `Apply all of the following suggestions: ${suggestions.join('; ')}`;
    return enhanceArticleContent(article_id, feedback);
};

export const generateAbTest = (product: Product, metrics: PerformanceMetrics) => 
    apiRequest<{ task_id: string }>(`/products/${product.id}/ab-test`, { method: 'POST', body: JSON.stringify({ metrics }) });

export const generateVisuals = (productId: number, prompt: string, type: 'featured' | 'banner') => 
    apiRequest<{ task_id: string }>(`/products/${productId}/visuals`, { method: 'POST', body: JSON.stringify({ prompt, type }) });

export const generateVideoScript = (productId: number) => 
    apiRequest<{ task_id: string }>(`/products/${productId}/video-script`, { method: 'POST' });

export const getBrandPersona = () => apiRequest<{ persona: BrandPersona }>('/settings/persona');

export const updateBrandPersona = (persona: BrandPersona) => 
    apiRequest<{ persona: BrandPersona }>('/settings/persona', { method: 'PUT', body: JSON.stringify({ persona }) });

export const runAutolink = (contentId: number, contentType: 'article' | 'guide') => 
    apiRequest<{ task_id: string }>(`/content/${contentId}/autolink`, { method: 'POST', body: JSON.stringify({ contentType }) });

export const refreshProductAnalysis = (productId: number) => 
    apiRequest<{ task_id: string }>(`/products/${productId}/refresh`, { method: 'POST' });

export const acceptUpdate = (productId: number, newAnalysis: AnalysisResult) => 
    apiRequest<Product>(`/products/${productId}/accept-update`, { method: 'POST', body: JSON.stringify({ newAnalysis }) });

export const discardUpdate = (productId: number) => 
    apiRequest<Product>(`/products/${productId}/discard-update`, { method: 'POST' });
