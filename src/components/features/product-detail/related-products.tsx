import React from 'react';
import { ProductCard } from '../../product-display/product-card'; // Assuming ProductCard component exists

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  rating?: number;
  href: string;
}

interface RelatedProductsProps {
  products: Product[];
  className?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products, className }) => {
  if (!products || products.length === 0) {
    return null; // Or a message indicating no related products
  }

  return (
    <div className={`mt-12 ${className}`}>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Related Products</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export { RelatedProducts };
