import React from 'react';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  className?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, shipping, total, className }) => {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Order Summary</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export { CartSummary };
