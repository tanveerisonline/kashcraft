"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  rating: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description: string;
}

interface Testimonial {
  id: string;
  author: string;
  text: string;
  rating: number;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products - this will fail initially but that's okay
        const productsRes = await fetch("/api/products/featured?limit=4").catch(() => null);
        const categoriesRes = await fetch("/api/categories?limit=3").catch(() => null);

        if (productsRes?.ok) {
          const data = await productsRes.json();
          setFeaturedProducts(data.data || []);
        }

        if (categoriesRes?.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const testimonials: Testimonial[] = [
    {
      id: "1",
      author: "Sarah Anderson",
      text: "Absolutely beautiful quality! The craftsmanship is exceptional and the product arrived perfectly packaged.",
      rating: 5,
    },
    {
      id: "2",
      author: "Michael Chen",
      text: "I have purchased multiple items and each one has exceeded my expectations. Highly recommend KashCraft!",
      rating: 5,
    },
    {
      id: "3",
      author: "Emma Williams",
      text: "The customer service is outstanding and the authenticity of these products is unmatched.",
      rating: 5,
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="from-primary via-secondary to-accent relative overflow-hidden bg-gradient-to-r py-32 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-5xl leading-tight font-bold md:text-6xl">
              Experience Timeless Kashmiri Craftsmanship
            </h1>
            <p className="mb-8 text-lg opacity-90">
              Discover authentic, handcrafted products that bring the elegance of Kashmir to your
              home.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/products">
                <Button
                  size="lg"
                  className="text-primary w-full bg-white hover:bg-gray-100 sm:w-auto"
                >
                  Explore Collection
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white/10 sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gray-50 py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Featured Products</h2>
            <p className="text-gray-600">Handpicked selections from our collection</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-80 animate-pulse bg-gray-200" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
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
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-yellow-500">
                          ★ {product.rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">Products will be available soon</div>
          )}

          <div className="mt-12 text-center">
            <Link href="/products">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Shop by Category</h2>
            <p className="text-gray-600">Browse our curated collections</p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="cursor-pointer overflow-hidden transition-transform hover:scale-105">
                    <div className="aspect-video overflow-hidden bg-gray-200">
                      <img
                        src={category.image || "/images/placeholder.jpg"}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="mb-2 text-2xl font-bold">{category.name}</h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">Categories will be available soon</div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">What Our Customers Say</h2>
            <p className="text-gray-600">Trusted by thousands of satisfied customers</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-6 text-gray-700 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">Verified Customer</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary py-20 text-white">
        <div className="container-custom max-w-2xl">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold">Stay Updated</h2>
            <p className="mb-8 text-lg opacity-90">
              Subscribe to our newsletter for exclusive offers and new product launches
            </p>

            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg px-4 py-3 text-gray-900"
                required
              />
              <Button variant="secondary" size="lg" className="sm:w-auto">
                Subscribe
              </Button>
            </form>

            <p className="mt-4 text-sm opacity-75">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white">
                ✓
              </div>
              <h3 className="mb-2 font-bold">Authentic Products</h3>
              <p className="text-gray-600">100% genuine Kashmiri craftsmanship</p>
            </div>
            <div className="text-center">
              <div className="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white">
                ✓
              </div>
              <h3 className="mb-2 font-bold">Fast Shipping</h3>
              <p className="text-gray-600">Worldwide delivery in 5-7 business days</p>
            </div>
            <div className="text-center">
              <div className="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white">
                ✓
              </div>
              <h3 className="mb-2 font-bold">Money Back Guarantee</h3>
              <p className="text-gray-600">30-day return policy on all orders</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
