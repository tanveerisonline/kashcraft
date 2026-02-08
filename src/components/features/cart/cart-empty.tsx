import React from "react";
import Link from "next/link";
import { Button } from "../../ui/button"; // Assuming Button component exists

interface CartEmptyProps {
  className?: string;
}

const CartEmpty: React.FC<CartEmptyProps> = ({ className }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <svg
        className="mb-4 h-24 w-24 text-gray-400"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
      </svg>
      <h2 className="mb-2 text-2xl font-bold text-gray-800">Your cart is empty</h2>
      <p className="mb-6 text-gray-600">Looks like you haven't added anything to your cart yet.</p>
      <Link href="/">
        <Button>Start Shopping</Button>
      </Link>
    </div>
  );
};

export { CartEmpty };
