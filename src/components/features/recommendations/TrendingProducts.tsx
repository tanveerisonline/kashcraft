"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sales?: number;
}

export function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/recommendations?type=trending&limit=6");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProducts(data.products || data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) return <div className="skeleton h-64" />;
  if (products.length === 0) return null;

  return (
    <section className="from-warning to-error rounded-lg bg-gradient-to-r py-12 text-white">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 flex items-center gap-2 text-3xl font-bold">
          <TrendingUp size={32} /> Trending Now
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, idx) => (
            <a
              key={product.id}
              href={`/products/${product.id}`}
              className="card bg-white text-gray-900 shadow transition-shadow hover:shadow-lg"
            >
              <div className="card-body p-4">
                <div className="badge badge-warning mb-2">#{idx + 1}</div>
                <p className="line-clamp-2 font-semibold">{product.name}</p>
                <p className="text-primary text-xl font-bold">${product.price}</p>
                {product.sales && <p className="text-xs text-gray-500">{product.sales} sold</p>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
