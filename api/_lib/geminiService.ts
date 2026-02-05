import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { ContentStatus } from '../types';
import type { Product, Competitor, ProductAnalysis, CompetitorAnalysis, SeoMetadata, DistributionAssets, AnalysisResult, ArticleAnalysisResult, BrandPersona, Opportunity, AbTest, PerformanceMetrics, DataQualityMetrics, FactualStatement, Evidence, VideoScript, SeoStrategyReport, ExecutionPlan, AgentName, NewsItem, EditorialReview } from '../types';

let ai: GoogleGenAI | null = null;

// Initialize AI Client safely
const getAiClient = (): GoogleGenAI => {
    if (ai) return ai;
    
    // Access the environment variable directly
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_GEMINI_API')) {
        console.error("❌ GEMINI SERVICE ERROR: API_KEY is missing or invalid in .env file.");
        throw new Error("Server configuration error: API_KEY is missing. Please check your .env file.");
    }

    try {
        ai = new GoogleGenAI({ apiKey });
        return ai;
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        throw new Error("Failed to initialize AI client.");
    }
};

// --- Utilities ---

export const redactPII = (text: string): { redactedText: string; wasRedacted: boolean } => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\+?1?\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    
    let redactedText = text.replace(emailRegex, '[EMAIL_REDACTED]');
    redactedText = redactedText.replace(phoneRegex, '[PHONE_REDACTED]');
    
    return { redactedText, wasRedacted: text !== redactedText };
};

async function repairJsonWithAI(brokenJsonString: string, errorMessage: string): Promise<any> {
    const aiClient = getAiClient();
    
    console.log("⚠️ JSON Parse Failed. Activating Self-Healing Agent...");

    const prompt = `
    You are a JSON Repair Agent. The following string was intended to be JSON but failed to parse.
    Error: ${errorMessage}
    
    Broken String:
    ${brokenJsonString}
    
    Task: Fix the syntax and return ONLY the valid JSON object. Do not add markdown, backticks, or explanations.
    `;

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text.trim());
}

/**
 * CENTRALIZED SAFE EXECUTION WRAPPER
 * Handles generation, parsing, and self-healing in one robust pipeline.
 */
async function generateSafeJSON<T>(model: string, prompt: string, schema: any, thinkingBudget?: number, tools?: any[]): Promise<T> {
    const aiClient = getAiClient();

    const config: any = {
        responseMimeType: "application/json",
        responseSchema: schema,
    };
    
    if (thinkingBudget) {
        config.thinkingConfig = { thinkingBudget };
    }

    if (tools) {
        config.tools = tools;
    }
    
    try {
        const response = await aiClient.models.generateContent({
            model,
            contents: prompt,
            config
        });

        if (!response.text) {
            throw new Error("AI returned an empty response.");
        }

        const text = response.text.trim();

        try {
            return JSON.parse(text) as T;
        } catch (error) {
            // Fallback to Self-Healing
            return await repairJsonWithAI(text, (error as Error).message);
        }
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
}

// --- Agent Implementations ---

export async function runMastermindAgent(productName: string, productUrl: string): Promise<ExecutionPlan> {
  const prompt = `
    You are the Advanced Mastermind Orchestrator optimized for modern AI Search Ecosystems (Bing Chat, Perplexity, Deep Search).
    Create a parallel execution plan for analyzing "${productName}".
    
    DEEP SEARCH STRATEGY:
    - agent_data_scout: Prioritize 'Deep Search' readiness. Find factual density and entity relationships.
    - agent_competitor_analyzer: Analyze 'AI Search Presence' - are competitors cited by LLMs?
    - agent_seo_strategist: Build a 'Semantic Knowledge Graph' strategy, not just keyword lists.
    - agent_copywriter_agent: Produce content structured for AI Summarization (bullet points, clear data tables).
    - agent_visual_designer: Create visual assets that pass 'Bing Visual Search' criteria.
    
    Return a JSON execution plan array.
  `;
  
  const schema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            step: { type: Type.INTEGER },
            title: { type: Type.STRING },
            agents: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { agent: { type: Type.STRING }, title: { type: Type.STRING } },
                    required: ["agent", "title"]
                }
            }
        },
        required: ["step", "title", "agents"]
    }
  };

  return generateSafeJSON<ExecutionPlan>('gemini-2.5-pro', prompt, schema, 1024); 
}

export async function runNewsAggregator(productName: string): Promise<NewsItem[]> {
  const prompt = `Find 3 recent news articles about "${productName}" that would rank well on Bing News and satisfy 'Deep Search' intent. Return empty array if none found.`;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        url: { type: Type.STRING },
        source: { type: Type.STRING },
        summary: { type: Type.STRING },
        published_at: { type: Type.STRING },
      },
      required: ["title", "url", "source", "summary", "published_at"],
    },
  };

  return generateSafeJSON<NewsItem[]>('gemini-2.5-flash', prompt, schema, 0, [{googleSearch: {}}]);
}

export async function runDataScout(productName: string, productUrl: string): Promise<ProductAnalysis> {
  const prompt = `
    Analyze "${productName}" from ${productUrl}.
    
    ADVANCED ARCHITECT INSTRUCTIONS (Deep Search Optimization):
    1. **Entity Extraction**: Identify the core entities (Brand, Tech Specs, Unique Proprietary Features).
    2. **Factual Density**: Extract hard numbers and specs. Deep Search favors high information density.
    3. **Multimedia Potential**: Identify features that need visual proof (e.g., "30 min flight time" -> needs flight log chart).
    4. **Copilot Readiness**: Write the 'executiveSummary' as if it's the direct answer to a user asking "Is ${productName} worth it?" in Bing Chat.
    
    Return ProductAnalysis JSON.
  `;
  
  const schema = {
      type: Type.OBJECT,
      properties: {
          category: { type: Type.STRING },
          target_audience: { type: Type.ARRAY, items: { type: Type.STRING } },
          key_features: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { statement: { type: Type.STRING }, confidence: { type: Type.STRING }, evidence: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { url: { type: Type.STRING }, title: { type: Type.STRING }, source_type: { type: Type.STRING } } } } } } },
          pros: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { statement: { type: Type.STRING }, confidence: { type: Type.STRING }, evidence: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { url: { type: Type.STRING }, title: { type: Type.STRING }, source_type: { type: Type.STRING } } } } } } },
          cons: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { statement: { type: Type.STRING }, confidence: { type: Type.STRING }, evidence: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { url: { type: Type.STRING }, title: { type: Type.STRING }, source_type: { type: Type.STRING } } } } } } },
          executiveSummary: { type: Type.STRING },
          summary: { type: Type.STRING },
          verdict: { type: Type.STRING },
          overall_score: { type: Type.INTEGER },
      },
      required: ["category", "target_audience", "key_features", "pros", "cons", "executiveSummary", "summary", "verdict", "overall_score"]
  };
  
  return generateSafeJSON<ProductAnalysis>('gemini-2.5-flash', prompt, schema, 0, [{googleSearch: {}}]);
}

export async function runCompetitorAnalyzer(productName: string, category: string): Promise<{competitorAnalysis: CompetitorAnalysis, seoMetadata: SeoMetadata}> {
    const prompt = `
        Deep Competitor & AI Presence Analysis for "${productName}" in category "${category}".
        
        ADVANCED INTELLIGENCE TASKS:
        1. **AI Search Presence**: Analyze if competitors are cited by AI tools (Perplexity/Bing). Look for "Cited Sources".
        2. **Semantic Ranking**: What 'Entity Relationships' do competitors establish? (e.g., Product -> linked to 'Sustainable Tech' entity).
        3. **Voice Search**: Generate 'voice_search_optimization' tips (Natural Language Queries).
        
        SEO METADATA STRATEGY:
        - 'ai_citation_summary': A paragraph optimized solely for LLM ingestion (high factual density, neutral tone).
        - 'jsonLd': Must include 'Speakable' schema for Voice Assistants.
    `;
    const schema = { type: Type.OBJECT, properties: { competitor_analysis: { type: Type.OBJECT }, seo_metadata: { type: Type.OBJECT } } }; 
    
    return generateSafeJSON<{competitorAnalysis: CompetitorAnalysis, seoMetadata: SeoMetadata}>('gemini-2.5-flash', prompt, schema, 0, [{googleSearch: {}}]);
}

export async function runDataQualityInspector(analysisData: Partial<AnalysisResult>): Promise<DataQualityMetrics> {
    const prompt = `Analyze this data quality for AI Search Ranking Potential: ${JSON.stringify(analysisData).substring(0, 5000)}...`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            overall_score: { type: Type.INTEGER },
            breakdown: { type: Type.OBJECT, properties: { entitiesCoverage: { type: Type.INTEGER }, structure: { type: Type.INTEGER }, dataPoints: { type: Type.INTEGER }, comparisons: { type: Type.INTEGER }, schemaReady: { type: Type.INTEGER }, readability: { type: Type.INTEGER } } }
        },
        required: ["overall_score", "breakdown"]
    };
    return generateSafeJSON<DataQualityMetrics>('gemini-2.5-pro', prompt, schema);
}

export async function runCopywriterAgent(productName: string, analysisResult: Partial<AnalysisResult>, persona: BrandPersona): Promise<{ final_output: { html_content: string }, distribution_assets: DistributionAssets }> {
    const prompt = `
        Write a 'Deep Search Optimized' HTML review for "${productName}" using persona "${persona}". 
        Data: ${JSON.stringify(analysisResult).substring(0, 10000)}
        
        MULTI-PLATFORM & AI OPTIMIZATION RULES:
        1. **AI Readability**: Use structured tables for specs. LLMs prefer tables over text for data extraction.
        2. **Voice Search Blocks**: Include 'Speakable' Q&A sections (e.g., "Is X water resistant? Yes, it is IP67 rated.").
        3. **Visual Hooks**: Insert [IMAGE_PROMPT] placeholders for concepts difficult to explain in text (Bing Visual Search).
        4. **Multi-Platform Assets**:
           - Generate a 'voice_assistant_snippet' (under 30 words, natural language).
           - Generate LinkedIn/Instagram specific snippets.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            final_output: { type: Type.OBJECT, properties: { html_content: { type: Type.STRING } } },
            distribution_assets: { 
                type: Type.OBJECT, 
                properties: { 
                    social_media: { 
                        type: Type.OBJECT, 
                        properties: { 
                            twitter: { type: Type.STRING }, 
                            facebook: { type: Type.STRING },
                            linkedin: { type: Type.STRING },
                            instagram_caption: { type: Type.STRING }
                        } 
                    }, 
                    email: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } } },
                    voice_assistant_snippet: { type: Type.STRING }
                } 
            }
        },
        required: ["final_output", "distribution_assets"]
    };
    return generateSafeJSON<{ final_output: { html_content: string }, distribution_assets: DistributionAssets }>('gemini-2.5-pro', prompt, schema);
}

// --- NEW: Editorial Council Architecture (Karpathy Style) ---

export async function runEditorialCouncil(draftHtml: string, topic: string): Promise<EditorialReview> {
    const prompt = `
    You are the "Editorial Council" for a high-authority tech publication.
    Your goal is to critique the following article draft about "${topic}" to ensure it ranks #1 on Bing and Google.
    
    ACT AS THREE DISTINCT AGENTS debating the quality:
    
    1. **The Skeptic (Fact-Checker)**: Look for hallucinations, vague claims, and lack of data. Demands citations.
    2. **The SEO Strategist (Bing Expert)**: Checks for "Deep Search" optimization (tables, entities, direct answers). Hates fluff.
    3. **The Conversion Expert**: Ensures the tone persuades the reader to take action without sounding salesy.
    
    Draft Content:
    ${draftHtml.substring(0, 15000)}
    
    Output a JSON object with the critique from each agent and a consensus decision.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            critiques: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        agentName: { type: Type.STRING },
                        score: { type: Type.INTEGER },
                        critique: { type: Type.STRING },
                        requiredChanges: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["agentName", "score", "critique", "requiredChanges"]
                }
            },
            consensusDecision: { type: Type.STRING, enum: ["APPROVE", "REVISE_REQUIRED", "REJECT"] },
            synthesis: { type: Type.STRING }
        },
        required: ["critiques", "consensusDecision", "synthesis"]
    };

    // Using 2.5 Pro for advanced reasoning/multi-persona simulation
    return generateSafeJSON<EditorialReview>('gemini-2.5-pro', prompt, schema, 2048);
}

export async function runRevisionAgent(draftHtml: string, feedback: EditorialReview): Promise<string> {
    const prompt = `
    You are the Lead Editor. Rewrite the following article based on the Editorial Council's feedback.
    
    Council Feedback:
    ${JSON.stringify(feedback.critiques)}
    
    Synthesis Instructions: ${feedback.synthesis}
    
    Draft:
    ${draftHtml.substring(0, 15000)}
    
    Return ONLY the refined HTML. Keep it valid and clean.
    `;
    
    const response = await getAiClient().models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
    });
    
    return response?.text.trim() || draftHtml;
}

export async function runArticleGenerator(topic: string, persona: BrandPersona): Promise<ArticleAnalysisResult> {
    // Chain of Thought Prompt with Semantic Clustering
    const prompt = `
        You are an Advanced Content Architect.
        Task: Write a 'Deep Search' optimized blog post about "${topic}".
        Target Persona: ${persona}
        
        Process (Chain of Thought):
        1. **Semantic Clustering**: Identify 3-4 semantically related sub-topics (Entities) that MUST be covered to show authority.
        2. **Search Intent Matching**: Address 'Informational' intent but bridge to 'Commercial' intent smoothly.
        3. **AI Formatting**: Use bullet points for "Key Takeaways" (optimized for Bing Chat / Google SGE snapshots).
        4. **Drafting**: Write content using 'Entity-First' language. Use standard HTML.
        
        Return a JSON object containing the 'title', 'key_takeaways', 'html_content', and 'suggested_categories'.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          key_takeaways: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "A list of 3-5 critical insights extracted from the analysis phase."
          },
          html_content: { type: Type.STRING },
          suggested_categories: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["title", "key_takeaways", "html_content", "suggested_categories"],
    };
    return generateSafeJSON<ArticleAnalysisResult>('gemini-2.5-flash', prompt, schema, 4096);
}

export async function runInternalLinkingAgent(htmlContent: string, products: {id: number, title: string}[]): Promise<string> {
    const aiClient = getAiClient();
    const prompt = `Insert internal links into this HTML. Bing values site structure. Link strict anchor text matches to these products: ${JSON.stringify(products)}. HTML: ${htmlContent.substring(0, 10000)}... Return ONLY HTML.`;
    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.trim();
}

export async function runPersonalizationAgent(categories: string[], products: any[]): Promise<{ text: string; productIds: number[] }> {
     const prompt = `Recommend 2 products for user interested in ${categories.join(',')} from list: ${JSON.stringify(products)}. Return JSON {text, productIds}.`;
     const schema = {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          productIds: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        },
        required: ["text", "productIds"],
     };
     return generateSafeJSON<{ text: string; productIds: number[] }>('gemini-2.5-flash', prompt, schema);
}

export async function runSeoStrategistAgent(targetKeyword: string): Promise<SeoStrategyReport> {
    const prompt = `
        Generate an ADVANCED SEO STRATEGY for "${targetKeyword}".
        
        Advanced Architect Requirements:
        1. **Semantic Keyword Clusters**: Group keywords by intent (e.g., "Buy" vs "Learn").
        2. **Entity Optimization Plan**: Identify entities (Brands, Concepts, People) needed for Knowledge Graph inclusion.
        3. **AI Search Optimization**: Provide tips specifically for appearing in Perplexity/Bing Copilot (e.g., "Direct Answer" format).
        4. **Voice Search**: List natural language questions users ask assistants about this topic.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            targetKeyword: { type: Type.STRING },
            userIntent: { type: Type.STRING },
            keywordAnalysis: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, volume: { type: Type.INTEGER }, competition: { type: Type.STRING }, relevance: { type: Type.INTEGER } } } },
            contentStructureReport: { type: Type.OBJECT, properties: { recommendedWordCount: { type: Type.OBJECT }, mustHaveSections: { type: Type.ARRAY, items: { type: Type.STRING } }, keyTopics: { type: Type.ARRAY, items: { type: Type.STRING } }, recommendedHeadingStructure: { type: Type.OBJECT } } },
            competitiveGapAnalysis: { type: Type.OBJECT, properties: { missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }, underutilizedTopics: { type: Type.ARRAY, items: { type: Type.STRING } }, uniqueAngleSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } } } },
            semanticTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
            // New Advanced Fields
            semanticClusters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, keywords: { type: Type.ARRAY, items: { type: Type.STRING } }, intent: { type: Type.STRING } } } },
            aiSearchOptimization: { type: Type.OBJECT, properties: { voiceSearchQueries: { type: Type.ARRAY, items: { type: Type.STRING } }, perplexityReadiness: { type: Type.ARRAY, items: { type: Type.STRING } }, deepSearchTips: { type: Type.ARRAY, items: { type: Type.STRING } } } }
        }
    };
    return generateSafeJSON<SeoStrategyReport>('gemini-2.5-pro', prompt, schema, 0, [{googleSearch:{}}]);
}

export async function runImprovementAgent(htmlContent: string): Promise<string[]> {
    const prompt = `Suggest 4 improvements for this HTML to rank better on Bing and be more 'AI Readable' (focus on headers, media tags, clear structure). Return JSON {suggestions: []}.`;
    const schema = {
        type: Type.OBJECT,
        properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ["suggestions"]
    };
    const res = await generateSafeJSON<{suggestions: string[]}>('gemini-2.5-flash', prompt, schema);
    return res.suggestions;
}

export async function runContentEnhancementAgent(htmlContent: string, feedback: string): Promise<string> {
    const aiClient = getAiClient();
    const prompt = `Rewrite HTML based on feedback: "${feedback}". Maintain Bing SEO & AI Readability structure. HTML: ${htmlContent.substring(0, 10000)}. Return ONLY HTML.`;
    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
    });
    return response.text.trim();
}

export async function runVisualDesigner(prompt: string): Promise<string> {
    const aiClient = getAiClient();
    const response = await aiClient.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '4:3' },
    });
    return response.generatedImages[0].image.imageBytes;
}

export async function runVisualEmbedAgent(htmlContent: string): Promise<string> {
    const imagePrompts: string[] = [];
    const regex = /\[IMAGE_PROMPT: (.*?)\]/g;
    let match;
    while ((match = regex.exec(htmlContent)) !== null) {
        imagePrompts.push(match[1]);
    }
    if (imagePrompts.length === 0) return htmlContent;

    const base64Images = await Promise.all(imagePrompts.map(p => runVisualDesigner(p)));
    
    let finalHtml = htmlContent;
    base64Images.forEach((base64, index) => {
        const placeholder = `[IMAGE_PROMPT: ${imagePrompts[index]}]`;
        const imgTag = `<img src="data:image/jpeg;base64,${base64}" alt="${imagePrompts[index]}" style="width:100%;border-radius:8px;margin:1rem 0;" />`;
        finalHtml = finalHtml.replace(placeholder, imgTag);
    });
    return finalHtml;
}

export async function runVideoScriptwriter(analysisResult: AnalysisResult): Promise<VideoScript> {
    const prompt = `Write video script for product analysis: ${JSON.stringify(analysisResult.product_analysis)}. Bing loves video. Return JSON VideoScript schema.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          scenes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { scene_number: { type: Type.INTEGER }, visual: { type: Type.STRING }, dialogue: { type: Type.STRING } } } },
          call_to_action: { type: Type.STRING },
        },
        required: ["title", "scenes", "call_to_action"]
    };
    return generateSafeJSON<VideoScript>('gemini-2.5-pro', prompt, schema, 8192);
}

export async function runOpportunityHunterAgent(): Promise<Opportunity[]> {
    const prompt = "Find 3 affiliate opportunities that are trending with high 'Deep Search' potential. Return JSON {opportunities: []}.";
    const schema = {
        type: Type.OBJECT,
        properties: {
            opportunities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, topic: { type: Type.STRING }, marketPotential: { type: Type.NUMBER }, competitionLevel: { type: Type.STRING }, source: { type: Type.STRING } } } }
        },
        required: ["opportunities"]
    };
    
    const res = await generateSafeJSON<{opportunities: Opportunity[]}>('gemini-2.5-flash', prompt, schema, 0, [{googleSearch:{}}]);
    return res.opportunities;
}

export async function runCommandAgent(command: string): Promise<{ name: string; args: any } | null> {
  const aiClient = getAiClient();

  const tools: FunctionDeclaration[] = [
      { name: 'analyzeProduct', parameters: { type: Type.OBJECT, properties: { productName: { type: Type.STRING }, productUrl: { type: Type.STRING } }, required: ['productName', 'productUrl'] } },
      { name: 'generateArticle', parameters: { type: Type.OBJECT, properties: { topic: { type: Type.STRING } }, required: ['topic'] } },
      { name: 'findContent', parameters: { type: Type.OBJECT, properties: { term: { type: Type.STRING }, status: { type: Type.STRING } } } },
      { name: 'navigateTo', parameters: { type: Type.OBJECT, properties: { tab: { type: Type.STRING } }, required: ['tab'] } }
  ];

  // PII Redaction applied again for safety
  const { redactedText } = redactPII(command);
  const prompt = `Map command to tool: "${redactedText}"`;

  const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { tools: [{ functionDeclarations: tools }] }
  });

  const call = response.functionCalls?.[0];
  if (call) return { name: call.name, args: call.args };
  return null;
}
