import Image, { ImageProps } from "next/image";
import React from "react";

interface OptimizedImageProps extends ImageProps {
  // Add any additional props specific to OptimizedImage if needed
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 75, // Default quality
  priority = false, // Default priority
  loading = "lazy", // Default loading behavior
  fill = false, // Default fill behavior
  sizes,
  className,
  style,
  ...props
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      quality={quality}
      priority={priority}
      loading={loading}
      fill={fill}
      sizes={sizes}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default OptimizedImage;
