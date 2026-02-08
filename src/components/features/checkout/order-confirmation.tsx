import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../../ui/button";
import Link from "next/link";

interface OrderConfirmationProps {
  orderId: string;
  totalAmount: number;
  email: string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, totalAmount, email }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-md">
      <CheckCircleIcon className="mb-6 h-24 w-24 text-green-500" />
      <h1 className="mb-3 text-3xl font-bold text-gray-800">Order Confirmed!</h1>
      <p className="mb-2 text-lg text-gray-600">Thank you for your purchase.</p>
      <p className="text-md mb-1 text-gray-600">
        Your order <span className="font-semibold">#{orderId}</span> has been placed successfully.
      </p>
      <p className="text-md mb-6 text-gray-600">
        A confirmation email has been sent to <span className="font-semibold">{email}</span> with
        the details of your order.
      </p>

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
