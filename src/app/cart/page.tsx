"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyCouponLoading, setApplyCouponLoading] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          setCart(data.data);
        } else if (res.status === 401) {
          // User not authenticated
          setCart({ items: [], totalAmount: 0 });
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    try {
      const res = await fetch("/api/cart/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const res = await fetch("/api/cart/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });

      if (res.ok) {
        const data = await res.json();
        setCouponDiscount(data.discount);
        alert(`Coupon applied! Discount: $${data.discount.toFixed(2)}`);
      } else {
        alert("Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      alert("Error applying coupon");
    } finally {
      setApplyCouponLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container-custom">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
            <div className="h-40 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container-custom text-center">
          <h1 className="mb-4 text-4xl font-bold">Shopping Cart</h1>
          <div className="mx-auto max-w-md">
            <div className="mb-4 text-6xl">🛒</div>
            <p className="mb-8 text-gray-600">Your cart is empty</p>
            <Link href="/products">
              <Button size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalAmount;
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping - couponDiscount;

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Breadcrumb */}
      <div className="container-custom border-b py-4">
        <div className="flex gap-2 text-sm">
          <Link href="/" className="text-primary hover:underline">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Cart</span>
        </div>
      </div>

      <div className="container-custom py-12">
        <h1 className="mb-8 text-4xl font-bold">Shopping Cart</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <Card key={item.productId} className="p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                    <img
                      src={item.image || "/images/placeholder.jpg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="mb-4 text-gray-600">${item.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-lg border px-2 py-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-lg font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="font-bold text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <div className="py-8 text-center">
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card className="sticky top-4 p-6">
              <h2 className="mb-4 text-lg font-bold">Order Summary</h2>

              {/* Coupon Input */}
              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-600">Have a coupon?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="focus:ring-primary flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                  />
                  <Button size="sm" onClick={handleApplyCoupon} disabled={applyCouponLoading}>
                    {applyCouponLoading ? "..." : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-4 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {shipping === 0 && (
                <p className="mb-4 rounded bg-green-50 p-2 text-xs text-green-600">
                  ✓ Free shipping on this order
                </p>
              )}

              <Link href="/checkout" className="block">
                <Button size="lg" className="mb-2 w-full">
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="text-xs text-gray-500">
                ✓ Secure checkout ✓ 30-day returns ✓ Free support
              </div>
            </Card>

            {/* Trust Badges */}
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span>✓</span>
                <span className="text-gray-600">Authentic products</span>
              </div>
              <div className="flex gap-2">
                <span>✓</span>
                <span className="text-gray-600">Secure payment</span>
              </div>
              <div className="flex gap-2">
                <span>✓</span>
                <span className="text-gray-600">Fast shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
