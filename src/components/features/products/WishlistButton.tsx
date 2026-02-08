"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
}

export function WishlistButton({ productId, initialWishlisted = false }: WishlistButtonProps) {
  const { data: session } = useSession();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!session?.user?.id) {
      // For non-logged-in users, use localStorage
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      if (wishlisted) {
        const index = wishlist.indexOf(productId);
        if (index > -1) wishlist.splice(index, 1);
      } else {
        if (!wishlist.includes(productId)) wishlist.push(productId);
      }
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setWishlisted(!wishlisted);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/wishlist/${productId}`, {
        method: wishlisted ? "DELETE" : "POST",
      });

      if (res.ok) {
        setWishlisted(!wishlisted);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-ghost btn-circle"
      onClick={handleToggle}
      disabled={loading}
      title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={24} className={wishlisted ? "fill-error text-error" : "text-gray-400"} />
    </button>
  );
}
