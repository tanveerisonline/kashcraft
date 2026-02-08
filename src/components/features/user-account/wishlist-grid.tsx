import React from "react";
import { ProductCard } from "../../product-display/product-card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  badge?: string;
}

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
            <div key={item.id} className="relative">
              <ProductCard
                product={{
                  id: item.id,
                  name: item.name,
                  imageUrl: item.image,
                  price: item.price,
                  rating: item.rating,
                  href: `/products/${item.id}`,
                }}
              />
              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => onRemoveFromWishlist(item.id)}>
                  Remove
                </Button>
                <Button size="sm" onClick={() => onAddToCart(item.id)}>
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistGrid;
