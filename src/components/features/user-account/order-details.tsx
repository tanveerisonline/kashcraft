import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderDetailsProps {
  order: {
    id: string;
    date: string;
    total: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: string;
    items: OrderItem[];
  };
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Details #{order.id}</h2>
        <Badge
          className={`px-3 py-1 rounded-full text-sm font-semibold
            ${order.status === 'Delivered' && 'bg-green-100 text-green-800'}
            ${order.status === 'Shipped' && 'bg-blue-100 text-blue-800'}
            ${order.status === 'Processing' && 'bg-yellow-100 text-yellow-800'}
            ${order.status === 'Pending' && 'bg-gray-100 text-gray-800'}
            ${order.status === 'Cancelled' && 'bg-red-100 text-red-800'}
          `}
        >
          {order.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p><span className="font-medium">Order ID:</span> {order.id}</p>
            <p><span className="font-medium">Order Date:</span> {order.date}</p>
            <p><span className="font-medium">Total Amount:</span> ${order.total.toFixed(2)}</p>
          </div>
          <div>
            <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
          <p>{order.shippingAddress.country}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
