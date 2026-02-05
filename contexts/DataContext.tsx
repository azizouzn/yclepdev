
import React, { createContext, useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import type { Product, Article, Guide } from '../types';
import { getProducts, getArticles, getGuides } from '../services/mastermindService';
import { useNotification } from './NotificationContext';
import { mockProducts, mockArticles, mockGuides } from '../utils/mockData';

interface DataContextType {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  articles: Article[];
  setArticles: Dispatch<SetStateAction<Article[]>>;
  guides: Guide[];
  setGuides: Dispatch<SetStateAction<Guide[]>>;
  isLoading: boolean;
  fetchData: () => Promise<void>;
  // New mutation functions for optimistic UI
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
  addArticle: (article: Article) => void;
  updateArticle: (article: Article) => void;
  removeArticle: (articleId: number) => void;
  addGuide: (guide: Guide) => void;
  updateGuide: (guide: Guide) => void;
  removeGuide: (guideId: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
  isAdmin: boolean;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, isAdmin }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchData = async () => {
    setIsLoading(true);
    
    // TIMEOUT GUARDRAIL - OPTIMIZED FOR SPEED:
    // Reduced from 3.5s to 1.5s.
    // If the DB is cold/slow, show mock data immediately so the UI doesn't hang.
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT")), 1500)
    );

    try {
        // Use Promise.allSettled to ensure all fetches complete, even if some fail.
        const apiPromise = Promise.allSettled([
            getProducts(),
            getArticles(),
            getGuides(),
        ]);

        // Race the API against the timeout
        const result = await Promise.race([apiPromise, timeoutPromise]) as PromiseSettledResult<unknown>[];

        const [productsResponse, articlesResponse, guidesResponse] = result;

        const fetchedProducts = productsResponse.status === 'fulfilled' ? productsResponse.value : [];
        const fetchedArticles = articlesResponse.status === 'fulfilled' ? articlesResponse.value : [];
        const fetchedGuides = guidesResponse.status === 'fulfilled' ? guidesResponse.value : [];
        
        const hasApiErrors = [productsResponse, articlesResponse, guidesResponse].some((res: PromiseSettledResult<unknown>) => res.status === 'rejected');

        // If the database is completely empty OR there were API errors preventing data fetch,
        // populate with mock data for demo purposes.
        if ((fetchedProducts.length === 0 && fetchedArticles.length === 0 && fetchedGuides.length === 0) || hasApiErrors) {
            if (hasApiErrors) {
                console.warn("API fetch issues detected, switching to demo mode.");
            } else {
                 // Silent fallback for empty DB to improve UX
            }
            setProducts(mockProducts);
            setArticles(mockArticles);
            setGuides(mockGuides);
            // Only show notification if it was a real error, not just empty DB
            if (hasApiErrors) {
                 showNotification('System Monitor: Backend slow/unavailable. Showing demo data.', 'info');
            }
        } else {
            setProducts(fetchedProducts.sort((a: Product, b: Product) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            setArticles(fetchedArticles.sort((a: Article, b: Article) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            setGuides(fetchedGuides.sort((a: Guide, b: Guide) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
    } catch (error: unknown) {
        // This block catches the TIMEOUT error or critical failures
        const err = error instanceof Error ? error : new Error(String(error));
        console.warn("Data fetch timed out or failed:", err);
        
        if (error.message === "TIMEOUT") {
            showNotification('Connection slow. Switched to Demo Mode for speed.', 'info');
        } else {
            showNotification('Network issue. Switched to Demo Mode.', 'error');
        }
        
        // Fallback to mock data
        setProducts(mockProducts);
        setArticles(mockArticles);
        setGuides(mockGuides);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]); // Refetch if admin status changes, e.g., on login/logout

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };
  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };
  const removeProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };
  const addArticle = (article: Article) => {
    setArticles(prev => [article, ...prev]);
  };
  const updateArticle = (article: Article) => {
    setArticles(prev => prev.map(a => a.id === article.id ? article : a));
  };
  const removeArticle = (articleId: number) => {
    setArticles(prev => prev.filter(a => a.id !== articleId));
  };
   const addGuide = (guide: Guide) => {
    setGuides(prev => [guide, ...prev]);
  };
  const updateGuide = (guide: Guide) => {
    setGuides(prev => prev.map(g => g.id === guide.id ? guide : g));
  };
  const removeGuide = (guideId: number) => {
    setGuides(prev => prev.filter(g => g.id !== guideId));
  };


  const value = {
    products,
    setProducts,
    articles,
    setArticles,
    guides,
    setGuides,
    isLoading,
    fetchData,
    addProduct,
    updateProduct,
    removeProduct,
    addArticle,
    updateArticle,
    removeArticle,
    addGuide,
    updateGuide,
    removeGuide,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
