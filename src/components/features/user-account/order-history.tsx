import React from "react";
import Link from "next/link";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";

interface Order {
  id: string;
  date: string;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: { name: string; quantity: number }[];
}

interface OrderHistoryProps {
  orders: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Order History</h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Order #{order.id}</CardTitle>
                <Badge
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${order.status === "Delivered" && "bg-green-100 text-green-800"} ${order.status === "Shipped" && "bg-blue-100 text-blue-800"} ${order.status === "Processing" && "bg-yellow-100 text-yellow-800"} ${order.status === "Pending" && "bg-gray-100 text-gray-800"} ${order.status === "Cancelled" && "bg-red-100 text-red-800"} `}
                >
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-gray-600">Date: {order.date}</p>
                <p className="mb-2 text-sm text-gray-600">Total: ${order.total.toFixed(2)}</p>
                <div className="text-sm text-gray-700">
                  <p className="mb-1 font-medium">Items:</p>
                  <ul className="list-inside list-disc">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} (x{item.quantity})
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
