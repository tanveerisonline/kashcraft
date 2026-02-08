"use client";

import { Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";

interface CartItemRowProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  onQuantityChange?: (newQuantity: number) => void;
  onRemove?: () => void;
}

export function CartItemRow({
  id,
  name,
  price,
  quantity,
  image,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  return (
    <div className="border-base-200 bg-base-50 flex items-center gap-4 rounded-lg border p-4">
      {image && (
        <figure className="relative h-20 w-20 flex-shrink-0 rounded bg-gray-100">
          <Image src={image} alt={name} fill className="object-cover" />
        </figure>
      )}

      <div className="flex-1">
        <p className="font-semibold">{name}</p>
        <p className="text-primary font-bold">${(price * quantity).toFixed(2)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-ghost btn-xs" onClick={() => onQuantityChange?.(quantity - 1)}>
          <Minus size={14} />
        </button>
        <span className="w-8 text-center font-semibold">{quantity}</span>
        <button className="btn btn-ghost btn-xs" onClick={() => onQuantityChange?.(quantity + 1)}>
          <Plus size={14} />
        </button>
      </div>

      <button className="btn btn-ghost btn-sm" onClick={onRemove}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}
