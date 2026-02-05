
import { useState, useMemo, useCallback } from 'react';
import type { Product, Article, Guide, Task, AbTest, SeoStrategyReport, ConfirmedAction, Opportunity, AnalysisResult, VideoScript } from '../types';
import { ContentStatus } from '../types';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTaskMonitor } from './useTaskMonitor';
import * as mastermindService from '../services/mastermindService';

export const useDashboardLogic = () => {
    const { products, articles, addProduct, updateProduct, removeProduct, addArticle, updateArticle, removeArticle, updateGuide, setArticles, setProducts } = useData();
    const { showNotification } = useNotification();
    const { isConfigured } = useSettings();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<ContentStatus | 'ALL'>('ALL');
    const [activeTab, setActiveTab] = useState('products');
    const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);

    // Modal State
    const [taskForModal, setTaskForModal] = useState<Task | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [articleToPreview, setArticleToPreview] = useState<Article | null>(null);
    const [abTestToShow, setAbTestToShow] = useState<AbTest | null>(null);
    const [seoReportToShow, setSeoReportToShow] = useState<SeoStrategyReport | null>(null);
    const [initialModalTab, setInitialModalTab] = useState('review');
    const [itemToDelete, setItemToDelete] = useState<Product | Article | Guide | null>(null);
    const [productToConfirmAction, setProductToConfirmAction] = useState<Product | null>(null);
    const [actionToConfirm, setActionToConfirm] = useState<ConfirmedAction | null>(null);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

    // --- Task Monitoring Callback ---
    const handleTaskUpdate = useCallback((task: Task) => {
        if (task.status === 'succeeded' && task.result) {
            // 1. Core Completion Handlers
            if (task.agent === 'MastermindOrchestrator') {
                const product = products.find(p => p.id === task.contentId);
                if (product) {
                    const finalResult = task.result as AnalysisResult;
                    showNotification(`Analysis for "${product.title}" completed!`, 'success');
                    updateProduct({ ...product, status: ContentStatus.COMPLETED, analysisResult: finalResult, score: finalResult.product_analysis.overall_score, activeTask: undefined });
                    setTaskForModal(null);
                }
            } else if (task.agent === 'ArticleGeneratorOrchestrator') {
                const article = articles.find(a => a.id === task.contentId);
                if (article) {
                    const finalArticle = task.result as Article;
                    showNotification(`Article "${finalArticle.title || article.title}" generated!`, 'success');
                    updateArticle({ ...finalArticle, status: ContentStatus.DRAFT, activeTask: undefined });
                    setTaskForModal(null);
                }
            } 
            // 2. Sub-Task Handlers (Typed Payloads)
            else if (task.result && typeof task.result === 'object' && 'type' in task.result && 'payload' in task.result) {
                const { type, payload } = task.result as any;
                switch (type) {
                    case 'suggestion_result':
                        if (payload.content_type === 'product') {
                            const p = products.find(i => i.id === payload.content_id);
                            if (p) {
                                const updated = { ...p, suggestionsLoading: false, enhancementSuggestions: payload.suggestions };
                                updateProduct(updated);
                                setSelectedProduct(curr => curr?.id === p.id ? updated : curr);
                            }
                        } else if (payload.content_type === 'article') {
                            const a = articles.find(i => i.id === payload.content_id);
                            if (a) {
                                const updated = { ...a, suggestionsLoading: false, enhancementSuggestions: payload.suggestions };
                                updateArticle(updated);
                                setArticleToPreview(curr => curr?.id === a.id ? updated : curr);
                            }
                        }
                        showNotification('Suggestions are ready!', 'success');
                        break;
                    case 'enhancement_result':
                        if (payload.content_type === 'product') {
                            const p = products.find(i => i.id === payload.content_id);
                            if (p && p.analysisResult) {
                                const newRes = { ...p.analysisResult, final_output: { html_content: payload.html_content }};
                                const updated = { ...p, enhancementLoading: false, analysisResult: newRes, isEnhanced: true, enhancementSuggestions: [] };
                                updateProduct(updated);
                                setSelectedProduct(curr => curr?.id === p.id ? updated : curr);
                            }
                        } else if (payload.content_type === 'article') {
                            const a = articles.find(i => i.id === payload.content_id);
                            if (a) {
                                const updated = { ...a, enhancementLoading: false, analysisResult: payload.analysisResult, enhancementSuggestions: [] };
                                updateArticle(updated);
                                setArticleToPreview(curr => curr?.id === a.id ? updated : curr);
                            }
                        }
                        showNotification('Content enhanced successfully!', 'success');
                        break;
                    case 'autolink_result':
                        showNotification('Internal linking complete!', 'success');
                        if (payload.contentType === 'article') {
                            const a = articles.find(i => i.id === payload.contentId);
                            if (a && a.analysisResult) {
                                const updated = { ...a, analysisResult: { ...a.analysisResult, html_content: payload.newHtmlContent }, activeTask: undefined };
                                updateArticle(updated);
                                setArticleToPreview(curr => curr?.id === a.id ? updated : curr);
                            }
                        }
                        break;
                    case 'ab_test_result':
                        setAbTestToShow(payload as AbTest);
                        showNotification('A/B test suggestion is ready!', 'success');
                        break;
                    case 'visual_asset_result':
                        const pVis = products.find(i => i.id === payload.content_id);
                        if(pVis) {
                            const visualAssets = pVis.visualAssets || {};
                            if (payload.image_type === 'featured') visualAssets.featuredImage = payload.image_data;
                            else visualAssets.bannerImage = payload.image_data;
                            const updated = { ...pVis, visualsLoading: false, visualAssets };
                            updateProduct(updated);
                            setSelectedProduct(curr => curr?.id === pVis.id ? updated : curr);
                        }
                        showNotification('Visual asset generated!', 'success');
                        break;
                    case 'video_script_result':
                        const pVid = products.find(i => i.id === payload.content_id);
                        if (pVid) {
                            const updated = { ...pVid, scriptLoading: false, videoScript: payload.script as VideoScript };
                            updateProduct(updated);
                            setSelectedProduct(curr => curr?.id === pVid.id ? updated : curr);
                        }
                        showNotification('Video script generated!', 'success');
                        break;
                    case 'opportunity_hunter_result':
                        setOpportunities(payload as Opportunity[]);
                        showNotification('Found new market opportunities!', 'success');
                        break;
                    case 'seo_strategy_result':
                        showNotification(`SEO Strategy for "${payload.targetKeyword}" is ready!`, 'success');
                        setSeoReportToShow(payload as SeoStrategyReport);
                        break;
                    case 'market_sentinel_result':
                        const staleMap = new Map((payload as {id: number, reason: string}[]).map(i => [i.id, i.reason]));
                        setProducts(prev => prev.map(p => staleMap.has(p.id) ? { ...p, status: ContentStatus.STALE, staleReason: staleMap.get(p.id) } : p));
                        showNotification(`Market Sentinel found ${payload.length} stale products.`, 'info');
                        break;
                    case 'refresh_analysis_result':
                        const pRef = products.find(i => i.id === payload.contentId);
                        if (pRef) {
                            updateProduct({ ...pRef, status: ContentStatus.STALE, newAnalysis: payload.newAnalysis, diffReport: payload.diffReport, activeTask: undefined });
                            showNotification(`Update analysis for "${pRef.title}" is ready for review!`, 'success');
                        }
                        break;
                }
            }
        } else if (task.status === 'failed') {
            // Error handling logic
            const content = products.find(p => p.id === task.contentId) || articles.find(a => a.id === task.contentId);
            if (content) {
                showNotification(`Task failed: ${task.error?.message}`, 'error');
                // Reset loading states based on context would go here in a more granular implementation
                if (['MastermindOrchestrator', 'ArticleGeneratorOrchestrator'].includes(task.agent)) {
                     setTimeout(() => setTaskForModal(null), 4000);
                }
            }
        } else if (task.status === 'running') {
            // Update active task state in UI if needed, though mostly handled by activeTaskIds
            if (['MastermindOrchestrator', 'ArticleGeneratorOrchestrator'].includes(task.agent)) {
                setTaskForModal(prev => prev?.taskId === task.taskId ? task : prev);
            }
        }
    }, [products, articles, showNotification, updateProduct, updateArticle, setProducts, setArticles]);

    const { addTask, activeTaskIds } = useTaskMonitor(handleTaskUpdate);

    // --- Actions ---

    const handleAddProduct = async (productName: string, affiliateUrl: string) => {
        if (!isConfigured) { showNotification('Configure AI provider settings first.', 'info'); return; }
        
        const tempId = `temp_prod_${Date.now()}`;
        const tempProduct: Product = { id: -1, tempId, title: productName, affiliate_url: affiliateUrl, status: ContentStatus.ANALYZING, score: 0, keywords: '', created_at: new Date().toISOString() };
        addProduct(tempProduct);

        try {
            const { task_id, content_id } = await mastermindService.createAnalysisTask(productName, affiliateUrl);
            const initialTask = await mastermindService.getTaskStatus(task_id);
            setProducts(prev => prev.map(p => p.tempId === tempId ? { ...p, id: content_id, tempId: undefined, activeTask: initialTask } : p));
            if (initialTask) setTaskForModal(initialTask);
            addTask(task_id);
        } catch (error) {
            showNotification(`Error: ${error instanceof Error ? error.message : "Failed"}`, 'error');
            setProducts(prev => prev.filter(p => p.tempId !== tempId));
            setTaskForModal(null);
        }
    };

    const handleGenerateArticle = async (topic: string) => {
        if (!isConfigured) { showNotification('Configure AI provider settings first.', 'info'); return null; }
        const tempId = `temp_art_${Date.now()}`;
        addArticle({ id: -1, tempId, title: topic, status: ContentStatus.GENERATING, created_at: new Date().toISOString(), score: 0, keywords: '' } as Article);

        try {
            const { task_id, content_id } = await mastermindService.generateTrendArticle(topic);
            setArticles(prev => prev.map(a => a.tempId === tempId ? { ...a, id: content_id, tempId: undefined } : a));
            addTask(task_id);
            return { taskId: task_id, contentId: content_id };
        } catch (error) {
            setArticles(prev => prev.filter(a => a.tempId !== tempId));
            showNotification(`Error: ${error instanceof Error ? error.message : "Failed"}`, 'error');
            return null;
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        const id = itemToDelete.id;
        const title = itemToDelete.title;
        
        if ('affiliate_url' in itemToDelete) removeProduct(id);
        else if (!('embedded_product_ids' in itemToDelete)) removeArticle(id);
        setItemToDelete(null);

        try {
            await mastermindService.deleteContent(id);
            showNotification(`"${title}" deleted.`, 'success');
        } catch(error) {
            showNotification(`Failed to delete "${title}".`, 'error');
            // Force reload to sync state if delete failed
            window.location.reload(); 
        }
    };

    const handleConfirmAction = async () => {
        if (!productToConfirmAction || !actionToConfirm) return;
        const newStatus = actionToConfirm === 'PUBLISH' ? ContentStatus.PUBLISHED : ContentStatus.COMPLETED;
        updateProduct({ ...productToConfirmAction, status: newStatus });
        setProductToConfirmAction(null); setActionToConfirm(null);
        
        try {
            await mastermindService.updateContentStatus(productToConfirmAction.id, newStatus);
            showNotification(`"${productToConfirmAction.title}" updated.`, 'success');
        } catch(error) {
            showNotification(`Failed to update status.`, 'error');
            updateProduct(productToConfirmAction);
        }
    };

    const executeProductAction = async (product: Product, actionName: string, apiCall: () => Promise<{task_id: string}>, loadingKey?: keyof Product) => {
        if (!isConfigured) { showNotification('Configure AI provider settings first.', 'info'); return; }
        if (loadingKey) {
            const update = { ...product, [loadingKey]: true };
            updateProduct(update);
            setSelectedProduct(update);
        }
        try {
            const { task_id } = await apiCall();
            addTask(task_id);
        } catch (e) {
            showNotification(`Failed to start ${actionName}.`, 'error');
            if (loadingKey) updateProduct({ ...product, [loadingKey]: false });
        }
    };

    const filteredProducts = useMemo(() => {
        return products
            .filter(p => filterStatus === 'ALL' || p.status === filterStatus)
            .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, filterStatus, searchTerm]);

    return {
        state: { 
            searchTerm, filterStatus, activeTab, isCommandBarOpen,
            taskForModal, selectedProduct, articleToPreview, abTestToShow, seoReportToShow,
            itemToDelete, productToConfirmAction, actionToConfirm, opportunities, initialModalTab
        },
        setters: {
            setSearchTerm, setFilterStatus, setActiveTab, setIsCommandBarOpen,
            setTaskForModal, setSelectedProduct, setArticleToPreview, setAbTestToShow, setSeoReportToShow,
            setItemToDelete, setProductToConfirmAction, setActionToConfirm, setOpportunities, setInitialModalTab
        },
        computed: { filteredProducts, activeTaskIds },
        actions: {
            handleAddProduct,
            handleGenerateArticle,
            handleDelete,
            handleConfirmAction,
            onGetSuggestions: async (p: Product) => executeProductAction(p, 'Suggestions', () => mastermindService.generateImprovementSuggestions(p.id), 'suggestionsLoading'),
            onEnhanceProduct: async (p: Product, f: string) => executeProductAction(p, 'Enhancement', () => mastermindService.enhanceHtmlContent(p.id, f), 'enhancementLoading'),
            onGenerateAbTest: async (p: Product) => executeProductAction(p, 'A/B Test', () => mastermindService.generateAbTest(p, p.performanceMetrics!), undefined),
            onGenerateVisuals: async (p: Product, prompt: string, type: 'featured' | 'banner') => executeProductAction(p, 'Visuals', () => mastermindService.generateVisuals(p.id, prompt, type), 'visualsLoading'),
            onGenerateVideoScript: async (p: Product) => executeProductAction(p, 'Video Script', () => mastermindService.generateVideoScript(p.id), 'scriptLoading'),
            onRefreshProduct: async (p: Product) => executeProductAction(p, 'Refresh', () => mastermindService.refreshProductAnalysis(p.id), undefined),
            
            onGetArticleSuggestions: async (a: Article) => {
                if(!isConfigured) { showNotification('Config required', 'info'); return; }
                updateArticle({...a, suggestionsLoading: true}); setArticleToPreview({...a, suggestionsLoading: true});
                const { task_id } = await mastermindService.generateArticleImprovementSuggestions(a.id);
                addTask(task_id);
            },
            onEnhanceArticle: async (a: Article, f: string) => {
                if(!isConfigured) { showNotification('Config required', 'info'); return; }
                updateArticle({...a, enhancementLoading: true}); setArticleToPreview({...a, enhancementLoading: true});
                const { task_id } = await mastermindService.enhanceArticleContent(a.id, f);
                addTask(task_id);
            },
            onEnhanceArticleAll: async (a: Article) => {
                if(!isConfigured) { showNotification('Config required', 'info'); return; }
                if(!a.enhancementSuggestions?.length) return;
                updateArticle({...a, enhancementLoading: true}); setArticleToPreview({...a, enhancementLoading: true});
                const { task_id } = await mastermindService.enhanceArticleWithAllSuggestions(a.id, a.enhancementSuggestions);
                addTask(task_id);
            },
            onRunAutolink: async (id: number, type: 'article'|'guide') => {
                try {
                    const { task_id } = await mastermindService.runAutolink(id, type);
                    addTask(task_id);
                    showNotification('Internal linking agent dispatched!', 'info');
                } catch(e) { showNotification('Failed to start linking.', 'error'); }
            },
            onAcceptUpdate: async (p: Product) => {
                if (!p.newAnalysis) return;
                const orig = { ...p };
                updateProduct({ ...p, analysisResult: p.newAnalysis, score: p.newAnalysis.product_analysis.overall_score, status: ContentStatus.COMPLETED, newAnalysis: undefined, diffReport: undefined, staleReason: undefined });
                setSelectedProduct(null);
                try { await mastermindService.acceptUpdate(p.id, p.newAnalysis); showNotification('Updated.', 'success'); }
                catch(e) { showNotification('Failed.', 'error'); updateProduct(orig); }
            },
            onDiscardUpdate: async (p: Product) => {
                const orig = { ...p };
                updateProduct({ ...p, status: ContentStatus.PUBLISHED, newAnalysis: undefined, diffReport: undefined, staleReason: undefined });
                setSelectedProduct(null);
                try { await mastermindService.discardUpdate(p.id); showNotification('Discarded.', 'info'); }
                catch(e) { showNotification('Failed.', 'error'); updateProduct(orig); }
            }
        }
    };
};
