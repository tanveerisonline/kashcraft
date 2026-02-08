import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    rating?: number; // Optional rating
    href: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group relative block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={product.href}>
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
            {product.name}
          </h3>
          <p className="mt-1 text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
          {product.rating && (
            <div className="mt-2 flex items-center">
              {/* Placeholder for star rating */}
              <span className="text-yellow-500">{'★'.repeat(Math.round(product.rating))}</span>
              <span className="ml-1 text-sm text-gray-500">({product.rating.toFixed(1)})</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export { ProductCard };
