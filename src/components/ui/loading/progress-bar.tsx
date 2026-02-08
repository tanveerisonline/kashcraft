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
    <div
      className={cn(
        "w-full h-2 bg-gray-200 rounded-full overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "h-full bg-primary transition-all duration-300 ease-out",
          indicatorClassName,
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
