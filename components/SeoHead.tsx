
import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  author?: string;
  schema?: object; // JSON-LD Structured Data
}

const SeoHead: React.FC<SeoHeadProps> = ({ 
  title, 
  description, 
  image, 
  type = 'website', 
  publishedTime, 
  author = 'Yclep AI',
  schema 
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = `${title} | Yclep`;

    // 2. Update Meta Tags helper function
    const updateMeta = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    
    // Open Graph / Facebook
    updateMeta('og:type', type, 'property');
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    if (image) updateMeta('og:image', image, 'property');
    updateMeta('og:site_name', 'Yclep', 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image', 'name');
    updateMeta('twitter:title', title, 'name');
    updateMeta('twitter:description', description, 'name');
    if (image) updateMeta('twitter:image', image, 'name');

    // Article Specifics
    if (type === 'article' && publishedTime) {
      updateMeta('article:published_time', publishedTime, 'property');
      updateMeta('article:author', author, 'property');
    }

    // 3. Inject JSON-LD Schema
    if (schema) {
      let script = document.querySelector('#json-ld-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-schema';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }

  }, [title, description, image, type, publishedTime, author, schema]);

  return null;
};

export default SeoHead;
