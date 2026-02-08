import * as React from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: OrderStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, ...props }) => {
  const getVariant = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return "default"; // Green-ish for success
      case "shipped":
        return "secondary"; // Blue-ish for in-progress
      case "processing":
        return "outline"; // Neutral for processing
      case "pending":
        return "outline"; // Neutral for pending
      case "cancelled":
        return "destructive"; // Red-ish for destructive
      case "refunded":
        return "destructive"; // Red-ish for destructive
      default:
        return "outline";
    }
  };

  const getLabel = (status: OrderStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge variant={getVariant(status)} className={cn("capitalize", className)} {...props}>
      {getLabel(status)}
    </Badge>
  );
};

export default StatusBadge;
