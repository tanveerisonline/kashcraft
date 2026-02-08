"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  rating: number;
  stockQuantity: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

const PRICE_RANGES = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $250", min: 100, max: 250 },
  { label: "$250 - $500", min: 250, max: 500 },
  { label: "Over $500", min: 500, max: Infinity },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          sort,
          ...(selectedCategory && { categoryId: selectedCategory }),
          ...(selectedPriceRange && {
            minPrice: selectedPriceRange.min.toString(),
            maxPrice: selectedPriceRange.max.toString(),
          }),
          ...(searchQuery && { search: searchQuery }),
        });

        const productsRes = await fetch(`/api/products?${params}`).catch(() => null);
        const categoriesRes = await fetch("/api/categories").catch(() => null);

        if (productsRes?.ok) {
          const data = await productsRes.json();
          setProducts(data.data || []);
          setTotalPages(data.totalPages || 1);
        }

        if (categoriesRes?.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, sort, selectedCategory, selectedPriceRange, searchQuery]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Breadcrumb */}
      <div className="container-custom border-b py-4">
        <div className="flex gap-2 text-sm">
          <Link href="/" className="text-primary hover:underline">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Products</span>
        </div>
      </div>

      {/* Header */}
      <section className="border-b bg-gray-50 py-12">
        <div className="container-custom">
          <h1 className="mb-4 text-4xl font-bold">Our Collection</h1>
          <p className="max-w-2xl text-gray-600">
            Explore our curated selection of authentic Kashmiri crafts and artisanal products.
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <h3 className="font-bold">Search</h3>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>

              {/* Categories Filter */}
              <div className="space-y-2">
                <h3 className="font-bold">Categories</h3>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => {
                        setSelectedCategory(null);
                        setPage(1);
                      }}
                      className="h-4 w-4"
                    />
                    <span>All Categories</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.id}
                        onChange={() => {
                          setSelectedCategory(cat.id);
                          setPage(1);
                        }}
                        className="h-4 w-4"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <h3 className="font-bold">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRange === null}
                      onChange={() => {
                        setSelectedPriceRange(null);
                        setPage(1);
                      }}
                      className="h-4 w-4"
                    />
                    <span>All Prices</span>
                  </label>
                  {PRICE_RANGES.map((range) => (
                    <label key={range.label} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="price"
                        checked={
                          selectedPriceRange?.min === range.min &&
                          selectedPriceRange?.max === range.max
                        }
                        onChange={() => {
                          setSelectedPriceRange(range);
                          setPage(1);
                        }}
                        className="h-4 w-4"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedPriceRange || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedPriceRange(null);
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="border-primary text-primary hover:bg-primary w-full rounded-lg border px-4 py-2 transition hover:text-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-6 lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing {products.length} of {totalPages * 12} products
              </p>

              <div className="flex items-center gap-4">
                {/* View Mode */}
                <div className="flex gap-2 rounded-lg border p-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded px-3 py-2 ${viewMode === "grid" ? "bg-primary text-white" : "text-gray-600"}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded px-3 py-2 ${viewMode === "list" ? "bg-primary text-white" : "text-gray-600"}`}
                  >
                    List
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="focus:ring-primary rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-3" : ""}`}
              >
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-80 animate-pulse bg-gray-200" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-3" : ""}`}
              >
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <Card
                      className={`cursor-pointer overflow-hidden transition-transform hover:scale-105 ${viewMode === "list" ? "flex gap-4" : ""}`}
                    >
                      <div
                        className={`${viewMode === "list" ? "h-32 w-32 flex-shrink-0" : "aspect-square"} overflow-hidden bg-gray-200`}
                      >
                        <img
                          src={product.image || "/images/placeholder.jpg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <h3 className="line-clamp-2 text-lg font-semibold">{product.name}</h3>
                        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                          <span className="text-sm text-yellow-500">
                            ★ {product.rating.toFixed(1)}
                          </span>
                        </div>
                        {product.stockQuantity < 5 && (
                          <p className="mt-2 text-sm text-red-500">
                            Only {product.stockQuantity} left
                          </p>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                No products found. Try adjusting your filters.
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg border px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (Math.abs(pageNum - page) <= 2 || pageNum === 1 || pageNum === totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`rounded-lg border px-4 py-2 ${
                          page === pageNum ? "bg-primary text-white" : "hover:border-primary"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (Math.abs(pageNum - page) === 3) {
                    return (
                      <span key={pageNum} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
