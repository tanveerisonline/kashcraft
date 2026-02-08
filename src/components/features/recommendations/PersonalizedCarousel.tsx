"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export function PersonalizedCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const fetchPersonalized = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/recommendations?type=personalized&limit=8");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProducts(data.products || data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalized();
  }, []);

  if (loading) return <div className="skeleton h-48" />;
  if (products.length === 0) return null;

  const visibleProducts = products.slice(currentIdx, currentIdx + 4);
  const canNext = currentIdx + 4 < products.length;
  const canPrev = currentIdx > 0;

  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-bold">Just For You</h2>
      <div className="flex items-center gap-4">
        <button
          className="btn btn-circle btn-outline"
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={!canPrev}
        >
          ❮
        </button>

        <div className="grid flex-1 grid-cols-4 gap-4">
          {visibleProducts.map((product) => (
            <a
              key={product.id}
              href={`/products/${product.id}`}
              className="card bg-base-100 shadow transition-shadow hover:shadow-lg"
            >
              <figure className="relative h-32 bg-gray-200">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </figure>
              <div className="card-body p-3">
                <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
                <p className="text-primary font-bold">${product.price}</p>
              </div>
            </a>
          ))}
        </div>

        <button
          className="btn btn-circle btn-outline"
          onClick={() => setCurrentIdx(currentIdx + 1)}
          disabled={!canNext}
        >
          ❯
        </button>
      </div>
    </section>
  );
}
