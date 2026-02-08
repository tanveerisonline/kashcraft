import React from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
  iconClassName?: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  width = 100,
  height = 100,
  className,
  iconClassName,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gray-100 text-gray-400 rounded-md",
        className,
      )}
      style={{ width, height }}
    >
      <ImageOff className={cn("h-1/2 w-1/2", iconClassName)} />
    </div>
  );
};

export default ImagePlaceholder;
