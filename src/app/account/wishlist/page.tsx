"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  rating: number;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist").catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          setItems(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveItem = async (wishlistId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: wishlistId }),
      });

      if (res.ok) {
        setItems(items.filter((item) => item.id !== wishlistId));
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        alert("Added to cart!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container-custom py-12">
        <h1 className="mb-8 text-4xl font-bold">My Wishlist</h1>

        {loading ? (
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square overflow-hidden bg-gray-200">
                  <img
                    src={item.image || "/images/placeholder.jpg"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{item.name}</h3>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xl font-bold">${item.price.toFixed(2)}</span>
                    <span className="text-sm text-yellow-500">★ {item.rating.toFixed(1)}</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddToCart(item.productId)}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red-200 text-red-500"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="mb-6 text-gray-600">Your wishlist is empty</p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
