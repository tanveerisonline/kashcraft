"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  totalStars?: number;
  size?: number; // Size in pixels for width and height
  fillColor?: string;
  emptyColor?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalStars = 5,
  size = 16, // Default size 16px
  fillColor = "text-yellow-500",
  emptyColor = "text-gray-300",
}) => {
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, i) => (
        <Star
          key={i}
          className={`${i < rating ? fillColor : emptyColor}`}
          style={{ width: size, height: size }}
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
};

export default RatingStars;
