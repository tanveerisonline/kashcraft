"use client";

interface PromoBadgeProps {
  text: string;
  type?: "new" | "sale" | "limited" | "popular";
}

export function PromoBadge({ text, type = "sale" }: PromoBadgeProps) {
  const badgeClasses: Record<string, string> = {
    new: "badge-info",
    sale: "badge-error",
    limited: "badge-warning",
    popular: "badge-success",
  };

  const badgeText: Record<string, string> = {
    new: "🆕",
    sale: "🔥",
    limited: "⏰",
    popular: "⭐",
  };

  return (
    <div className={`badge ${badgeClasses[type]} font-bold text-white`}>
      {badgeText[type]} {text}
    </div>
  );
}
