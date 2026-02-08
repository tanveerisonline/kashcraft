"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface SimilarProductsProps {
  productId: string;
}

export function SimilarProducts({ productId }: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/recommendations?type=similar&limit=5`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProducts(data.products || data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [productId]);

  if (loading) return <div className="skeleton h-48" />;
  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <h3 className="mb-4 text-xl font-bold">Similar Products</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        {products.map((p) => (
          <a
            key={p.id}
            href={`/products/${p.id}`}
            className="card bg-base-100 shadow transition-shadow hover:shadow-md"
          >
            <figure className="relative h-32 bg-gray-200">
              <Image src={p.image} alt={p.name} fill className="object-cover" />
            </figure>
            <div className="card-body p-3">
              <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
              <p className="text-primary font-bold">${p.price}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
