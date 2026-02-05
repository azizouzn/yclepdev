import React, { useState, useEffect, useRef, Suspense } from 'react';

interface LazyShowProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number; // 0.0 to 1.0
  rootMargin?: string; // e.g. "200px" to load before it enters view
}

/**
 * LazyShow Component
 * 
 * Reduces Initial JS Payload by deferring the rendering (and hydration) of 
 * components until they are scrolled into view.
 * 
 * This mimics "Island Architecture" behavior in a SPA.
 */
const LazyShow: React.FC<LazyShowProps> = ({ 
  children, 
  fallback = <div className="w-full h-32 bg-gray-50/50 animate-pulse rounded-lg" />, 
  threshold = 0.1,
  rootMargin = "100px" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return; // Once visible, stay visible

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isVisible, threshold, rootMargin]);

  return (
    <div ref={ref} className="lazy-wrapper min-h-[50px]">
      {isVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

export default LazyShow;