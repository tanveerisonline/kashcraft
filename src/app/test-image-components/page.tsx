"use client";

import React from "react";
import OptimizedImage from "@/components/ui/image/optimized-image";
import ImageGallery from "@/components/ui/image/image-gallery";
import ImageZoom from "@/components/ui/image/image-zoom";
import ImagePlaceholder from "@/components/ui/image/image-placeholder";

const dummyImages = [
  { src: "/images/product-1.jpg", alt: "Product 1" },
  { src: "/images/product-2.jpg", alt: "Product 2" },
  { src: "/images/product-3.jpg", alt: "Product 3" },
  { src: "/images/product-4.jpg", alt: "Product 4" },
];

const TestImageComponentsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Image Components Test Page</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">OptimizedImage</h2>
        <div className="flex justify-center">
          <OptimizedImage
            src="/images/hero-banner.jpg"
            alt="Hero Banner"
            width={800}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">ImageGallery</h2>
        <div className="flex justify-center">
          <ImageGallery
            images={dummyImages}
            mainImageWidth={500}
            mainImageHeight={350}
            thumbnailSize={70}
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">ImageZoom</h2>
        <div className="flex justify-center">
          <ImageZoom
            src="/images/zoom-product.jpg"
            alt="Zoomable Product"
            width={400}
            height={300}
            zoomScale={2}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">ImagePlaceholder</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <ImagePlaceholder width={200} height={150} className="rounded-lg shadow-md" />
          <ImagePlaceholder width={100} height={100} iconClassName="h-full w-full" />
          <ImagePlaceholder width={300} height={200} className="border-2 border-dashed border-gray-300" />
        </div>
      </section>
    </div>
  );
};

export default TestImageComponentsPage;
