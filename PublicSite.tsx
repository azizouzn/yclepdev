
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useData } from './contexts/DataContext';
import { usePublicSiteLogic } from './hooks/usePublicSiteLogic';
import type { Product, Article, Guide } from './types';
import { addPreferredCategory } from './utils/personalization';

import PublicHeader from './components/PublicHeader';
import PublicFooter from './components/PublicFooter';
import CompareTray from './components/CompareTray';
import ComparisonModal from './components/ComparisonModal';
import ContentViewer from './components/ContentViewer'; 
import FuturisticIntro from './components/FuturisticIntro';
import LazyShow from './components/LazyShow'; // Import the optimizer

// Lazy load page-level components for better performance
const Hero = lazy(() => import('./components/Hero'));
const ProcessShowcase = lazy(() => import('./components/ProcessShowcase'));
const ProductFinderQuiz = lazy(() => import('./components/ProductFinderQuiz'));
const FilteringControls = lazy(() => import('./components/FilteringControls'));
const ProductGrid = lazy(() => import('./components/ProductGrid'));
const BlogPage = lazy(() => import('./components/BlogPage'));
const GuidesListPage = lazy(() => import('./components/GuidesListPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));
const PersonalizedRecommendations = lazy(() => import('./components/PersonalizedRecommendations'));
const FeaturedProductCard = lazy(() => import('./components/FeaturedProductCard'));
const FeaturedGuideCard = lazy(() => import('./components/FeaturedGuideCard'));
const FeaturedArticleCard = lazy(() => import('./components/FeaturedArticleCard'));


interface PublicSiteProps {
  route: string;
  isAdmin: boolean;
}

const PublicSite: React.FC<PublicSiteProps> = ({ route, isAdmin }) => {
  const { products, articles, guides, isLoading } = useData();
  const [selectedContent, setSelectedContent] = useState<Product | Article | Guide | null>(null);
  
  // State to control the intro hook
  const [showIntro, setShowIntro] = useState(true);

  const {
    searchTerm, setSearchTerm,
    sortOption, setSortOption,
    selectedCategory, setSelectedCategory,
    compareList,
    showComparisonModal, setShowComparisonModal,
    publishedProducts,
    publishedArticles,
    publishedGuides,
    categories,
    filteredAndSortedProducts,
    topRatedProduct,
    latestGuide,
    latestArticle,
    handleToggleCompare,
    handleRemoveFromCompare,
    handleClearCompare,
  } = usePublicSiteLogic(products, articles, guides, route);
  
  // Handle Intro Logic
  useEffect(() => {
      // Update key to force re-run of intro for the user who complained
      const hasSeenIntro = sessionStorage.getItem('yclep_intro_seen_v4');
      if (hasSeenIntro) {
          setShowIntro(false);
      }
  }, []);

  const handleIntroComplete = () => {
      setShowIntro(false);
      sessionStorage.setItem('yclep_intro_seen_v4', 'true');
  };

  // Handle deep linking and content selection from URL
  useEffect(() => {
    const pathParts = route.split('/').filter(Boolean); // e.g., ['site', 'product', '1']
    if (pathParts.length === 3) {
      const [, type, idStr] = pathParts;
      const id = parseInt(idStr, 10);
      let content = null;
      if (type === 'product') {
        const product = products.find(p => p.id === id);
        if (product && product.analysisResult?.product_analysis.category) {
            // Track user interest for personalization
            addPreferredCategory(product.analysisResult.product_analysis.category);
        }
        content = product;
      }
      else if (type === 'blog') content = articles.find(a => a.id === id);
      else if (type === 'guide') content = guides.find(g => g.id === id);
      
      if (content) setSelectedContent(content);
    } else {
      setSelectedContent(null);
    }
  }, [route, products, articles, guides]);

  const handleCloseViewer = () => {
    window.history.pushState({}, '', '/site');
    window.dispatchEvent(new PopStateEvent('popstate'));
    setSelectedContent(null);
  };
  
  const renderPageContent = () => {
    // The main route now only renders the list pages. Detail views are handled by ContentViewer.
    switch (route) {
        case '/site/blog': return <LazyShow><BlogPage articles={publishedArticles} /></LazyShow>;
        case '/site/guides': return <LazyShow><GuidesListPage guides={publishedGuides} products={publishedProducts} /></LazyShow>;
        case '/site/about': return <LazyShow><AboutPage /></LazyShow>;
        case '/site/contact': return <LazyShow><ContactPage /></LazyShow>;
        case '/site/privacy': return <LazyShow><PrivacyPage /></LazyShow>;
        case '/site':
        default: // Homepage
            return (
                <>
                    {/* Hero is critical, load immediately (no LazyShow) */}
                    <Hero />
                    
                    {/* Process Showcase is below fold, lazy load it */}
                    <LazyShow>
                        <ProcessShowcase />
                    </LazyShow>

                    <LazyShow>
                        <Suspense fallback={null}>
                            <PersonalizedRecommendations />
                        </Suspense>
                    </LazyShow>

                    <div className="py-20 relative">
                        <div className="container mx-auto px-4 md:px-8">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Latest Highlights</h2>
                                <p className="mt-4 text-lg leading-6 text-muted-foreground">Hand-picked selections from our AI-powered analysis.</p>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Featured cards are slightly below fold on most screens */}
                                <LazyShow>
                                    {topRatedProduct ? <Suspense fallback={null}><FeaturedProductCard product={topRatedProduct} /></Suspense> : (isLoading && <div className="h-64 bg-gray-100 rounded-xl animate-pulse col-span-1"></div>)}
                                </LazyShow>
                                <LazyShow>
                                    {latestGuide ? <Suspense fallback={null}><FeaturedGuideCard guide={latestGuide} /></Suspense> : (isLoading && <div className="h-64 bg-gray-100 rounded-xl animate-pulse col-span-1"></div>)}
                                </LazyShow>
                                <LazyShow>
                                    {latestArticle ? <Suspense fallback={null}><FeaturedArticleCard article={latestArticle} /></Suspense> : (isLoading && <div className="h-64 bg-gray-100 rounded-xl animate-pulse col-span-1"></div>)}
                                </LazyShow>
                            </div>
                        </div>
                    </div>

                    {/* Heavy interactive component, definitely lazy load */}
                    <LazyShow rootMargin="200px">
                        <ProductFinderQuiz products={publishedProducts} />
                    </LazyShow>

                    <div id="all-reviews" className="bg-white py-20">
                      <div className="container mx-auto p-4 md:p-8">
                          <div className="text-center mb-10">
                              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">All Product Reviews</h2>
                              <p className="mt-4 text-lg leading-6 text-muted-foreground">Filter and sort to find the perfect product for you.</p>
                          </div>
                          
                          {/* Filtering logic JS only loads when user scrolls to the list */}
                          <LazyShow>
                              <FilteringControls
                                  categories={categories}
                                  selectedCategory={selectedCategory}
                                  onCategoryChange={setSelectedCategory}
                                  sortOption={sortOption}
                                  onSortChange={setSortOption}
                              />
                          </LazyShow>

                          {isLoading && publishedProducts.length === 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>)}
                             </div>
                          ) : (
                             <LazyShow>
                                 <ProductGrid 
                                    products={filteredAndSortedProducts}
                                    onToggleCompare={handleToggleCompare}
                                    compareList={compareList}
                                 />
                             </LazyShow>
                          )}
                      </div>
                    </div>
                </>
            );
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative bg-white">
      
      {/* Intro Hook - Cinematic Experience */}
      {showIntro && <FuturisticIntro onComplete={handleIntroComplete} />}

      <PublicHeader isAdmin={isAdmin} searchTerm={searchTerm} onSearchChange={setSearchTerm} route={route} />
      <main className="flex-grow">
        <div className="page-transition">
          <Suspense fallback={<div className="h-screen"></div>}>
            {renderPageContent()}
          </Suspense>
        </div>
      </main>
      
      <LazyShow rootMargin="50px">
        <PublicFooter />
      </LazyShow>

      {compareList.length > 0 && (
        <CompareTray 
            items={compareList} 
            onRemove={handleRemoveFromCompare}
            onClear={handleClearCompare}
            onCompare={() => setShowComparisonModal(true)}
        />
      )}
      {showComparisonModal && (
        <ComparisonModal 
            items={compareList}
            onClose={() => setShowComparisonModal(false)}
        />
      )}
      {selectedContent && (
        <ContentViewer 
          content={selectedContent}
          onClose={handleCloseViewer}
          allProducts={products}
        />
      )}
    </div>
  );
};

export default PublicSite;
