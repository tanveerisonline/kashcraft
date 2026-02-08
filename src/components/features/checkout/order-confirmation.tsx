import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/button';
import Link from 'next/link';

interface OrderConfirmationProps {
  orderId: string;
  totalAmount: number;
  email: string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, totalAmount, email }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md text-center">
      <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Order Confirmed!</h1>
      <p className="text-lg text-gray-600 mb-2">Thank you for your purchase.</p>
      <p className="text-md text-gray-600 mb-1">Your order <span className="font-semibold">#{orderId}</span> has been placed successfully.</p>
      <p className="text-md text-gray-600 mb-6">A confirmation email has been sent to <span className="font-semibold">{email}</span> with the details of your order.</p>

      <div className="flex space-x-4">
        <Link href="/orders">
          <Button variant="outline">View Order Details</Button>
        </Link>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
