"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  itemCount: number;
}

export default function AccountDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await fetch("/api/user/orders").catch(() => null);
        const profileRes = await fetch("/api/user/profile").catch(() => null);

        if (ordersRes?.ok) {
          const data = await ordersRes.json();
          setOrders(data.data || []);
        }

        if (profileRes?.ok) {
          const data = await profileRes.json();
          setUser(data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container-custom">
          <div className="h-80 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container-custom py-12">
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Dashboard Cards */}
          <Card className="p-6 text-center">
            <p className="mb-2 text-gray-600">Total Orders</p>
            <p className="text-4xl font-bold">{orders.length}</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="mb-2 text-gray-600">Total Spent</p>
            <p className="text-4xl font-bold">
              ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
            </p>
          </Card>
          <Card className="p-6 text-center">
            <p className="mb-2 text-gray-600">Active Orders</p>
            <p className="text-4xl font-bold">
              {orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length}
            </p>
          </Card>
          <Card className="p-6 text-center">
            <p className="mb-2 text-gray-600">Wishlist Items</p>
            <p className="text-4xl font-bold">0</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="mb-6 border-b pb-6">
                <h3 className="mb-2 text-lg font-bold">{user?.name || "Your Name"}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              <nav className="space-y-3">
                <Link
                  href="/account"
                  className="bg-primary flex items-center gap-2 rounded-lg px-4 py-2 text-white"
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/account/profile"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100"
                >
                  👤 Profile
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100"
                >
                  📦 Orders
                </Link>
                <Link
                  href="/account/addresses"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100"
                >
                  📍 Addresses
                </Link>
                <Link
                  href="/account/wishlist"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100"
                >
                  ❤️ Wishlist
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  🚪 Sign Out
                </Link>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <h2 className="mb-6 text-2xl font-bold">Recent Orders</h2>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">{order.itemCount} item(s)</p>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                        <Link href={`/account/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="mb-6 text-gray-600">You haven't made any orders yet</p>
                <Link href="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </Card>
            )}

            {orders.length > 5 && (
              <div className="mt-6 text-center">
                <Link href="/account/orders">
                  <Button variant="outline">View All Orders</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
