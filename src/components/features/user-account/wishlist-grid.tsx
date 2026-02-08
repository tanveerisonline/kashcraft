import React from "react";
import { ProductCardProps } from "../../product-display/product-card";
import ProductCard from "../../product-display/product-card"; // Assuming ProductCard is in this path

interface WishlistGridProps {
  wishlistItems: ProductCardProps[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

const WishlistGrid: React.FC<WishlistGridProps> = ({
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Wishlist</h2>

      {wishlistItems.length === 0 ? (
        <p className="text-center text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlistItems.map((item) => (
            <ProductCard
              key={item.id}
              {...item}
              // You might want to add specific actions for wishlist items here
              // For example, an "Add to Cart" button or "Remove from Wishlist"
              // For now, we'll just pass the existing ProductCard props
            >
              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => onRemoveFromWishlist(item.id)}>
                  Remove
                </Button>
                <Button size="sm" onClick={() => onAddToCart(item.id)}>
                  Add to Cart
                </Button>
              </div>
            </ProductCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistGrid;
