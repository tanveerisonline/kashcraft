import React, { useState } from 'react';
import { Select } from '../../ui/select'; // Assuming Select component exists
import { Input } from '../../ui/input'; // Assuming Input component exists
import { Button } from '../../ui/button'; // Assuming Button component exists

interface ProductOptionsProps {
  options: {
    colors?: string[];
    sizes?: string[];
  };
  onAddToCart: (selectedOptions: { color?: string; size?: string; quantity: number }) => void;
  className?: string;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({ options, onAddToCart, className }) => {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(options.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(options.sizes?.[0]);
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddToCart = () => {
    onAddToCart({ color: selectedColor, size: selectedSize, quantity });
  };

  return (
    <div className={`mt-6 ${className}`}>
      {options.colors && options.colors.length > 0 && (
        <div className="mb-4">
          <label htmlFor="color-select" className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <Select
            id="color-select"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="mt-1 block w-full"
          >
            {options.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </Select>
        </div>
      )}

      {options.sizes && options.sizes.length > 0 && (
        <div className="mb-4">
          <label htmlFor="size-select" className="block text-sm font-medium text-gray-700">
            Size
          </label>
          <Select
            id="size-select"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="mt-1 block w-full"
          >
            {options.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-700">
          Quantity
        </label>
        <Input
          id="quantity-input"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="mt-1 block w-20"
        />
      </div>

      <Button onClick={handleAddToCart} className="w-full">
        Add to Cart
      </Button>
    </div>
  );
};

export { ProductOptions };
