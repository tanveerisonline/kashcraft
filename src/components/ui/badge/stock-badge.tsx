import * as React from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface StockBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  stock: number;
  lowStockThreshold?: number;
}

const StockBadge: React.FC<StockBadgeProps> = ({
  stock,
  lowStockThreshold = 10,
  className,
  ...props
}) => {
  const getVariant = (currentStock: number) => {
    if (currentStock <= 0) {
      return "destructive";
    } else if (currentStock <= lowStockThreshold) {
      return "secondary"; // Could be a warning variant if available
    } else {
      return "default"; // Green-ish for in stock
    }
  };

  const getLabel = (currentStock: number) => {
    if (currentStock <= 0) {
      return "Out of Stock";
    } else if (currentStock <= lowStockThreshold) {
      return `Low Stock (${currentStock})`;
    } else {
      return "In Stock";
    }
  };

  return (
    <Badge variant={getVariant(stock)} className={cn(className)} {...props}>
      {getLabel(stock)}
    </Badge>
  );
};

export default StockBadge;
