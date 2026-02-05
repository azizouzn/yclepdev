import { useState, useMemo, useEffect } from 'react';
import type { Product, Article, Guide, SortOption } from '../types';
import { getPreferredCategories } from '../utils/personalization';
import { ContentStatus } from '../types';

export const usePublicSiteLogic = (
    products: Product[],
    articles: Article[],
    guides: Guide[],
    route: string
) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('score');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [compareList, setCompareList] = useState<Product[]>([]);
    const [showComparisonModal, setShowComparisonModal] = useState(false);
    const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

    // Handle route transitions
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [route]);
    
    // Load preferred categories
    useEffect(() => {
        setPreferredCategories(getPreferredCategories());
    }, []);

    // Memoized data processing
    const publishedProducts = useMemo(() => products.filter(p => p.status === ContentStatus.PUBLISHED), [products]);
    const publishedArticles = useMemo(() => articles.filter(a => a.status === ContentStatus.PUBLISHED), [articles]);
    const publishedGuides = useMemo(() => guides.filter(g => g.status === ContentStatus.PUBLISHED), [guides]);

    const categories = useMemo(() => {
        const allCategories = new Set(publishedProducts.map(p => p.analysisResult?.product_analysis.category).filter(Boolean) as string[]);
        return ['all', ...Array.from(allCategories)];
    }, [publishedProducts]);

    const sortedProducts = useMemo(() => {
         return [...publishedProducts].sort((a, b) => {
            const aIsPreferred = preferredCategories.includes(a.analysisResult?.product_analysis.category || '');
            const bIsPreferred = preferredCategories.includes(b.analysisResult?.product_analysis.category || '');
            if (aIsPreferred && !bIsPreferred) return -1;
            if (!aIsPreferred && bIsPreferred) return 1;

            switch (sortOption) {
              case 'score': return (b.score ?? 0) - (a.score ?? 0);
              case 'name': return a.title.localeCompare(b.title);
              case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              default: return 0;
            }
          });
    }, [publishedProducts, sortOption, preferredCategories]);

    const filteredAndSortedProducts = useMemo(() => {
        return sortedProducts.filter(p => {
            const matchesCategory = selectedCategory === 'all' || p.analysisResult?.product_analysis.category === selectedCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [sortedProducts, searchTerm, selectedCategory]);

    const topRatedProduct = useMemo(() => {
        if (publishedProducts.length === 0) return null;
        return [...publishedProducts].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
    }, [publishedProducts]);
      
    const latestGuide = useMemo(() => {
        if (publishedGuides.length === 0) return null;
        return [...publishedGuides].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    }, [publishedGuides]);
    
    const latestArticle = useMemo(() => {
        if (publishedArticles.length === 0) return null;
        return [...publishedArticles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    }, [publishedArticles]);

    // Handlers
    const handleToggleCompare = (product: Product) => {
        setCompareList(prev => {
          const isInList = prev.find(p => p.id === product.id);
          if (isInList) {
            return prev.filter(p => p.id !== product.id);
          } else if (prev.length < 3) {
            return [...prev, product];
          }
          return prev;
        });
    };

    const handleRemoveFromCompare = (productId: number) => {
        setCompareList(prev => prev.filter(p => p.id !== productId));
    };
    
    const handleClearCompare = () => setCompareList([]);

    return {
        // State
        searchTerm, setSearchTerm,
        sortOption, setSortOption,
        selectedCategory, setSelectedCategory,
        compareList,
        showComparisonModal, setShowComparisonModal,
        // Memoized Data
        publishedProducts,
        publishedArticles,
        publishedGuides,
        categories,
        filteredAndSortedProducts,
        topRatedProduct,
        latestGuide,
        latestArticle,
        // Handlers
        handleToggleCompare,
        handleRemoveFromCompare,
        handleClearCompare,
    };
};