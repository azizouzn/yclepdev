



import type { Product, Article, Guide, AnalysisResult, ArticleAnalysisResult } from '../types';
import { ContentStatus } from '../types';

// ===================================================================================
// !! MOCK DATA V3 - COMPLETE & ROBUST !!
// This file contains fully fleshed-out data to showcase the platform's features.
// Every object is complete to prevent crashes and provide a rich user experience.
// Image prompts have been replaced with actual placeholder image tags.
// ===================================================================================


// --- Full Analysis Result for Product 1: AeroGlide X1 Drone ---
const mockAnalysisResult1: AnalysisResult = {
  product_analysis: {
    category: 'Drones',
    target_audience: ['Hobbyists', 'Photographers', 'Beginners'],
    key_features: [
      { statement: '4K HDR Video Recording', confidence: 'high', evidence: [{ url: '#', title: 'TechDrone Review', source_type: 'review_site' }] },
      { statement: '30-Minute Flight Time', confidence: 'high', evidence: [{ url: '#', title: 'AeroGlide Official Site', source_type: 'official' }] },
      { statement: '3-Axis Gimbal Stabilization', confidence: 'high', evidence: [{ url: '#', title: 'ProReviews', source_type: 'review_site' }] },
      { statement: 'Advanced Obstacle Avoidance', confidence: 'medium', evidence: [{ url: '#', title: 'DroneFlyers Forum', source_type: 'forum' }] },
    ],
    pros: [
      { statement: 'Exceptional image and video quality for its price point.', confidence: 'high', evidence: [{ url: '#', title: 'ProReviews', source_type: 'review_site' }] },
      { statement: 'Intuitive controls make it incredibly easy for beginners to fly.', confidence: 'high', evidence: [{ url: '#', title: 'DroneFlyers Forum', source_type: 'forum' }] },
      { statement: 'Compact, foldable design enhances portability.', confidence: 'high', evidence: [{ url: '#', title: 'AeroGlide Official Site', source_type: 'official' }] },
    ],
    cons: [
      { statement: 'Controller feels slightly plasticky and less premium.', confidence: 'medium', evidence: [{ url: '#', title: 'DroneCritic', source_type: 'review_site' }] },
      { statement: 'Limited flight range compared to professional-grade models.', confidence: 'high', evidence: [] },
    ],
    executiveSummary: 'The AeroGlide X1 Drone is a top-tier choice for beginners and hobbyists, offering exceptional 4K video quality and a 30-minute flight time at a competitive price point. Its blend of performance and user-friendly features provides outstanding value.',
    summary: 'The AeroGlide X1 offers a perfect blend of portability and professional-grade features, making it an ideal choice for aspiring aerial photographers and hobbyists looking for high quality on a budget.',
    verdict: 'A top-tier drone for its price point, delivering exceptional value and performance that rivals more expensive competitors. Highly recommended for beginners and intermediate users who prioritize video quality.',
    overall_score: 92,
  },
  competitor_analysis: {
    top_competitors: [
        {
            url: '#', title: 'SkyRanger Pro Drone Review',
            strengths: ['Longer flight time by 5 minutes', 'Established brand reputation'],
            weaknesses: ['Lower video quality (1080p only)', 'More expensive'],
            content_strategy: 'Focuses on long-form written reviews with lots of technical specifications.',
            visitor_engagement_techniques: ['Detailed FAQ section', 'User-submitted photo gallery'],
            persuasion_tactics: ['"Editor\'s Choice" badge', 'Comparison table']
        }
    ],
    strategy_summary: 'Competitors focus heavily on technical specs. There is an opportunity to capture the market with a focus on ease-of-use and creative possibilities.',
    identified_keywords: ['beginner drone', '4k drone', 'AeroGlide X1 review', 'best drone for photography'],
    market_gaps: 'There is a significant gap for high-quality 4K drones under $500 that are explicitly marketed as being simple and fun to fly for absolute beginners.',
    offer_details: 'Most competitors offer free shipping. Some provide a bundle with an extra battery.',
    competitive_positioning: {
      x_axis_label: 'Price', y_axis_label: 'Features',
      competitors: [ { name: 'AeroGlide X1', x: 40, y: 80 }, { name: 'SkyRanger Pro', x: 70, y: 85 }, { name: 'BudgetFlyer', x: 20, y: 50 }],
    },
  },
  seo_metadata: {
    title: 'AeroGlide X1 Review: The Best Beginner 4K Drone of 2024?',
    titleVariations: [
        "AeroGlide X1 Drone: 2024 In-Depth Review & Analysis",
        "Is the AeroGlide X1 the Ultimate 4K Drone for Beginners?",
        "Real User Review: Flying the AeroGlide X1 Drone"
    ],
    meta_description: 'Our in-depth, AI-powered review of the AeroGlide X1 drone. Discover why its 4K camera, 30-min flight time, and ease of use make it a top choice for hobbyists.',
    primary_keywords: ['AeroGlide X1 review', 'best beginner drone', '4K drone'],
    secondary_keywords: ['drone for photography', 'affordable drone', 'AeroGlide X1 vs SkyRanger'],
    schema_analysis: 'Recommends "Product" and "Review" schema to highlight score and features in SERP.',
    ai_citation_summary: 'The AeroGlide X1 is a foldable 4K drone offering a 30-minute flight time and 3-axis gimbal stabilization, positioned as a high-value choice for beginner and intermediate aerial photographers.',
    faq_section: [{ question: 'Is the AeroGlide X1 good for beginners?', answer: 'Yes, its intuitive controls and obstacle avoidance sensors make it one of the easiest 4K drones to fly for beginners.' }],
    data_points: ['4K HDR Video', '30-Min Flight Time', 'Foldable Design'],
    seo_score: 88,
    jsonLd: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "AeroGlide X1 Drone",
        "review": {
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": "4.6",
                "bestRating": "5"
            },
            "author": {
                "@type": "Organization",
                "name": "Yclep"
            }
        }
    }, null, 2),
  },
  data_quality_metrics: {
    overall_score: 95,
    breakdown: {
        entitiesCoverage: 98,
        structure: 95,
        dataPoints: 92,
        comparisons: 88,
        schemaReady: 100,
        readability: 96
    }
  },
  internalLinkSuggestions: [
    { url: '/site/guides/1', anchor: 'ultimate guide to buying a drone', reason: 'High topical relevance to the product category.'},
    { url: '/site/blog/1', anchor: 'AI in everyday gadgets', reason: 'Connects drone technology to the broader trend of AI.' },
    { url: '/site/product/3', anchor: 'portable Bluetooth speakers', reason: 'Cross-promotion of other electronic gadgets.' }
  ],
  improvementActions: [
    { priority: 1, action: 'Add a "Who is this for?" section to better target specific user personas like photographers or beginners.', patch: `--- a/index.html\n+++ b/index.html\n@@ -10,6 +10,8 @@\n <h3>Effortless Flight, Professional Results</h3>\n <p>What truly sets the AeroGlide X1 apart is its accessibility.</p>\n+<h2>Who is the AeroGlide X1 For?</h2>\n+<p>This drone is perfect for beginners...</p>\n `},
    { priority: 2, action: 'Strengthen the call-to-action by highlighting a limited-time offer or bundle.', patch: `--- a/index.html\n+++ b/index.html\n@@ -15,4 +15,4 @@\n <a href="#" class="cta-button">Check Price</a>\n-<p>Free shipping on all orders.</p>\n+<p>Limited Time: Get a free extra battery with your purchase! Free shipping on all orders.</p>\n `}
  ],
  final_output: {
    html_content: `
      <h2>The Ultimate Companion for Aerial Creativity</h2>
      <p>In a market flooded with drones, the AeroGlide X1 stands out by delivering premium features without the premium price tag. It's designed not just for the professional, but for the everyday adventurer who wants to capture breathtaking moments from a new perspective.</p>
      <img src="https://source.unsplash.com/600x400/?drone,flying,mountains" alt="AeroGlide X1 flying over a mountain range" style="width: 100%; border-radius: 8px; margin: 1rem 0;" />
      <p>Whether you're a budding photographer, a travel vlogger, or simply someone who wants to explore the world from above, this drone packs a serious punch. The 4K HDR camera, mounted on a 3-axis gimbal, ensures that your footage is buttery-smooth and rich with detail, even in challenging lighting conditions.</p>
      <h3>Effortless Flight, Professional Results</h3>
      <p>What truly sets the AeroGlide X1 apart is its accessibility. Gone are the days of needing a pilot's license to get stunning aerial shots. With advanced features like obstacle avoidance and GPS-assisted hover, you can focus on your creativity rather than worrying about crashing. The 30-minute flight time gives you ample opportunity to get that perfect shot.</p>
    `,
  },
  distribution_assets: {
    social_media: { twitter: 'Just reviewed the AeroGlide X1! 🚁 Is this the best beginner 4K drone of 2024? Our AI analysis says it might be. Check out the full review! #dronereview #AeroGlideX1', facebook: 'Thinking of getting into aerial photography? The AeroGlide X1 might be the perfect drone for you. We just completed our full AI-powered analysis, covering its 4K camera, flight time, and how it stacks up against the competition. Read the full, unbiased review on our site!' },
    email: { subject: 'Our Pick: The Best Beginner Drone is Here', body: 'Hi [Name], if you\'ve ever wanted to capture stunning 4K aerial video without breaking the bank, you need to see our latest review on the AeroGlide X1 drone. Our AI analysis gave it a score of 92/100 for its incredible value and ease of use. Read the full review here.' },
  },
};

// --- Full Analysis Result for Product 2: NovaBook Pro Laptop ---
const mockAnalysisResult2: AnalysisResult = {
  product_analysis: {
    category: 'Laptops',
    target_audience: ['Professionals', 'Students', 'Content Creators'],
    key_features: [
      { statement: '14-inch OLED Display with 120Hz Refresh Rate', confidence: 'high', evidence: [{ url: '#', title: 'NovaBook Official Site', source_type: 'official' }] },
      { statement: 'Next-Gen Core Ultra 7 Processor', confidence: 'high', evidence: [{ url: '#', title: 'LaptopMag Review', source_type: 'review_site' }] },
      { statement: '16GB LPDDR5X RAM', confidence: 'high', evidence: [{ url: '#', title: 'NovaBook Official Site', source_type: 'official' }] },
      { statement: 'Ultra-lightweight at 1.2kg', confidence: 'high', evidence: [{ url: '#', title: 'NovaBook Official Site', source_type: 'official' }] },
    ],
    pros: [
      { statement: 'Stunning OLED display is a joy for media consumption and creation.', confidence: 'high', evidence: [{ url: '#', title: 'TechCrunch', source_type: 'review_site' }] },
      { statement: 'Excellent performance for both productivity and light gaming.', confidence: 'high', evidence: [{ url: '#', title: 'PCWorld', source_type: 'review_site' }] },
      { statement: 'Lightweight and premium aluminum chassis.', confidence: 'high', evidence: [{ url: '#', title: 'User Forum', source_type: 'forum' }] },
    ],
    cons: [
      { statement: 'Battery life is average under heavy load.', confidence: 'medium', evidence: [{ url: '#', title: 'LaptopMag Review', source_type: 'review_site' }] },
      { statement: 'Limited port selection (two USB-C ports).', confidence: 'high', evidence: [] },
    ],
    executiveSummary: 'A powerful, lightweight ultrabook with a stunning OLED display, offering great value for professionals and students alike.',
    summary: 'The NovaBook Pro is a sleek, powerful ultrabook that offers a premium experience at a competitive price. Its standout feature is the gorgeous OLED display, making it a fantastic choice for creative professionals and students.',
    verdict: 'An outstanding all-rounder that punches well above its weight. While battery life could be better, the combination of performance, display quality, and design makes it one of the best value laptops on the market.',
    overall_score: 89,
  },
  competitor_analysis: {
    top_competitors: [], strategy_summary: 'Primary competitor is the MacBook Air, which has better brand recognition but a lower-spec screen. Marketing should emphasize the superior display quality at a similar or lower price point.', identified_keywords: ['ultrabook', 'NovaBook Pro vs MacBook Air', 'OLED laptop'], market_gaps: 'Lack of high-refresh-rate OLED screens in the sub-$1500 ultrabook category.', offer_details: 'Consider offering a free USB-C hub to mitigate the limited port selection.',
    competitive_positioning: {
      x_axis_label: 'Price', y_axis_label: 'Performance',
      competitors: [ { name: 'NovaBook Pro', x: 50, y: 75 }, { name: 'MacBook Air', x: 70, y: 70 }],
    },
  },
  seo_metadata: {
    title: 'NovaBook Pro (2024) Review: The MacBook Killer?',
    titleVariations: [],
    meta_description: 'AI-powered review of the new NovaBook Pro. With its 120Hz OLED screen and Core Ultra 7 CPU, is this the best value laptop for professionals and students?',
    primary_keywords: ['NovaBook Pro review', 'best ultrabook 2024', 'OLED laptop'],
    secondary_keywords: [], seo_score: 91, schema_analysis: 'Product, Review, and FAQPage schemas are recommended.', ai_citation_summary: 'The NovaBook Pro is a 1.2kg ultrabook featuring a 14-inch 120Hz OLED display and a Core Ultra 7 processor, positioning it as a strong competitor to the MacBook Air for creative professionals.', faq_section: [], data_points: [],
    jsonLd: '{}',
  },
  data_quality_metrics: { overall_score: 93, breakdown: { entitiesCoverage: 95, structure: 92, dataPoints: 90, comparisons: 88, schemaReady: 100, readability: 94 } },
  internalLinkSuggestions: [],
  improvementActions: [],
  final_output: {
    html_content: `
      <h2>Power Meets Beauty</h2>
      <p>The NovaBook Pro redefines what to expect from a professional laptop. Its jaw-dropping 14-inch OLED display is the first thing you'll notice, with inky blacks and vibrant colors that make everything from spreadsheets to movies look incredible.</p>
      <img src="https://source.unsplash.com/600x400/?laptop,desk,modern" alt="NovaBook Pro on a desk" style="width: 100%; border-radius: 8px; margin: 1rem 0;" />
    `,
  },
  distribution_assets: {
    social_media: { twitter: 'NovaBook Pro review is LIVE. This OLED screen is a game-changer. Is it the new king of ultrabooks? Our AI dives deep. #novabook #laptopreview', facebook: '' },
    email: { subject: 'Is this the best laptop of 2024?', body: '' },
  },
};


// --- Full Analysis Result for Product 3: SoundSphere 360 Speaker ---
const mockAnalysisResult3: AnalysisResult = {
  product_analysis: {
    category: 'Audio',
    target_audience: ['Music Lovers', 'Party Goers', 'Home Office Users'],
    key_features: [
      { statement: '360-degree omnidirectional sound', confidence: 'high', evidence: [{url: '#', title: 'SoundSphere Official Site', source_type: 'official'}] },
      { statement: 'IPX7 Waterproof Rating', confidence: 'high', evidence: [{url: '#', title: 'SoundSphere Official Site', source_type: 'official'}] },
      { statement: '12-Hour Battery Life', confidence: 'medium', evidence: [{url: '#', title: 'AudioPhile Reviews', source_type: 'review_site'}] },
    ],
    pros: [
        { statement: 'Room-filling sound from a surprisingly small device.', confidence: 'high', evidence: [] },
        { statement: 'Durable and waterproof build makes it perfect for outdoor use.', confidence: 'high', evidence: [] },
        { statement: 'Stable Bluetooth 5.2 connectivity.', confidence: 'high', evidence: [] },
    ],
    cons: [
        { statement: 'Lacks a built-in microphone for calls.', confidence: 'high', evidence: [] },
        { statement: 'Bass can be slightly muddy at maximum volume.', confidence: 'medium', evidence: [] },
    ],
    executiveSummary: 'This compact and waterproof speaker delivers impressive 360-degree sound, making it a versatile and durable choice for any setting.',
    summary: 'A compact yet powerful Bluetooth speaker with impressive 360-degree sound. Its rugged, waterproof design makes it a versatile choice for both indoor and outdoor listening.',
    verdict: 'For its size and price, the SoundSphere 360 delivers exceptional audio. It\'s an easy recommendation for anyone needing a portable, durable speaker that doesn\'t compromise on sound quality.',
    overall_score: 85,
  },
  competitor_analysis: {
      top_competitors: [],
      strategy_summary: '',
      identified_keywords: [],
      market_gaps: '',
      offer_details: '',
      competitive_positioning: {
          x_axis_label: 'Portability',
          y_axis_label: 'Sound Quality',
          competitors: [{name: 'SoundSphere 360', x: 80, y: 70}]
      },
  },
  seo_metadata: {
      title: 'SoundSphere 360 Review: Big Sound, Small Package',
      titleVariations: [],
      meta_description: 'Does the SoundSphere 360 deliver on its promise of immersive, 360-degree audio? Our AI-driven review breaks down its performance, durability, and value.',
      primary_keywords: [], secondary_keywords: [], schema_analysis: '', ai_citation_summary: '', faq_section: [], data_points: [], seo_score: 82,
      jsonLd: '{}',
  },
  data_quality_metrics: { overall_score: 90, breakdown: { entitiesCoverage: 92, structure: 90, dataPoints: 85, comparisons: 80, schemaReady: 100, readability: 95 } },
  internalLinkSuggestions: [],
  improvementActions: [],
  final_output: {
    html_content: `
      <h2>Sound That Surrounds You</h2>
      <p>The SoundSphere 360 is engineered to radiate clear, powerful sound in every direction. Place it in the center of the room and everyone gets the same great experience. Its IPX7 rating means you can take it from the living room to the poolside without worry.</p>
      <img src="https://source.unsplash.com/600x400/?speaker,poolside" alt="SoundSphere 360 Speaker by a pool" style="width: 100%; border-radius: 8px; margin: 1rem 0;" />
    `
  },
  distribution_assets: {
    social_media: { twitter: '', facebook: '' },
    email: { subject: '', body: '' },
  }
};


// --- Article Mock Data ---
const mockArticleAnalysisResult1: ArticleAnalysisResult = {
  title: 'The Rise of AI in Everyday Gadgets: What You Need to Know',
  key_takeaways: [
      "AI is transforming ordinary devices like coffee machines and toothbrushes into 'smart' assistants.",
      "Privacy concerns are rising as more gadgets collect personal data for AI processing.",
      "The future of consumer tech is 'ambient computing', where devices predict your needs before you ask."
  ],
  html_content: `
    <h1>The AI Revolution in Your Pocket</h1>
    <p>Artificial intelligence is no longer the stuff of science fiction. It's in your phone, your smart speaker, and even your coffee machine. This article explores the real-world impact of AI on the gadgets we use every day.</p>
    <img src="https://source.unsplash.com/600x400/?gadgets,ai" alt="AI Chip" style="width: 100%; border-radius: 8px; margin: 1rem 0;" />
    <h2>Smarter Photos, Better Batteries</h2>
    <p>One of the most significant impacts is in smartphone photography. AI algorithms now analyze scenes in real-time to adjust settings, recognize faces, and even erase unwanted objects from your photos. It's like having a professional photographer in your pocket.</p>
  `,
  suggested_categories: ['Technology', 'AI', 'Smartphones'],
};

// --- Main Mock Data Exports ---
export const mockProducts: Product[] = [
    { id: 1, title: 'AeroGlide X1 Drone', affiliate_url: '#', status: ContentStatus.PUBLISHED, score: 92, keywords: 'drone, 4k, beginner', created_at: '2023-10-26T10:00:00Z', analysisResult: mockAnalysisResult1, visualAssets: { featuredImage: 'https://source.unsplash.com/400x300/?drone,sky', imagePrompts: ['A sleek, white drone flying over a dramatic mountain landscape at sunset.', 'A close-up shot of the 4K camera and gimbal on the AeroGlide X1 drone.'] }},
    { id: 2, title: 'NovaBook Pro 14"', affiliate_url: '#', status: ContentStatus.PUBLISHED, score: 89, keywords: 'laptop, oled, professional', created_at: '2023-10-25T12:00:00Z', analysisResult: mockAnalysisResult2, visualAssets: { featuredImage: 'https://source.unsplash.com/400x300/?laptop,desk', imagePrompts: [] } },
    { id: 3, title: 'SoundSphere 360 Speaker', affiliate_url: '#', status: ContentStatus.PUBLISHED, score: 85, keywords: 'speaker, bluetooth', created_at: '2023-10-24T14:00:00Z', analysisResult: mockAnalysisResult3, visualAssets: { featuredImage: 'https://source.unsplash.com/400x300/?bluetooth,speaker', imagePrompts: [] } },
];

export const mockArticles: Article[] = [
    { id: 1, title: 'The Rise of AI in Everyday Gadgets', status: ContentStatus.PUBLISHED, score: 0, keywords: 'ai, tech', created_at: '2023-10-20T10:00:00Z', analysisResult: mockArticleAnalysisResult1 },
];

export const mockGuides: Guide[] = [
    // FIX: Added missing 'score' and 'keywords' properties to satisfy the 'Guide' type.
    { id: 1, title: 'The Ultimate Guide to Buying Your First Drone', status: ContentStatus.PUBLISHED, score: 0, keywords: 'drone, guide, beginner', created_at: '2023-10-18T11:00:00Z', embedded_product_ids: [1], html_content: `
      <h1>Ready to Take Flight?</h1>
      <p>Buying your first drone can be daunting. This guide will walk you through everything you need to know, from regulations to camera quality.</p>
      <img src="https://source.unsplash.com/600x300/?drone,guide" alt="Drone buying guide" style="width: 100%; border-radius: 8px; margin: 1rem 0;" />
      <h2>Our Top Pick for Beginners</h2>
      <p>After analyzing the market, we have a clear recommendation for anyone starting out:</p>
      [EMBED_PRODUCT:1]
      <p>As you can see, the AeroGlide X1 offers a fantastic balance of features, performance, and price. It's the perfect entry point into the world of aerial photography.</p>
    `},
];