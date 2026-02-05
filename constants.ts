import type { AgentName } from './types';

export const ANALYSIS_STAGES: { agent: AgentName; title: string }[] = [
    { agent: 'agent_mastermind', title: 'Mastermind: Planning Execution' },
    { agent: 'agent_data_scout', title: 'Data Scout: Market & SERP Analysis' },
    { agent: 'agent_competitor_analyzer', title: 'Competitor Analyzer: Strategy Deconstruction' },
    { agent: 'agent_seo_extractor', title: 'SEO Extractor: Keyword & Schema Mapping' },
    { agent: 'agent_seo_strategist', title: 'SEO Strategist: Content Blueprint Generation' },
    { agent: 'agent_copywriter_agent', title: 'Copywriter Agent: Persuasive Content Generation' },
    { agent: 'agent_visual_designer', title: 'Visual Designer: Image Generation & Embedding' },
    { agent: 'agent_data_quality_inspector', title: 'Data Quality Inspector: Coherence & Fact Check' },
    { agent: 'agent_design_builder', title: 'Design Builder: Intelligent Component Assembly' },
    { agent: 'agent_performance_optimizer', title: 'Performance Optimizer: Page Speed Tuning' },
    { agent: 'agent_video_scriptwriter', title: 'Video Scriptwriter: Short-form Content Generation' },
];