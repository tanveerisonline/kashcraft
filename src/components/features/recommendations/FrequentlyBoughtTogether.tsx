"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  rating?: number;
  reviews?: number;
}

interface FrequentlyBoughtTogetherProps {
  productId?: string;
  type?: "frequent" | "similar" | "personalized" | "trending";
  limit?: number;
}

export function FrequentlyBoughtTogether({
  productId,
  type = "frequent",
  limit = 4,
}: FrequentlyBoughtTogetherProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const url = productId
          ? `/api/v1/products/${productId}/recommendations?type=${type}&limit=${limit}`
          : `/api/v1/recommendations?type=${type}&limit=${limit}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch recommendations");

        const data = await res.json();
        setProducts(data.products || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, type, limit]);

  if (loading) return <div className="skeleton h-64 w-full" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (products.length === 0) return null;

  const labels: Record<string, string> = {
    frequent: "Frequently Bought Together",
    similar: "Similar Products",
    personalized: "Recommended For You",
    trending: "Trending Now",
  };

  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-bold">{labels[type]}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="card bg-base-100 shadow-sm transition-shadow hover:shadow-md"
          >
            <figure className="relative h-48 px-4 pt-4">
              <Image src={product.image} alt={product.name} fill className="rounded object-cover" />
            </figure>
            <div className="card-body p-4">
              <h3 className="card-title line-clamp-2 text-sm">{product.name}</h3>
              {product.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-warning">★</span>
                  <span>{product.rating.toFixed(1)}</span>
                  {product.reviews && <span className="text-gray-500">({product.reviews})</span>}
                </div>
              )}
              <div className="card-actions mt-2 items-end justify-between">
                <div className="text-lg font-bold">${product.price}</div>
                <button className="btn btn-sm btn-primary">Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
