import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  type?: "card" | "text" | "image" | "custom";
  className?: string;
  count?: number; // For text skeletons, how many lines
  width?: string; // For custom skeletons
  height?: string; // For custom skeletons
}

const Skeleton: React.FC<SkeletonProps> = ({
  type = "custom",
  className,
  count = 1,
  width,
  height,
}) => {
  const baseClasses = "animate-pulse bg-gray-200 rounded-md";

  if (type === "card") {
    return <div className={cn(baseClasses, "h-48 w-full", className)} />;
  }

  if (type === "image") {
    return <div className={cn(baseClasses, "h-32 w-32", className)} />;
  }

  if (type === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, "h-4", {
              "w-full": i === 0,
              "w-11/12": i === 1,
              "w-10/12": i === 2,
              "w-9/12": i === 3,
              "w-8/12": i === 4,
            })}
          />
        ))}
      </div>
    );
  }

  // Custom skeleton
  return <div className={cn(baseClasses, className)} style={{ width, height }} />;
};

export default Skeleton;
