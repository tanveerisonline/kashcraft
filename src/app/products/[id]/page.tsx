"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockQuantity: number;
  image?: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  material?: string;
  origin?: string;
  weight?: number;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "shipping">("description");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`).catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          setProduct(data.data);

          // Fetch reviews
          const reviewsRes = await fetch(`/api/products/${productId}/reviews`).catch(() => null);
          if (reviewsRes?.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData.data || []);
          }

          // Fetch related products
          if (data.data?.category?.id) {
            const relatedRes = await fetch(
              `/api/products?categoryId=${data.data.category.id}&limit=4&exclude=${productId}`
            ).catch(() => null);
            if (relatedRes?.ok) {
              const relatedData = await relatedRes.json();
              setRelatedProducts(relatedData.data || []);
            }
          }

          // Track product view
          await fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "product_view",
              productId: productId,
            }),
          }).catch(() => null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (res.ok) {
        alert("Product added to cart!");
        // Optionally redirect or show toast
      } else {
        alert("Please log in to add items to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.ok) {
        setWishlist(!wishlist);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-20 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container-custom text-center">
          <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const imageList = product.images || (product.image ? [product.image] : []);
  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Breadcrumb */}
      <div className="container-custom border-b py-4">
        <div className="flex gap-2 text-sm">
          <Link href="/" className="text-primary hover:underline">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/products" className="text-primary hover:underline">
            Products
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href={`/categories/${product.category?.slug}`}
            className="text-primary hover:underline"
          >
            {product.category?.name}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{product.name}</span>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-200">
              <img
                src={imageList[selectedImage] || "/images/placeholder.jpg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {imageList.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                      idx === selectedImage ? "border-primary" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb Category */}
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-primary text-sm hover:underline"
              >
                {product.category.name}
              </Link>
            )}

            <div>
              <h1 className="mb-2 text-4xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
                {product.compareAtPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-500 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                    <span className="rounded bg-red-500 px-2 py-1 text-white">
                      -{discountPercentage}%
                    </span>
                  </div>
                )}
              </div>
              {product.stockQuantity > 0 && product.stockQuantity < 5 && (
                <p className="font-semibold text-red-500">
                  Only {product.stockQuantity} left in stock!
                </p>
              )}
              {product.stockQuantity === 0 && (
                <p className="font-semibold text-red-500">Out of Stock</p>
              )}
            </div>

            <p className="text-gray-700">{product.shortDescription || product.description}</p>

            {/* Product Details */}
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-monospace">{product.sku}</span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Material:</span>
                  <span>{product.material}</span>
                </div>
              )}
              {product.origin && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Origin:</span>
                  <span>{product.origin}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span>{product.weight} g</span>
                </div>
              )}
            </div>

            {/* Add to Cart Section */}
            {product.stockQuantity > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="text-lg font-bold"
                  >
                    +
                  </button>
                </div>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1"
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddToWishlist}
                  className={wishlist ? "bg-red-50" : ""}
                >
                  {wishlist ? "❤️" : "🤍"}
                </Button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div className="text-center text-sm">
                <div className="mb-2 text-2xl">✓</div>
                <p className="text-gray-600">Free Returns</p>
              </div>
              <div className="text-center text-sm">
                <div className="mb-2 text-2xl">🚚</div>
                <p className="text-gray-600">Fast Shipping</p>
              </div>
              <div className="text-center text-sm">
                <div className="mb-2 text-2xl">🛡️</div>
                <p className="text-gray-600">Authentic</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t pt-12">
          <div className="mb-8 flex gap-4 border-b">
            {(["description", "reviews", "shipping"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 pb-4 font-semibold transition ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "hover:text-primary border-transparent text-gray-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="mb-4 font-bold">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="mb-2 flex gap-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <h4 className="font-semibold">{review.author}</h4>
                        <p className="mb-2 text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700">{review.comment}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-4 text-gray-700">
              <h3 className="mb-4 font-bold">Shipping Information</h3>
              <div>
                <h4 className="mb-2 font-semibold">Standard Shipping</h4>
                <p>Free shipping on orders over $100. Delivery in 5-7 business days.</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Express Shipping</h4>
                <p>$15 for 2-3 business day delivery.</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">International Shipping</h4>
                <p>Available worldwide. International rates apply.</p>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t pt-12">
            <h2 className="mb-8 text-3xl font-bold">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/products/${related.slug}`}>
                  <Card className="cursor-pointer overflow-hidden transition-transform hover:scale-105">
                    <div className="aspect-square overflow-hidden bg-gray-200">
                      <img
                        src={related.image || "/images/placeholder.jpg"}
                        alt={related.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 font-semibold">{related.name}</h3>
                      <p className="mt-2 text-xl font-bold">${related.price.toFixed(2)}</p>
                      <p className="text-sm text-yellow-500">★ {related.rating.toFixed(1)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
