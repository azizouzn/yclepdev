



import { ContentStatus, type AnalysisResult, type Article, type CompetitorAnalysis, type SeoMetadata, type DistributionAssets, type ArticleAnalysisResult, TaskError, VideoScript, Guide, SeoStrategyReport, ExecutionPlan, AgentName, ProductAnalysis, DataQualityMetrics, NewsItem, EditorialReview } from '../../types';
import * as dataService from './dataService';
import { taskService } from './taskService';
import * as aiOrchestrator from './aiOrchestratorService';
import * as geminiService from './geminiService';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 500; // ms
const QUALITY_SCORE_THRESHOLD = 75; // Quality Gate Threshold

// --- UTILITY FUNCTIONS ---

async function executeAgentWithRetry<T>(
    agentFunction: (...args: any[]) => Promise<T>,
    ...args: any[]
): Promise<T> {
    let attempt = 1;
    while (attempt <= MAX_ATTEMPTS) {
        try {
            const result = await agentFunction(...args);
            return result;
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${agentFunction.name}:`, error);
            if (attempt < MAX_ATTEMPTS) {
                const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            attempt++;
        }
    }
    throw new Error(`Agent ${agentFunction.name} failed after ${MAX_ATTEMPTS} attempts.`);
}

const triggerNextStep = (taskId: string) => {
    // Fire-and-forget fetch call to continue the task in a new function invocation
    const continueUrl = new URL(`/api/tasks/continue`, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    fetch(continueUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
    }).catch(error => {
        console.error(`[${taskId}] FAILED TO TRIGGER NEXT STEP:`, error);
        taskService.fail(taskId, { code: 'TRIGGER_FAILED', message: 'Failed to trigger next step.', phase: 'orchestration' });
    });
};

const handleOrchestrationFailure = async (taskId: string, contentId: number | null, error: unknown, startTime: number) => {
    const errorMessage = error instanceof Error ? error.message : "An unknown orchestration error occurred.";
    console.error(`Orchestration failed for task ${taskId}:`, error);
    const taskError: TaskError = {
        code: 'ORCHESTRATION_FAILURE',
        message: errorMessage,
        phase: 'orchestration',
        rootCause: error instanceof Error ? error.stack : undefined,
        actionTaken: 'Task marked as failed. Manual intervention may be required.'
    };
    await taskService.fail(taskId, taskError, { latencyMs: Date.now() - startTime });
    if (contentId !== null && contentId > 0) {
        await dataService.updateContentStatus(contentId, ContentStatus.FAILED);
    }
};

// --- PRODUCT ANALYSIS ORCHESTRATION ---

export const startFullAnalysis = async (taskId: string, contentId: number, productName: string, productUrl: string) => {
    const startTime = Date.now();
    await taskService.start(taskId);

    try {
        await taskService.setCurrentStage(taskId, 'agent_mastermind', 5);
        const plan = await executeAgentWithRetry(geminiService.runMastermindAgent, productName, productUrl);
        const persona = await dataService.getPersona();
        
        await taskService.update(taskId, {
            plan,
            context: { productName, productUrl, contentId, persona },
            completedSteps: [],
        });
        
        triggerNextStep(taskId);

    } catch (error) {
        await handleOrchestrationFailure(taskId, contentId, error, startTime);
    }
};

export const continueFullAnalysis = async (taskId: string) => {
    const startTime = Date.now();
    const task = await taskService.get(taskId);

    if (!task || !task.plan || !task.context || !task.completedSteps) {
        console.error(`[${taskId}] Task is not properly initialized for continuation.`);
        return;
    }
    
    const { plan, context, completedSteps, contentId } = task;

    try {
        const nextStep = plan
            .sort((a, b) => a.step - b.step)
            .find(step => !step.agents.every(a => completedSteps.includes(a.agent.toString())));

        if (!nextStep) {
            // FINALIZATION
            await taskService.setCurrentStage(taskId, 'Finalizing Result', 95);
            
            const finalResult: AnalysisResult = {
                product_analysis: context.productAnalysis,
                competitor_analysis: context.competitorAnalysis,
                seo_metadata: context.seoMetadata,
                data_quality_metrics: context.dataQualityMetrics,
                final_output: context.final_output,
                distribution_assets: context.distributionAssets,
                news_feed: context.newsFeed,
                internalLinkSuggestions: (context as any).internalLinkSuggestions || [],
                improvementActions: (context as any).improvementActions || [],
            };

            // --- QUALITY GATE GUARDRAIL ---
            // If the data quality score is too low, flag the content as STALE (Needs Review) instead of COMPLETED.
            let finalStatus = ContentStatus.COMPLETED;
            let staleReason: string | undefined = undefined;

            if (finalResult.data_quality_metrics && finalResult.data_quality_metrics.overall_score < QUALITY_SCORE_THRESHOLD) {
                finalStatus = ContentStatus.STALE;
                staleReason = `AI Quality Gate Failed: Score ${finalResult.data_quality_metrics.overall_score}/100 (Threshold: ${QUALITY_SCORE_THRESHOLD})`;
                
                await dataService.createSystemEvent('QUALITY_GATE', `Analysis for "${context.productName}" failed quality check.`, { 
                    score: finalResult.data_quality_metrics.overall_score,
                    threshold: QUALITY_SCORE_THRESHOLD
                });
            }

            await dataService.updateProduct(contentId, {
                analysisResult: finalResult,
                score: finalResult.product_analysis.overall_score,
                keywords: finalResult.seo_metadata.primary_keywords.join(', '),
                status: finalStatus,
                staleReason: staleReason,
                videoScript: context.videoScript
            });
            
            await taskService.succeed(taskId, finalResult, { latencyMs: Date.now() - new Date(task.startedAt).getTime() });
            return;
        }

        // EXECUTE NEXT STEP
        const totalAgents = plan.flatMap(step => step.agents).length;
        await taskService.setCurrentStage(taskId, nextStep.title, Math.round(((completedSteps.length + 1) / (totalAgents + 2)) * 100));

        const agentsToRun = nextStep.agents.filter(a => !completedSteps.includes(a.agent));

        const agentPromises = agentsToRun.map(agentInfo => {
            const agentKey = `run${agentInfo.agent.split('_').slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`;
            const agentFunction = (geminiService as any)[agentKey];
            if (typeof agentFunction !== 'function') throw new Error(`Agent function '${agentKey}' not found.`);

            const args: any[] = [];
            // Dependency injection
            if (agentInfo.agent === 'agent_data_scout') args.push(context.productName, context.productUrl);
            else if (agentInfo.agent === 'agent_news_aggregator') args.push(context.productName);
            else if (agentInfo.agent === 'agent_competitor_analyzer') args.push(context.productName, context.productAnalysis.category);
            else if (agentInfo.agent === 'agent_copywriter_agent') args.push(context.productName, { product_analysis: context.productAnalysis, competitor_analysis: context.competitorAnalysis, seo_metadata: context.seoMetadata }, context.persona);
            else if (agentInfo.agent === 'agent_video_scriptwriter') args.push({ product_analysis: context.productAnalysis, competitor_analysis: context.competitorAnalysis, seo_metadata: context.seoMetadata, final_output: {html_content: ''}, distribution_assets: { social_media: {twitter: '', facebook: ''}, email: { subject: '', body: ''}}, data_quality_metrics: { overall_score: 0, breakdown: { entitiesCoverage: 0, structure: 0, dataPoints: 0, comparisons: 0, schemaReady: 0, readability: 0 } }});
            else if (agentInfo.agent === 'agent_visual_designer') args.push(context.html_with_placeholders);
            else if (agentInfo.agent === 'agent_data_quality_inspector') args.push(context);
            
            return executeAgentWithRetry(agentFunction, ...args).then(result => ({ agent: agentInfo.agent, result }));
        });

        const results = await Promise.all(agentPromises);
        
        const newContext = { ...context };
        const newCompletedSteps = [...completedSteps];

        for (const { agent, result } of results) {
            if (agent === 'agent_data_scout') newContext.productAnalysis = result as ProductAnalysis;
            else if (agent === 'agent_news_aggregator') newContext.newsFeed = result as NewsItem[];
            else if (agent === 'agent_competitor_analyzer') {
                const res = result as { competitorAnalysis: CompetitorAnalysis; seoMetadata: SeoMetadata };
                newContext.competitorAnalysis = res.competitorAnalysis;
                newContext.seoMetadata = res.seoMetadata;
            }
            else if (agent === 'agent_copywriter_agent') {
                const res = result as { final_output: { html_content: string }, distribution_assets: DistributionAssets };
                newContext.html_with_placeholders = res.final_output.html_content;
                newContext.distributionAssets = res.distribution_assets;
            }
            else if (agent === 'agent_video_scriptwriter') newContext.videoScript = result as VideoScript;
            else if (agent === 'agent_visual_designer') newContext.final_output = { html_content: result as string };
            else if (agent === 'agent_data_quality_inspector') newContext.dataQualityMetrics = result as DataQualityMetrics;
            newCompletedSteps.push(agent);
        }

        await taskService.update(taskId, { context: newContext, completedSteps: newCompletedSteps });
        triggerNextStep(taskId);

    } catch(error) {
        await handleOrchestrationFailure(taskId, contentId, error, startTime);
    }
};

// --- ARTICLE GENERATION ORCHESTRATION ---

export const startArticleGeneration = async (taskId: string, contentId: number, topic: string) => {
    const startTime = Date.now();
    await taskService.start(taskId);
    try {
        const persona = await dataService.getPersona();
        await taskService.update(taskId, {
            context: { topic, persona },
            completedSteps: [],
        });
        triggerNextStep(taskId);
    } catch (error) {
        await handleOrchestrationFailure(taskId, contentId, error, startTime);
    }
};

export const continueArticleGeneration = async (taskId: string) => {
    const startTime = Date.now();
    const task = await taskService.get(taskId);
    if (!task || !task.context) return;
    const { contentId, context } = task;

    try {
        // Step 1: Initial Draft
        await taskService.setCurrentStage(taskId, 'Writing Initial Draft', 30);
        const articleResult = await executeAgentWithRetry<ArticleAnalysisResult>(aiOrchestrator.execute, 'runArticleGenerator', context.topic, context.persona);
        
        // Step 2: The Editorial Council (Karpathy Style Multi-Agent Debate)
        await taskService.setCurrentStage(taskId, 'Editorial Council Meeting (Debate)', 60);
        const critiqueResult = await executeAgentWithRetry<EditorialReview>(aiOrchestrator.execute, 'runEditorialCouncil', articleResult.html_content, context.topic);
        
        // Step 3: Revision (if needed)
        let finalHtml = articleResult.html_content;
        if (critiqueResult.consensusDecision !== 'APPROVE') {
             await taskService.setCurrentStage(taskId, 'Applying Editorial Revisions', 75);
             finalHtml = await executeAgentWithRetry<string>(aiOrchestrator.execute, 'runRevisionAgent', articleResult.html_content, critiqueResult);
        }
        
        // Update result with council data for transparency
        articleResult.html_content = finalHtml;
        articleResult.editorialReview = critiqueResult;

        // Step 4: Visuals
        await taskService.setCurrentStage(taskId, 'Embedding Visuals', 90);
        finalHtml = await executeAgentWithRetry<string>(aiOrchestrator.execute, 'runVisualEmbedAgent', articleResult.html_content);
        articleResult.html_content = finalHtml;

        const updatedArticle = await dataService.updateArticle(contentId, {
            title: articleResult.title,
            analysisResult: articleResult,
            status: ContentStatus.DRAFT,
            keywords: articleResult.suggested_categories.join(', '),
        });
        
        await taskService.succeed(taskId, updatedArticle, { latencyMs: Date.now() - new Date(task.startedAt).getTime() });

    } catch (error) {
        await handleOrchestrationFailure(taskId, contentId, error, startTime);
    }
};


// --- OTHER ORCHESTRATORS ---

export const runVideoScriptGeneration = async (taskId: string, productId: number) => {
    const startTime = Date.now();
    try {
        await taskService.start(taskId);
        const product = await dataService.findProductById(productId);
        if (!product || !product.analysisResult) {
            throw new Error(`Product or analysis result not found for ID: ${productId}`);
        }
        
        await taskService.setCurrentStage(taskId, 'Writing Script', 50);
        const script = await aiOrchestrator.execute<VideoScript>('runVideoScriptwriter', product.analysisResult);

        await dataService.updateProduct(productId, { videoScript: script });
        
        const latencyMs = Date.now() - startTime;
        await taskService.succeed(taskId, {
            type: 'video_script_result',
            payload: { content_id: productId, script }
        }, { latencyMs });

    } catch (error) {
        const taskError: TaskError = {
            code: 'VIDEO_SCRIPT_AGENT_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error during video script generation.',
            phase: 'processing',
        };
        await taskService.fail(taskId, taskError, { latencyMs: Date.now() - startTime });
    }
};

export const runSeoStrategyGeneration = async (taskId: string, targetKeyword: string) => {
    const startTime = Date.now();
    try {
        await taskService.start(taskId);
        await taskService.setCurrentStage(taskId, 'Analyzing SEO Landscape', 50);
        
        const report = await aiOrchestrator.execute<SeoStrategyReport>('runSeoStrategistAgent', targetKeyword);
        
        const latencyMs = Date.now() - startTime;
        await taskService.succeed(taskId, {
            type: 'seo_strategy_result',
            payload: report
        }, { latencyMs });

    } catch (error) {
        const taskError: TaskError = {
            code: 'SEO_STRATEGIST_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error during SEO strategy generation.',
            phase: 'collection',
        };
        await taskService.fail(taskId, taskError, { latencyMs: Date.now() - startTime });
    }
};

export const runRefreshAnalysis = async (taskId: string, productId: number) => {
    const product = await dataService.findProductById(productId);
    if (!product) {
        const taskError: TaskError = { code: 'PRODUCT_NOT_FOUND', message: 'Product to refresh not found.', phase: 'orchestration' };
        await taskService.fail(taskId, taskError);
        return;
    }
    await dataService.updateProduct(productId, { status: ContentStatus.UPDATING });
    // Re-run the full analysis for the stale product.
    await startFullAnalysis(taskId, productId, product.title, product.affiliate_url);
};

export const runAutoLinking = async (taskId: string, contentId: number, contentType: 'article' | 'guide') => {
    const startTime = Date.now();
    try {
        await taskService.start(taskId);
        await taskService.setCurrentStage(taskId, 'Analyzing Content for Links', 50);

        let content: Article | Guide | undefined;
        if (contentType === 'article') {
            content = await dataService.findArticleById(contentId);
        } else {
            content = await dataService.findGuideById(contentId);
        }

        if (!content) {
            throw new Error(`Content with ID ${contentId} of type ${contentType} not found.`);
        }
        
        // FIX: Replaced property-based type guard with a more explicit check on contentType to resolve the type error.
        let htmlContent: string | undefined | null;
        if (contentType === 'article') {
            htmlContent = (content as Article).analysisResult?.html_content;
        } else {
            htmlContent = (content as Guide).html_content;
        }
        
        if (!htmlContent) {
            throw new Error('Content has no HTML to process.');
        }

        const allProducts = await dataService.getAllProducts();
        const linkableProducts = allProducts
            .filter(p => p.status === ContentStatus.PUBLISHED)
            .map(p => ({ id: p.id, title: p.title }));

        const newHtmlContent = await aiOrchestrator.execute<string>('runInternalLinkingAgent', htmlContent, linkableProducts);

        // FIX: Refactored update logic to be safer and correctly handle Article vs Guide types.
        if (contentType === 'article') {
            const article = content as Article;
            if (article.analysisResult) {
                article.analysisResult.html_content = newHtmlContent;
                await dataService.updateArticle(contentId, { analysisResult: article.analysisResult });
            }
        } else {
            await dataService.updateGuide(contentId, { html_content: newHtmlContent });
        }
        
        const latencyMs = Date.now() - startTime;
        await taskService.succeed(taskId, {
            type: 'autolink_result',
            payload: { contentId, contentType, newHtmlContent }
        }, { latencyMs });

    } catch (error) {
        const taskError: TaskError = {
            code: 'AUTOLINKING_FAILED',
            message: error instanceof Error ? error.message : 'Auto-linking agent failed.',
            phase: 'processing',
        };
        await taskService.fail(taskId, taskError, { latencyMs: Date.now() - startTime });
    }
};