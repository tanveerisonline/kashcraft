"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
}

interface SearchResultsGridProps {
  query: string;
  filters?: Record<string, string>;
}

export function SearchResultsGrid({ query, filters }: SearchResultsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ query });
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            params.append(key, value);
          });
        }

        const res = await fetch(`/api/v1/search/products?${params}`);
        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, filters]);

  if (loading)
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="skeleton h-64" />
      </div>
    );
  if (error) return <div className="alert alert-error">{error}</div>;
  if (products.length === 0)
    return <p className="py-8 text-center">No products found for "{query}"</p>;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <a
          key={product.id}
          href={`/products/${product.id}`}
          className="card bg-base-100 shadow transition-shadow hover:shadow-lg"
        >
          <figure className="relative h-40 bg-gray-200">
            {product.image && (
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            )}
          </figure>
          <div className="card-body p-4">
            <p className="line-clamp-2 text-sm font-semibold">{product.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-primary text-lg font-bold">${product.price}</span>
              {product.rating && (
                <span className="text-warning text-sm">★ {product.rating.toFixed(1)}</span>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
