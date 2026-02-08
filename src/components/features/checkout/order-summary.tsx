import React from 'react';

interface OrderSummaryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  subtotal: number;
  shipping: number;
  total: number;
  className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, subtotal, shipping, total, className }) => {
  return (
    <div className={`bg-gray-50 p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{item.name} (x{item.quantity})</span>
            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 mt-4 pt-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold pt-2">
          <span>Order Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
