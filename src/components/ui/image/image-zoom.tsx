"use client";

import React, { useState } from "react";
import OptimizedImage from "./optimized-image";
import { cn } from "@/lib/utils";

interface ImageZoomProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  zoomScale?: number;
  className?: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({
  src,
  alt,
  width,
  height,
  zoomScale = 1.5,
  className,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  return (
    <div
      className={cn("relative cursor-zoom-in overflow-hidden", className)}
      style={{ width, height }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-transform duration-300 ease-in-out",
          isZoomed ? `scale-[${zoomScale}]` : "scale-100"
        )}
        style={{ transformOrigin: "center center" }}
      />
    </div>
  );
};

export default ImageZoom;
