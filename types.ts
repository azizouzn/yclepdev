export enum ContentStatus {
  // Task statuses
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  FAILED = 'failed',

  // Content statuses - 'draft' is used for articles, 'completed' for products
  DRAFT = 'draft',
  COMPLETED = 'completed', // Analysis is done, but not live
  PUBLISHED = 'published',
  STALE = 'stale', // Content flagged by Market Sentinel
  UPDATING = 'updating', // A refresh analysis is in progress for a stale product.
  
  // UI-only status for article generation
  GENERATING = 'generating',
}


export type AgentName = 'agent_mastermind' | 'agent_data_scout' | 'agent_competitor_analyzer' | 'agent_seo_extractor' | 'agent_copywriter_agent' | 'agent_visual_designer' | 'agent_data_quality_inspector' | 'agent_design_builder' | 'agent_performance_optimizer' | 'agent_video_scriptwriter' | 'agent_seo_strategist' | 'agent_personalization' | 'agent_command' | 'agent_internal_linker' | 'agent_news_aggregator';

// Command Bar Result Type
export interface CommandBarResult {
    action: 'UI_UPDATE' | 'SEARCH' | 'NAVIGATE' | 'ACTION';
    payload?: {
        name?: string;
        args?: Record<string, unknown>;
        [key: string]: unknown;
    };
}

// This is now obsolete and replaced by the new Task type
// export interface AgentStatus {
//   status: 'pending' | 'running' | 'completed' | 'failed';
//   error?: string;
// }
// export interface AnalysisStatus {
//   productName: string;
//   stages: Record<AgentName, AgentStatus>;
// }

// --- Mastermind Task Schema ---
export interface TaskError {
  code: string;
  message: string;
  phase: 'collection' | 'processing' | 'response' | 'integration' | 'orchestration';
  rootCause?: string;
  actionTaken?: string;
}

export interface TaskMetrics {
  latencyMs: number;
  tokensUsed?: number;
  confidenceScore?: number;
}
export interface ExecutionStep {
  step: number;
  title: string;
  agents: { agent: AgentName; title: string; }[]; // Array of agents to run in this step (concurrently if > 1)
}
export type ExecutionPlan = ExecutionStep[];

export interface Task {
  taskId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'rescued' | 'stale';
  startedAt: string; // ISO801
  finishedAt: string | null; // ISO801 or null
  agent: string; // The main orchestrator, e.g., 'MastermindOrchestrator'
  currentStage: string; // The current agent running, e.g., 'agent_data_scout' or a step title like "Parallel Content Generation"
  progress: number; // 0-100
  attempt: number;
    result?: unknown;
  error?: TaskError;
  metrics?: TaskMetrics;
  contentId: number;
  plan?: ExecutionPlan;
    context?: Record<string, unknown> | unknown;
    // Prefer `unknown` for untyped results/contexts and narrow at usage sites
  completedSteps?: string[];
}

// --- Enhanced Analysis Types with Evidence ---
export interface Evidence {
    url: string;
    title: string;
    source_type: 'official' | 'review_site' | 'forum';
}

export interface FactualStatement {
    statement: string;
    confidence: 'high' | 'medium' | 'low';
    evidence: Evidence[];
}

export interface ProductAnalysis {
  category: string;
  target_audience: string[];
  key_features: FactualStatement[];
  pros: FactualStatement[];
  cons: FactualStatement[];
  executiveSummary: string;
  summary: string;
  verdict: string;
  overall_score: number;
}


export interface Competitor {
  url: string;
  title: string;
  strengths: string[];
  weaknesses: string[];
  content_strategy: string;
  visitor_engagement_techniques: string[];
  persuasion_tactics: string[];
  ai_search_presence?: string; // New: How well this competitor ranks in AI answers
}

export interface CompetitivePositioning {
    x_axis_label: string;
    y_axis_label: string;
    competitors: {
        name: string;
        x: number; // 0-100
        y: number; // 0-100
    }[];
}

export interface CompetitorAnalysis {
  top_competitors: Competitor[];
  strategy_summary: string;
  identified_keywords: string[];
  market_gaps: string;
  offer_details: string;
  competitive_positioning: CompetitivePositioning;
  semantic_ranking_factors?: string[]; // New: From Advanced Architect
}

export interface SeoMetadata {
  title: string;
  titleVariations: string[];
  meta_description: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  schema_analysis: string;
  ai_citation_summary: string;
  faq_section: {
      question: string;
      answer: string;
  }[];
  data_points: string[];
  seo_score: number;
  jsonLd: string;
  voice_search_optimization?: string[]; // New: Voice search specific tips
  entity_graph?: string[]; // New: Related entities for knowledge graph
}

export interface DataQualityMetrics {
  overall_score: number;
  breakdown: {
    entitiesCoverage: number;
    structure: number;
    dataPoints: number;
    comparisons: number;
    schemaReady: number;
    readability: number;
  };
}

export interface FinalOutput {
  html_content: string;
}

export interface DistributionAssets {
    social_media: {
        twitter: string;
        facebook: string;
        linkedin?: string; // Added based on Python model
        instagram_caption?: string; // Added based on Python model
    };
    email: {
        subject: string;
        body: string;
    };
    voice_assistant_snippet?: string; // New: For Alexa/Siri/Google optimization
}

export interface VideoScriptScene {
    scene_number: number;
    visual: string; // Description of what's on screen
    dialogue: string; // Voiceover or on-screen text
}

export interface VideoScript {
    title: string;
    scenes: VideoScriptScene[];
    call_to_action: string;
}

export interface NewsItem {
    title: string;
    url: string;
    source: string;
    summary: string;
    published_at: string; // ISO 8601 date string
}

export interface ImprovementAction {
    priority: number;
    action: string;
    patch: string;
}


// This is the full result returned by the original analysis pipeline
export interface AnalysisResult {
  product_analysis: ProductAnalysis;
  competitor_analysis: CompetitorAnalysis;
  seo_metadata: SeoMetadata;
  seo_strategy_report?: SeoStrategyReport;
  data_quality_metrics: DataQualityMetrics;
  final_output: FinalOutput;
  distribution_assets: DistributionAssets;
  news_feed?: NewsItem[];
  internalLinkSuggestions: {url: string, anchor: string, reason: string}[];
  improvementActions: ImprovementAction[];
}

// --- LLM Council Types ---
export interface CouncilCritique {
    agentName: string; // e.g., "The Skeptic", "SEO Strategist"
    score: number; // 0-100
    critique: string; // The feedback
    requiredChanges: string[]; // Bullet points of mandatory fixes
}

export interface EditorialReview {
    critiques: CouncilCritique[];
    consensusDecision: 'APPROVE' | 'REVISE_REQUIRED' | 'REJECT';
    synthesis: string; // Summary of what needs to be done
}

// This matches the Article generation agent's output
export interface ArticleAnalysisResult {
    title: string;
    key_takeaways: string[];
    html_content: string;
    suggested_categories: string[];
    editorialReview?: EditorialReview; // New field for council feedback
}

// Base Content type reflecting the backend DB model
interface BaseContent {
    id: number;
    tempId?: string; // Temporary ID for optimistic UI updates
    title: string;
    status: ContentStatus;
    score: number;
    keywords: string;
    created_at: string; // ISO 8601 date string
    activeTask?: Task;
}

export interface PerformanceMetrics {
    pageViews: number;
    conversionRate: number; // As a percentage, e.g., 2.5
}

export interface VisualAssets {
    featuredImage?: string; // base64 data URL
    bannerImage?: string; // base64 data URL
    imagePrompts?: string[];
}

// Product is a specific type of Content
export interface Product extends BaseContent {
    affiliate_url: string;
    analysisResult?: AnalysisResult;
    isEnhanced?: boolean;
    enhancementLoading?: boolean;
    enhancementSuggestions?: string[];
    suggestionsLoading?: boolean;
    staleReason?: string;
    performanceMetrics?: PerformanceMetrics;
    visualAssets?: VisualAssets;
    visualsLoading?: boolean;
    videoScript?: VideoScript;
    scriptLoading?: boolean;
    // For Review Update Agent
    diffReport?: string;
    newAnalysis?: AnalysisResult;
}

// Article is another specific type of Content
export interface Article extends BaseContent {
    analysisResult?: ArticleAnalysisResult;
    enhancementSuggestions?: string[];
    suggestionsLoading?: boolean;
    enhancementLoading?: boolean;
}

// Guide is a new type of content
export interface Guide extends BaseContent {
    html_content: string;
    embedded_product_ids: number[];
}


export type SortOption = 'score' | 'name' | 'newest';
export type ConfirmedAction = 'PUBLISH' | 'UNPUBLISH';

// --- New Strategic Types ---

export type BrandPersona = 'witty_and_informal' | 'expert_and_technical' | 'friendly_and_helpful';

export interface Opportunity {
    id: string;
    topic: string;
    marketPotential: number; // Score 0-100
    competitionLevel: 'low' | 'medium' | 'high';
    source: string; // e.g., 'Amazon Movers & Shakers'
}

export interface AbTest {
    id: string;
    control: {
        headline: string;
        body: string;
    };
    variant: {
        headline: string;
        body: string;
    };
    reasoning: string;
}

// --- SEO Strategist Agent Types (Updated for Advanced Architect) ---
export interface KeywordAnalysis {
    keyword: string;
    volume: number; // Estimated 0-100
    competition: 'low' | 'medium' | 'high';
    relevance: number; // 0-100
}

export interface ContentStructureReport {
    recommendedWordCount: {
        min: number;
        max: number;
        average: number;
    };
    mustHaveSections: string[];
    keyTopics: string[];
    recommendedHeadingStructure: {
        H1: string;
        H2: string[];
        H3: string[];
    };
}

export interface CompetitiveGapAnalysis {
    missingKeywords: string[];
    underutilizedTopics: string[];
    uniqueAngleSuggestions: string[];
}

// New Type for Semantic SEO
export interface SemanticCluster {
    topic: string;
    keywords: string[];
    intent: string;
}

export interface SeoStrategyReport {
    targetKeyword: string;
    userIntent: 'Informational' | 'Commercial' | 'Navigational' | 'Transactional' | 'Unknown';
    keywordAnalysis: KeywordAnalysis[];
    contentStructureReport: ContentStructureReport;
    competitiveGapAnalysis: CompetitiveGapAnalysis;
    semanticTerms: string[];
    // New Advanced Architect Fields
    semanticClusters?: SemanticCluster[]; 
    aiSearchOptimization?: {
        voiceSearchQueries: string[];
        perplexityReadiness: string[];
        deepSearchTips: string[];
    };
}


// --- AI Command Bar Types ---

export interface UiUpdatePayload {
    name: 'navigateTo' | 'findContent';
    args?: unknown;
}

export interface ConfirmationPayload {
    message: string;
}

export type CommandBarResult = 
    | { action: 'UI_UPDATE', payload: UiUpdatePayload }
    | { action: 'CONFIRMATION', payload: ConfirmationPayload };

// --- AI Provider Settings ---
export interface ApiProviderSettings {
    provider_name: 'gemini'; // The only supported provider after evaluation.
    api_key_env_var_name: string;
    is_active: boolean;
    priority: number;
}

// --- System Health & Event Logging ---
export type SystemEventType = 'AI_FAILOVER' | 'AI_OPERATION' | 'QUALITY_GATE' | 'SECURITY_ALERT';

export interface SystemEvent {
    id: string;
    type: SystemEventType;
    timestamp: string; // ISO 8601
    read: boolean;
    details: {
        provider?: string;
        fallback_to?: string;
        error?: string;
        message: string;
        agent?: string;
        durationMs?: number;
        ip?: string;
        url?: string;
        score?: number;
        threshold?: number;
    };
}

// --- Agent Monitor Types ---
export interface AgentEvent {
  trace_id: string;
  step_index: number;
  agent_id: string;
  action: string;
  input: string;
  output: string;
  timestamp: string;
  logs?: string;
}

export interface MonitorReport {
  report_id: string;
  trace_id: string;
  agents_involved: string[];
  root_causes: { label: string; type: string; explanation: string; impact_score: number }[];
  severity: number;
  propagation_score: number;
  recommended_action: 'noop' | 'retry' | 'escalate' | 'hotfix';
  suggested_hotfix: string;
}