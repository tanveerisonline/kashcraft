"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

interface QuickBuyButtonProps {
  productId: string;
  productName: string;
  price: number;
  stock: number;
}

export function QuickBuyButton({ productId, productName, price, stock }: QuickBuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleQuickBuy = async () => {
    setLoading(true);
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.push({
        id: productId,
        name: productName,
        price,
        quantity: 1,
      });
      localStorage.setItem("cart", JSON.stringify(cart));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      window.location.href = "/checkout";
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (stock === 0) {
    return <button className="btn btn-disabled w-full">Out of Stock</button>;
  }

  return (
    <button
      className={`btn w-full gap-2 ${success ? "btn-success" : "btn-primary"}`}
      onClick={handleQuickBuy}
      disabled={loading}
    >
      <Zap size={18} />
      {loading ? "Processing..." : success ? "Redirecting..." : "Quick Buy"}
    </button>
  );
}
