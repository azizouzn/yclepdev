import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useData } from '../contexts/DataContext';
import { usePublicSiteLogic } from '../hooks/usePublicSiteLogic';
import type { Product, Article, Guide } from '../types';
import { addPreferredCategory } from '../utils/personalization';

import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import CompareTray from './CompareTray';
import ComparisonModal from './ComparisonModal';
import ContentViewer from './ContentViewer'; 
import LazyShow from './LazyShow'; 

// Lazy load components
const Hero = lazy(() => import('./Hero'));
const ProcessShowcase = lazy(() => import('./ProcessShowcase'));
const ProductFinderQuiz = lazy(() => import('./ProductFinderQuiz'));
const FilteringControls = lazy(() => import('./FilteringControls'));
const ProductGrid = lazy(() => import('./ProductGrid'));
const BlogPage = lazy(() => import('./BlogPage'));
const GuidesListPage = lazy(() => import('./GuidesListPage'));
const AboutPage = lazy(() => import('./AboutPage'));
const ContactPage = lazy(() => import('./ContactPage'));
const PrivacyPage = lazy(() => import('./PrivacyPage'));
const PersonalizedRecommendations = lazy(() => import('./PersonalizedRecommendations'));
const FeaturedProductCard = lazy(() => import('./FeaturedProductCard'));
const FeaturedGuideCard = lazy(() => import('./FeaturedGuideCard'));
const FeaturedArticleCard = lazy(() => import('./FeaturedArticleCard'));


interface PublicSiteProps {
  route: string;
  isAdmin: boolean;
}

const PublicSite: React.FC<PublicSiteProps> = ({ route, isAdmin }) => {
  const { products, articles, guides, isLoading } = useData();
  const [selectedContent, setSelectedContent] = useState<Product | Article | Guide | null>(null);
  
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
  
  // Handle deep linking
  useEffect(() => {
    const pathParts = route.split('/').filter(Boolean);
    if (pathParts.length === 3) {
      const [, type, idStr] = pathParts;
      const id = parseInt(idStr, 10);
      let content = null;
      if (type === 'product') {
        const product = products.find(p => p.id === id);
        if (product && product.analysisResult?.product_analysis.category) {
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
    switch (route) {
        case '/site/blog': return <LazyShow><BlogPage articles={publishedArticles} /></LazyShow>;
        case '/site/guides': return <LazyShow><GuidesListPage guides={publishedGuides} products={publishedProducts} /></LazyShow>;
        case '/site/about': return <LazyShow><AboutPage /></LazyShow>;
        case '/site/contact': return <LazyShow><ContactPage /></LazyShow>;
        case '/site/privacy': return <LazyShow><PrivacyPage /></LazyShow>;
        case '/site':
        default: 
            return (
                <>
                    <Hero />
                    
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

                    <LazyShow rootMargin="200px">
                        <ProductFinderQuiz products={publishedProducts} />
                    </LazyShow>

                    <div id="all-reviews" className="bg-white py-20">
                      <div className="container mx-auto p-4 md:p-8">
                          <div className="text-center mb-10">
                              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">All Product Reviews</h2>
                              <p className="mt-4 text-lg leading-6 text-muted-foreground">Filter and sort to find the perfect product for you.</p>
                          </div>
                          
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
      
      <PublicHeader isAdmin={isAdmin} searchTerm={searchTerm} onSearchChange={setSearchTerm} route={route} />
      <main className="flex-grow">
        <div className="page-transition">
          <Suspense fallback={<div className="h-screen bg-white"></div>}>
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