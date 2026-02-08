import React from 'react';

interface ProductCarouselProps {
  children: React.ReactNode;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ children, className }) => {
  return (
    <div className={`overflow-x-auto whitespace-nowrap py-4 ${className}`}>
      <div className="inline-flex space-x-4">
        {children}
      </div>
    </div>
  );
};

export { ProductCarousel };
