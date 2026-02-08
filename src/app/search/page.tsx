"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  rating: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`).catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          setResults(data.data || []);
          setTotalResults(data.total || 0);
        }
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container-custom py-12">
        <h1 className="mb-2 text-4xl font-bold">Search Results</h1>
        <p className="mb-8 text-gray-600">
          {query ? `Results for "${query}"` : "Enter a search term"}
        </p>

        {!query.trim() ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-gray-600">Please enter a search term to view results</p>
          </Card>
        ) : loading ? (
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="mb-6 text-sm text-gray-600">{totalResults} results found</p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {results.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="h-full cursor-pointer overflow-hidden transition-transform hover:scale-105">
                    <div className="aspect-square overflow-hidden bg-gray-200">
                      <img
                        src={product.image || "/images/placeholder.jpg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-lg font-semibold">{product.name}</h3>
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-yellow-500">
                          ★ {product.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="mb-6 text-gray-600">No products found matching "{query}"</p>
            <Link href="/products">
              <Button>View All Products</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
