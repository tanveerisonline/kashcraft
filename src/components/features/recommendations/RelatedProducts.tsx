"use client";

import { useState, useEffect } from "react";

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface RelatedProductsProps {
  productId: string;
}

export function RelatedProducts({ productId }: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/products/${productId}/recommendations?limit=4`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [productId]);

  if (loading) return <div className="skeleton h-40" />;
  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-bold">You Might Also Like</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.id}`}
            className="card bg-base-100 shadow transition-shadow hover:shadow-lg"
          >
            <figure className="h-40 bg-gray-200" />
            <div className="card-body p-4">
              <p className="line-clamp-2 font-semibold">{product.name}</p>
              <p className="text-primary text-lg font-bold">${product.price}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
