import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: { src: string; alt: string }[];
  className?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, className }) => {
  const [mainImage, setMainImage] = useState(images[0]);

  if (!images || images.length === 0) {
    return <div className="flex h-64 items-center justify-center bg-gray-100">No Images</div>;
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative h-96 w-full overflow-hidden rounded-lg border border-gray-200">
        <Image
          src={mainImage.src}
          alt={mainImage.alt}
          layout="fill"
          objectFit="contain"
          className="object-center"
        />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative h-20 w-full cursor-pointer overflow-hidden rounded-lg border-2 ${
              mainImage.src === image.src ? 'border-blue-500' : 'border-gray-200'
            }`}
            onClick={() => setMainImage(image)}
          >
            <Image
              src={image.src}
              alt={image.alt}
              layout="fill"
              objectFit="cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProductGallery };
