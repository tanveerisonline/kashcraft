"use client";

interface RatingDisplayProps {
  rating: number;
  reviewCount: number;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { star: 14, text: "text-xs" },
  md: { star: 18, text: "text-sm" },
  lg: { star: 24, text: "text-lg" },
};

export function RatingDisplay({ rating, reviewCount, size = "md" }: RatingDisplayProps) {
  const roundedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeConfig = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-warning">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="text-warning">⯨</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">
            ★
          </span>
        ))}
      </div>
      <span className={`font-semibold ${sizeConfig.text}`}>{roundedRating}</span>
      {reviewCount > 0 && (
        <span className={`text-gray-500 ${sizeConfig.text}`}>({reviewCount})</span>
      )}
    </div>
  );
}
