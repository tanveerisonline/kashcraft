"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export function ImageGallery({ images, alt = "Product" }: ImageGalleryProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) return <div className="skeleton h-96" />;

  return (
    <div className="space-y-4">
      <div className="relative h-96 overflow-hidden rounded-lg bg-gray-100">
        <Image src={images[currentIdx]} alt={alt} fill className="object-cover" />

        {images.length > 1 && (
          <>
            <button
              className="btn btn-circle btn-outline absolute top-1/2 left-4 -translate-y-1/2 bg-white"
              onClick={handlePrev}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="btn btn-circle btn-outline absolute top-1/2 right-4 -translate-y-1/2 bg-white"
              onClick={handleNext}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-16 w-16 rounded ${idx === currentIdx ? "ring-primary ring-2" : ""}`}
            >
              <Image
                src={img}
                alt={`${alt} ${idx + 1}`}
                width={64}
                height={64}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
