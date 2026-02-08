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
  status: string;
  itemCount: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/user/orders").catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container-custom py-12">
        <h1 className="mb-8 text-4xl font-bold">My Orders</h1>

        {/* Filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto">
          {["all", "PENDING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-4 py-2 whitespace-nowrap transition ${
                filter === status
                  ? "bg-primary text-white"
                  : "hover:border-primary border border-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-sm text-gray-600">{order.itemCount} items</p>
                      <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                    </div>
                    <span
                      className={`rounded-full px-4 py-2 font-semibold ${
                        order.status === "DELIVERED"
                          ? "bg-green-100 text-green-800"
                          : order.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="mb-6 text-gray-600">No orders found</p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
