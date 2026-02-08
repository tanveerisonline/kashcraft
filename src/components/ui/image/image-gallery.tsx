"use client";

import React, { useState } from "react";
import OptimizedImage from "./optimized-image";
import { cn } from "@/lib/utils"; // Assuming a utility for class names exists

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
  thumbnailSize?: number;
  mainImageWidth?: number;
  mainImageHeight?: number;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  thumbnailSize = 80,
  mainImageWidth = 600,
  mainImageHeight = 400,
  className,
}) => {
  const [mainImage, setMainImage] = useState(images[0]);

  if (!images || images.length === 0) {
    return <div className="text-center text-gray-500">No images to display.</div>;
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="mb-4 overflow-hidden rounded-lg border">
        <OptimizedImage
          src={mainImage.src}
          alt={mainImage.alt}
          width={mainImageWidth}
          height={mainImageHeight}
          className="object-cover"
        />
      </div>
      <div className="flex space-x-2 overflow-x-auto p-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "cursor-pointer rounded-md border-2 transition-all duration-200",
              mainImage.src === image.src
                ? "border-primary"
                : "border-transparent hover:border-gray-300"
            )}
            onClick={() => setMainImage(image)}
            style={{ minWidth: thumbnailSize, minHeight: thumbnailSize }}
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              width={thumbnailSize}
              height={thumbnailSize}
              className="rounded-md object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
