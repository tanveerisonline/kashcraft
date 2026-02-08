"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-6">
        <ShoppingCart size={64} className="text-gray-300" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Your Cart is Empty</h2>
      <p className="mb-6 text-gray-500">Start shopping to add items to your cart</p>
      <Link href="/products" className="btn btn-primary">
        Continue Shopping
      </Link>
    </div>
  );
}
