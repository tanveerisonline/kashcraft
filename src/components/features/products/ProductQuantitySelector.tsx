"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface ProductQuantitySelectorProps {
  maxStock: number;
  onQuantityChange?: (quantity: number) => void;
}

export function ProductQuantitySelector({
  maxStock,
  onQuantityChange,
}: ProductQuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);

  const handleChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">Quantity</span>
        <span className="label-text-alt text-gray-500">Max: {maxStock}</span>
      </label>
      <div className="join border-base-300 rounded border">
        <button
          type="button"
          className="join-item btn btn-ghost"
          onClick={() => handleChange(quantity - 1)}
          disabled={quantity === 1}
        >
          <Minus size={18} />
        </button>
        <input
          type="number"
          min="1"
          max={maxStock}
          value={quantity}
          onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
          className="join-item input input-bordered w-20 text-center"
        />
        <button
          type="button"
          className="join-item btn btn-ghost"
          onClick={() => handleChange(quantity + 1)}
          disabled={quantity === maxStock}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
