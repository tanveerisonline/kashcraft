"use client";

import Image from "next/image";
import { RatingDisplay } from "./reviews/RatingDisplay";
import { WishlistButton } from "./products/WishlistButton";

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

export function ProductCard({
  id,
  name,
  price,
  image,
  rating = 0,
  reviewCount = 0,
  stock = 0,
  badge,
}: ProductCardProps) {
  return (
    <div className="card bg-base-100 shadow transition-shadow hover:shadow-lg">
      {badge && (
        <div className="absolute top-2 right-2 z-10">
          <span className="badge badge-primary">{badge}</span>
        </div>
      )}

      <figure className="relative h-48 bg-gray-200">
        <Image src={image} alt={name} fill className="object-cover" />
      </figure>

      <div className="card-body p-4">
        <h2 className="card-title line-clamp-2 text-sm">{name}</h2>

        {rating > 0 && <RatingDisplay rating={rating} reviewCount={reviewCount} size="sm" />}

        <p className="text-primary text-lg font-bold">${price.toFixed(2)}</p>

        <p
          className={`text-xs ${stock > 5 ? "text-success" : stock > 0 ? "text-warning" : "text-error"}`}
        >
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </p>

        <div className="card-actions mt-4 justify-between">
          <button className="btn btn-primary btn-sm flex-1">Add to Cart</button>
          <WishlistButton productId={id} />
        </div>
      </div>
    </div>
  );
}
