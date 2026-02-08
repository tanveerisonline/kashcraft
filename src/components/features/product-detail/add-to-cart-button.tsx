import React from "react";
import { Button } from "../../ui/button"; // Assuming Button component exists

interface AddToCartButtonProps {
  productId: string;
  onAddToCart: (productId: string) => void;
  className?: string;
  disabled?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  onAddToCart,
  className,
  disabled,
}) => {
  const handleClick = () => {
    onAddToCart(productId);
  };

  return (
    <Button onClick={handleClick} className={`w-full ${className}`} disabled={disabled}>
      Add to Cart
    </Button>
  );
};

export { AddToCartButton };
