import React from 'react';
import { Modal } from '../ui/modal'; // Assuming Modal component exists

interface ProductQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    description: string;
    // Add other product details as needed
  };
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative h-64 w-full">
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
          <p className="mt-2 text-xl font-semibold text-gray-700">${product.price.toFixed(2)}</p>
          <p className="mt-4 text-gray-600">{product.description}</p>
          {/* Add more product details or an "Add to Cart" button here */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export { ProductQuickView };
