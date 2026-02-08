"use client";

import { useState } from "react";
import { ShoppingCart, Plus } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  onAdded?: () => void;
}

export function AddToCartButton({ productId, productName, price, onAdded }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((item: any) => item.id === productId);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: productId,
          name: productName,
          price,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      setAdded(true);
      onAdded?.();

      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`btn gap-2 ${added ? "btn-success" : "btn-primary"}`}
      onClick={handleAdd}
      disabled={loading}
    >
      {added ? (
        <>
          <ShoppingCart size={18} />
          Added!
        </>
      ) : (
        <>
          <Plus size={18} />
          Add to Cart
        </>
      )}
    </button>
  );
}
