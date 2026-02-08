import Image, { ImageProps, StaticImageData } from 'next/image';
import { CSSProperties, useState } from 'react';

// Prompt 126: Image optimization utilities

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string;
  blurDataURL?: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Optimized Image Component with lazy loading and blur placeholder
 */
export const OptimizedImage = ({
  src,
  alt,
  blurDataURL,
  className = '',
  containerClassName = '',
  priority = false,
  sizes = '100vw',
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <Image
        src={src}
        alt={alt}
        priority={priority}
        sizes={sizes}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoadingComplete={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        {...props}
      />
    </div>
  );
};

/**
 * Product Image Component with optimized settings
 */
export const ProductImage = ({
  src,
  alt,
  blurDataURL,
  priority = false,
  ...props
}: OptimizedImageProps) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      blurDataURL={blurDataURL}
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="h-auto w-full object-cover"
      {...props}
    />
  );
};

/**
 * Hero Image Component - Priority loaded, full width
 */
export const HeroImage = ({
  src,
  alt,
  blurDataURL,
  ...props
}: OptimizedImageProps) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      blurDataURL={blurDataURL}
      priority={true}
      sizes="100vw"
      fill
      className="object-cover"
      containerClassName="relative w-full h-96"
      {...props}
    />
  );
};

/**
 * Thumbnail Image Component - Small, lazy loaded
 */
export const ThumbnailImage = ({
  src,
  alt,
  blurDataURL,
  ...props
}: OptimizedImageProps) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      blurDataURL={blurDataURL}
      priority={false}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      width={200}
      height={200}
      className="h-full w-full object-cover"
      {...props}
    />
  );
};

/**
 * Avatar Image Component - Circular small image
 */
export const AvatarImage = ({
  src,
  alt,
  blurDataURL,
  className = '',
  ...props
}: OptimizedImageProps) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      blurDataURL={blurDataURL}
      priority={false}
      sizes="(max-width: 640px) 32px, 48px"
      width={48}
      height={48}
      className={`rounded-full object-cover ${className}`}
      {...props}
    />
  );
};

/**
 * Background Image Component - CSS background with optimization
 */
export const BackgroundImage = ({
  src,
  alt,
  blurDataURL,
  children,
  className = '',
}: OptimizedImageProps & { children?: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      style={{
        backgroundImage: isLoaded ? `url('${typeof src === 'string' ? src : src}')` : undefined,
        backgroundColor: blurDataURL ? `url('${blurDataURL}')` : '#f0f0f0',
      }}
      onLoad={() => setIsLoaded(true)}
    >
      {children}
    </div>
  );
};

/**
 * Generate blur data URL for images (placeholder)
 * In production, use next/image's advanced blur hash library
 */
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  // Base64 encoded 1x1 gray pixel as placeholder
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
};

/**
 * Image srcSet generator for responsive images
 */
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920]
): string => {
  return sizes
    .map((size) => {
      const url = baseUrl.includes('?')
        ? `${baseUrl}&w=${size}&q=75`
        : `${baseUrl}?w=${size}&q=75`;
      return `${url} ${size}w`;
    })
    .join(', ');
};

/**
 * Image optimization: Get optimized URL with quality and size parameters
 */
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  quality: number = 75
): string => {
  if (!url) return '';

  // Handle Cloudinary URLs
  if (url.includes('cloudinary')) {
    const params = new URL(url);
    params.searchParams.set('q_auto', 'best');
    params.searchParams.set('f_auto', 'true');
    if (width) params.searchParams.set('w', width.toString());
    params.searchParams.set('q', quality.toString());
    return params.toString();
  }

  // Handle standard URLs
  const separator = url.includes('?') ? '&' : '?';
  let optimized = `${url}${separator}q=${quality}`;
  if (width) optimized += `&w=${width}`;
  return optimized;
};

/**
 * Image lazy loading configuration
 */
export const lazyLoadingConfig = {
  rootMargin: '50px',
  threshold: 0,
};

/**
 * IntersectionObserver based lazy loading for images
 */
export const useImageLazyLoad = (ref: React.RefObject<HTMLImageElement>) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, lazyLoadingConfig);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
};
