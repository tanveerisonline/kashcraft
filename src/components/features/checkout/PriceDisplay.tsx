"use client";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currencySymbol?: string;
}

export function PriceDisplay({ price, originalPrice, currencySymbol = "$" }: PriceDisplayProps) {
  const savings = originalPrice ? originalPrice - price : 0;
  const discountPercent = originalPrice ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-primary text-3xl font-bold">
        {currencySymbol}
        {price.toFixed(2)}
      </span>

      {originalPrice && originalPrice > price && (
        <>
          <span className="text-lg text-gray-400 line-through">
            {currencySymbol}
            {originalPrice.toFixed(2)}
          </span>
          <span className="badge badge-error font-bold">-${savings.toFixed(2)}</span>
        </>
      )}
    </div>
  );
}
