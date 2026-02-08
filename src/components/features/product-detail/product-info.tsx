import React from 'react';

interface ProductInfoProps {
  name: string;
  price: number;
  description: string;
  className?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ name, price, description, className }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{name}</h1>
      <p className="text-3xl text-gray-900">${price.toFixed(2)}</p>
      <div className="space-y-6">
        <p className="text-base text-gray-700">{description}</p>
      </div>
    </div>
  );
};

export { ProductInfo };
