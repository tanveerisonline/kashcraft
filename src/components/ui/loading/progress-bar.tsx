import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // Current progress (0-100)
  max?: number; // Maximum value (default 100)
  className?: string;
  indicatorClassName?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  indicatorClassName,
}) => {
  const progress = Math.max(0, Math.min(value, max)); // Ensure value is within 0-max
  const percentage = (progress / max) * 100;

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-200", className)}>
      <div
        className={cn("bg-primary h-full transition-all duration-300 ease-out", indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
