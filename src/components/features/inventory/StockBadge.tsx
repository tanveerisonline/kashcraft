"use client";

import { useEffect, useState } from "react";

interface StockLevel {
  productId: string;
  stock: number;
  reserved: number;
  available: number;
  isLowStock: boolean;
  threshold: number;
}

export function StockBadge({ productId }: { productId: string }) {
  const [stock, setStock] = useState<StockLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch(`/api/v1/inventory/stock?productId=${productId}`);
        const data = await res.json();
        setStock(data);
      } catch (error) {
        console.error("Failed to fetch stock:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
    const interval = setInterval(fetchStock, 30000);
    return () => clearInterval(interval);
  }, [productId]);

  if (loading) return <div className="badge badge-ghost">Loading...</div>;
  if (!stock) return null;

  if (stock.available === 0) {
    return <div className="badge badge-error">Out of Stock</div>;
  }

  if (stock.isLowStock) {
    return <div className="badge badge-warning">⚠️ Only {stock.available} left</div>;
  }

  return <div className="badge badge-success">✓ In Stock ({stock.available})</div>;
}
