import React from 'react';
import { useState } from 'react';

interface ProductFormProps {
  onAddProduct: (productName: string, affiliateUrl: string) => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct }) => {
  const [productName, setProductName] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productName.trim() && affiliateUrl.trim()) {
      onAddProduct(productName, affiliateUrl);
      setProductName('');
      setAffiliateUrl('');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Add New Product</h3>
        <p className="card-description mt-1">Enter a product to begin the AI analysis.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-content space-y-4">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-muted-foreground mb-1">Product Name</label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="input"
              placeholder="e.g., Smart Home Assistant"
              required
            />
          </div>
          <div>
            <label htmlFor="affiliateUrl" className="block text-sm font-medium text-muted-foreground mb-1">Product/Affiliate URL</label>
            <input
              type="url"
              id="affiliateUrl"
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              className="input"
              placeholder="https://product-url.com"
              required
            />
          </div>
        </div>
        <div className="card-footer">
          <button
            type="submit"
            className="w-full btn btn-primary"
            title="Start Mastermind analysis"
          >
            Add & Analyze
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;