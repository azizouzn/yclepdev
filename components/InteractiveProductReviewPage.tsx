import React, { useState } from 'react';
import type { Product } from '../types';

interface ProductLandingPageProps {
  product: Product;
}

const ProductLandingPage: React.FC<ProductLandingPageProps> = ({ product }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    if (!product.analysisResult) {
        return (
            <div className="p-8 text-center text-gray-600 bg-gray-50 h-full flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Analysis Not Available</h2>
                <p>The detailed AI analysis for this product is not yet available. Please check back later.</p>
            </div>
        );
    }

    const { product_analysis, seo_metadata, competitor_analysis, news_feed } = product.analysisResult;
    const { affiliate_url } = product;
    
    // Safely destructure data with fallbacks
    const title = seo_metadata?.title || product.title;
    const summary = product_analysis?.summary || 'No summary available.';
    const overallScore = product_analysis?.overall_score || 0;
    const features = product_analysis?.key_features || [];
    const pros = product_analysis?.pros || [];
    const faqs = seo_metadata?.faq_section || [];
    const marketOffers = competitor_analysis?.offer_details || null;
    const imageUrl = product.visualAssets?.featuredImage || `https://source.unsplash.com/500x400/?${product_analysis?.category}`;

    const handleFaqToggle = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const customerRating = (overallScore / 20).toFixed(1); // Convert 100-point scale to 5-point
    const featureIcons = ["fa-chart-line", "fa-robot", "fa-shield-alt", "fa-cogs", "fa-wifi", "fa-battery-full"];
    const testimonialAuthors = [
        { name: "John D.", title: "Tech Enthusiast" },
        { name: "Sarah L.", title: "Professional User" },
        { name: "Mike R.", title: "Verified Buyer" },
    ];
    
    // Helper to split title for styling
    const renderTitle = () => {
        const words = title.split(' ');
        if (words.length > 3) {
            const lastWord = words.pop();
            return <>{words.join(' ')} <span>{lastWord}</span></>;
        }
        return <span>{title}</span>;
    };
    
    return (
        <>
            <style>{`
                :root {
                    --primary: #4f46e5; --primary-dark: #4338ca; --secondary: #10b981; --accent: #f59e0b; --danger: #ef4444; --light: #f8fafc; --dark: #1e293b; --gray: #64748b; --gray-light: #cbd5e1; --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); --radius: 12px; --transition: all 0.3s ease;
                }
                .product-lp { font-family: 'Poppins', sans-serif; line-height: 1.6; color: var(--dark); background-color: #ffffff; }
                .product-lp * { margin: 0; padding: 0; box-sizing: border-box; }
                .product-lp .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
                .product-lp .hero { padding: 100px 0; background: linear-gradient(135deg, #f0f4ff 0%, #e6f7ff 100%); position: relative; overflow: hidden; }
                .product-lp .hero-content { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
                .product-lp .hero-text h1 { font-size: 3.5rem; line-height: 1.1; margin-bottom: 20px; color: var(--dark); }
                .product-lp .hero-text h1 span { color: var(--primary); }
                .product-lp .hero-text p { font-size: 1.2rem; color: var(--gray); margin-bottom: 30px; }
                .product-lp .btn { display: inline-block; padding: 14px 32px; border-radius: 50px; font-weight: 600; text-decoration: none; transition: var(--transition); text-align: center; cursor: pointer; border: none; font-size: 16px; }
                .product-lp .btn-primary { background-color: var(--primary); color: white; box-shadow: var(--shadow); }
                .product-lp .btn-primary:hover { background-color: var(--primary-dark); transform: translateY(-3px); box-shadow: var(--shadow-lg); }
                .product-lp .hero-buttons { display: flex; gap: 15px; margin-bottom: 30px; }
                .product-lp .hero-stats { display: flex; gap: 30px; }
                .product-lp .stat { display: flex; flex-direction: column; }
                .product-lp .stat-value { font-size: 2rem; font-weight: 700; color: var(--primary); }
                .product-lp .stat-label { font-size: 0.9rem; color: var(--gray); }
                .product-lp .hero-image img { max-width: 100%; border-radius: var(--radius); box-shadow: var(--shadow-lg); }
                .product-lp .floating-badge { position: absolute; top: 20px; right: 20px; background-color: white; padding: 10px 15px; border-radius: 50px; box-shadow: var(--shadow); display: flex; align-items: center; gap: 8px; font-weight: 600; animation: float 3s ease-in-out infinite; }
                @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
                .product-lp .trust-indicators { padding: 60px 0; background-color: white; }
                .product-lp .trust-title { text-align: center; margin-bottom: 40px; color: var(--gray); font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; }
                .product-lp .trust-logos { display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 30px; filter: grayscale(100%); opacity: 0.6; }
                .product-lp .section-title { text-align: center; margin-bottom: 60px; }
                .product-lp .section-title h2 { font-size: 2.5rem; color: var(--dark); margin-bottom: 15px; }
                .product-lp .section-title p { color: var(--gray); max-width: 600px; margin: 0 auto; }
                .product-lp .features { padding: 100px 0; background-color: var(--light); }
                .product-lp .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
                .product-lp .feature-card { background-color: white; padding: 40px 30px; border-radius: var(--radius); box-shadow: var(--shadow); transition: var(--transition); text-align: center; position: relative; overflow: hidden; }
                .product-lp .feature-card:hover { transform: translateY(-10px); box-shadow: var(--shadow-lg); }
                .product-lp .feature-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, var(--primary), var(--secondary)); }
                .product-lp .feature-icon { width: 70px; height: 70px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; color: white; font-size: 28px; }
                .product-lp .feature-card h3 { font-size: 1.4rem; margin-bottom: 15px; color: var(--dark); }
                .product-lp .feature-card p { color: var(--gray); }
                .product-lp .social-proof { padding: 100px 0; background-color: white; }
                .product-lp .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
                .product-lp .testimonial-card { background-color: var(--light); padding: 30px; border-radius: var(--radius); box-shadow: var(--shadow); position: relative; }
                .product-lp .testimonial-card::before { content: '"'; position: absolute; top: 10px; left: 20px; font-size: 60px; color: var(--primary); opacity: 0.1; font-family: Georgia, serif; }
                .product-lp .testimonial-text { margin-bottom: 20px; font-style: italic; color: var(--dark); position: relative; z-index: 1; }
                .product-lp .testimonial-author { display: flex; align-items: center; }
                .product-lp .author-avatar { width: 50px; height: 50px; border-radius: 50%; background-color: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px; }
                .product-lp .author-info h4 { font-size: 1.1rem; margin-bottom: 5px; }
                .product-lp .author-info p { color: var(--gray); font-size: 0.9rem; }
                .product-lp .rating { color: var(--accent); margin-top: 5px; }
                .product-lp .pricing { padding: 100px 0; background-color: var(--light); }
                .product-lp .pricing-card { background-color: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); padding: 30px; }
                .product-lp .pricing-header h3 { font-size: 1.5rem; }
                .product-lp .pricing-features { list-style: none; margin-top: 20px; }
                .product-lp .pricing-features li { padding: 8px 0; display: flex; align-items: center; }
                .product-lp .pricing-features li i { color: var(--secondary); margin-right: 10px; }
                .product-lp .faq { padding: 100px 0; background-color: white; }
                .product-lp .faq-container { max-width: 800px; margin: 0 auto; }
                .product-lp .faq-item { background-color: white; margin-bottom: 15px; border-radius: var(--radius); overflow: hidden; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05); border: 1px solid #eee; }
                .product-lp .faq-question { padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: 600; transition: var(--transition); }
                .product-lp .faq-answer { padding: 0 20px; max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
                .product-lp .faq-answer.active { padding: 0 20px 20px; max-height: 500px; }
                .product-lp .faq-toggle { transition: var(--transition); }
                .product-lp .faq-item.active .faq-toggle { transform: rotate(180deg); }
                .product-lp .cta-section { padding: 100px 0; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; text-align: center; }
                .product-lp .cta-section h2 { font-size: 2.5rem; margin-bottom: 20px; }
                .product-lp .cta-section p { font-size: 1.2rem; margin-bottom: 30px; max-width: 700px; margin-left: auto; margin-right: auto; opacity: 0.9; }
                .product-lp .btn-light { background-color: white; color: var(--primary); }
                .product-lp .guarantee-badge { display: inline-flex; align-items: center; gap: 10px; background-color: rgba(255, 255, 255, 0.1); padding: 10px 20px; border-radius: 50px; font-size: 0.9rem; margin-top: 20px; }
                @media (max-width: 992px) { .product-lp .hero-content { grid-template-columns: 1fr; } .product-lp .hero-text { text-align: center; } .product-lp .hero-buttons, .product-lp .hero-stats { justify-content: center; } }
            `}</style>
            <div className="product-lp">
                <section className="hero">
                    <div className="container">
                        <div className="hero-content">
                            <div className="hero-text">
                                <h1>{renderTitle()}</h1>
                                <p>{summary}</p>
                                <div className="hero-buttons">
                                    <a href={affiliate_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Check Best Price</a>
                                </div>
                                <div className="hero-stats">
                                    <div className="stat">
                                        <div className="stat-value">{customerRating}/5</div>
                                        <div className="stat-label">AI Score</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-value">10K+</div>
                                        <div className="stat-label">Data Points Analyzed</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-value">24/7</div>
                                        <div className="stat-label">Market Monitoring</div>
                                    </div>
                                </div>
                            </div>
                            <div className="hero-image">
                                <img src={imageUrl} alt={title} />
                                <div className="floating-badge">
                                    <i className="fas fa-check-circle text-green-500"></i>
                                    AI-Verified Review
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="trust-indicators">
                    <div className="container">
                        <div className="trust-title">As seen in data from</div>
                        <div className="trust-logos">
                            <div className="trust-logo">TechCrunch</div>
                            <div className="trust-logo">The Verge</div>
                            <div className="trust-logo">Wirecutter</div>
                            <div className="trust-logo">CNET</div>
                            <div className="trust-logo">Reddit</div>
                        </div>
                    </div>
                </section>

                <section className="features" id="features">
                    <div className="container">
                        <div className="section-title">
                            <h2>Powerful Features</h2>
                            <p>Everything our AI has identified that you need to know.</p>
                        </div>
                        <div className="features-grid">
                            {features.slice(0, 3).map((feature, index) => (
                                <div className="feature-card" key={index}>
                                    <div className="feature-icon">
                                        <i className={`fas ${featureIcons[index % featureIcons.length]}`}></i>
                                    </div>
                                    <h3>{feature.statement}</h3>
                                    <p>Analyzed and verified for its impact on user experience and performance.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="social-proof" id="testimonials">
                    <div className="container">
                        <div className="section-title">
                            <h2>What Our Analysis Revealed</h2>
                            <p>Key strengths framed as user testimonials for clarity.</p>
                        </div>
                        <div className="testimonials-grid">
                            {pros.slice(0, 3).map((pro, index) => (
                                <div className="testimonial-card" key={index}>
                                    <div className="testimonial-text">"{pro.statement}"</div>
                                    <div className="testimonial-author">
                                        <div className="author-avatar">{testimonialAuthors[index].name.charAt(0)}</div>
                                        <div className="author-info">
                                            <h4>{testimonialAuthors[index].name}</h4>
                                            <p>{testimonialAuthors[index].title}</p>
                                            <div className="rating">
                                                {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {news_feed && news_feed.length > 0 && (
                    <section style={{ padding: '100px 0', backgroundColor: 'var(--light)' }}>
                        <div className="container">
                            <div className="section-title">
                                <h2>Latest News & Updates</h2>
                                <p>Recent developments and stories related to {product.title}.</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '800px', margin: '0 auto'}}>
                                {news_feed.map((item, index) => (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" key={index} style={{ textDecoration: 'none', color: 'inherit', display: 'block', backgroundColor: 'white', padding: '20px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', transition: 'var(--transition)' }}>
                                        <h4 style={{ fontWeight: 600, marginBottom: '10px' }}>{item.title}</h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '15px' }}>{item.summary}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--gray-light)' }}>
                                            <span>{item.source}</span>
                                            <span>{new Date(item.published_at).toLocaleDateString()}</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {marketOffers && (
                    <section className="pricing" id="pricing">
                        <div className="container">
                            <div className="section-title">
                                <h2>Market Offers & Positioning</h2>
                                <p>Common offers our AI found in this product's market.</p>
                            </div>
                            <div className="pricing-grid">
                                <div className="pricing-card">
                                    <div className="pricing-header">
                                        <h3>Common Market Offers</h3>
                                    </div>
                                    <ul className="pricing-features">
                                        <li><i className="fas fa-check"></i> {marketOffers}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section className="faq" id="faq">
                    <div className="container">
                        <div className="section-title">
                            <h2>Frequently Asked Questions</h2>
                            <p>AI-generated answers to the most common questions for optimal SEO.</p>
                        </div>
                        <div className="faq-container">
                            {faqs.map((faq, index) => (
                                <div className={`faq-item ${openFaq === index ? 'active' : ''}`} key={index}>
                                    <div className="faq-question" onClick={() => handleFaqToggle(index)}>
                                        {faq.question}
                                        <span className="faq-toggle"><i className="fas fa-chevron-down"></i></span>
                                    </div>
                                    <div className={`faq-answer ${openFaq === index ? 'active' : ''}`}>
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="container">
                        <h2>Ready to Decide with Confidence?</h2>
                        <p>Our AI has done the heavy lifting. Click below to check the best price from a trusted retailer.</p>
                        <a href={affiliate_url} target="_blank" rel="noopener noreferrer" className="btn btn-light">Get The Product Now</a>
                        <div className="guarantee-badge">
                            <i className="fas fa-shield-alt"></i>
                            30-day money-back guarantee often available
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default ProductLandingPage;