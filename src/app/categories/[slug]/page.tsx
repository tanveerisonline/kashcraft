"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  rating: number;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch category
        const catRes = await fetch(`/api/categories/${categorySlug}`).catch(() => null);
        if (catRes?.ok) {
          const catData = await catRes.json();
          setCategory(catData.data);

          // Fetch subcategories and products for this category
          const productsRes = await fetch(
            `/api/products?categorySlug=${categorySlug}&sort=${sort}&page=${page}&limit=12`
          ).catch(() => null);

          if (productsRes?.ok) {
            const prodData = await productsRes.json();
            setProducts(prodData.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, sort, page]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container-custom">
          <div className="mb-12 h-64 animate-pulse rounded-lg bg-gray-200" />
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Breadcrumb */}
      <div className="container-custom border-b py-4">
        <div className="flex gap-2 text-sm">
          <Link href="/" className="text-primary hover:underline">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{category?.name}</span>
        </div>
      </div>

      {/* Category Banner */}
      {category && (
        <section className="from-primary to-secondary relative bg-gradient-to-r py-20 text-white">
          <div className="container-custom">
            <div className="max-w-2xl">
              <h1 className="mb-4 text-5xl font-bold">{category.name}</h1>
              <p className="text-lg opacity-90">{category.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Subcategories */}
      {subCategories.length > 0 && (
        <section className="border-b bg-gray-50 py-8">
          <div className="container-custom">
            <div className="flex gap-4 overflow-x-auto pb-4">
              <Link href={`/categories/${categorySlug}`}>
                <Button variant="outline" className="whitespace-nowrap">
                  All Items
                </Button>
              </Link>
              {subCategories.map((sub) => (
                <Link key={sub.id} href={`/categories/${sub.slug}`}>
                  <Button variant="outline" className="whitespace-nowrap">
                    {sub.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <div className="container-custom py-12">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-gray-600">{products.length} products</p>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="focus:ring-primary rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="cursor-pointer overflow-hidden transition-transform hover:scale-105">
                  <div className="aspect-square overflow-hidden bg-gray-200">
                    <img
                      src={product.image || "/images/placeholder.jpg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-lg font-semibold">{product.name}</h3>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                      <span className="text-sm text-yellow-500">★ {product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-500">
            <p className="mb-4 text-xl">No products found in this category</p>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
