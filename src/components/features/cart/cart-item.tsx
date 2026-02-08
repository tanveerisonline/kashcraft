import React from "react";
import Image from "next/image";
import { Button } from "../../ui/button"; // Assuming Button component exists

interface CartItemProps {
  item: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    quantity: number;
  };
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="flex items-center space-x-4 border-b border-gray-200 py-4 last:border-b-0">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
        <div className="mt-2 flex items-center">
          <label htmlFor={`quantity-${item.id}`} className="sr-only">
            Quantity
          </label>
          <input
            type="number"
            id={`quantity-${item.id}`}
            name={`quantity-${item.id}`}
            min="1"
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
            className="w-16 rounded-md border border-gray-300 px-2 py-1 text-center text-sm"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="ml-4 text-red-600 hover:text-red-800"
          >
            Remove
          </Button>
        </div>
      </div>
      <div className="text-lg font-medium text-gray-900">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
};

export { CartItem };
