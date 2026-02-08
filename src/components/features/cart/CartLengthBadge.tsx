"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

export function CartLengthBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Fetch from localStorage or API
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      try {
        const items = JSON.parse(cartData);
        setCount(Array.isArray(items) ? items.length : 0);
      } catch {
        setCount(0);
      }
    }

    // Listen for storage changes
    const handleStorageChange = () => {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        try {
          const items = JSON.parse(cartData);
          setCount(Array.isArray(items) ? items.length : 0);
        } catch {
          setCount(0);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="indicator">
      {count > 0 && <span className="indicator-item badge badge-primary">{count}</span>}
      <button className="btn btn-ghost btn-circle">
        <ShoppingCart size={24} />
      </button>
    </div>
  );
}
