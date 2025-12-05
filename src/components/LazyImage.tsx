import { useState, useRef, useEffect, ImgHTMLAttributes, memo } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  placeholder?: string;
  /** Blur placeholder data URL */
  blurDataUrl?: string;
  /** Whether to use native lazy loading only (faster but less control) */
  nativeOnly?: boolean;
  /** Priority loading - skip lazy loading for above-the-fold images */
  priority?: boolean;
  /** Aspect ratio for placeholder (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string;
}

/**
 * Optimized lazy loading image component with:
 * - Intersection Observer for lazy loading
 * - Blur placeholder support
 * - Native lazy loading fallback
 * - Skeleton loading state
 * - Fade-in animation on load
 */
export const LazyImage = memo(function LazyImage({ 
  src, 
  alt, 
  className, 
  placeholder,
  blurDataUrl,
  nativeOnly = false,
  priority = false,
  aspectRatio,
  style,
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority || nativeOnly);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip observer if priority or nativeOnly
    if (priority || nativeOnly) {
      setShouldLoad(true);
      return;
    }

    const element = imgRef.current;
    if (!element) return;

    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.unobserve(element);
        }
      },
      { 
        rootMargin: '200px 0px', // Start loading 200px before visible
        threshold: 0 
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [priority, nativeOnly]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const containerStyle = aspectRatio 
    ? { ...style, aspectRatio } 
    : style;

  return (
    <div 
      ref={imgRef} 
      className={cn('relative overflow-hidden bg-muted', className)}
      style={containerStyle}
    >
      {/* Blur placeholder */}
      {blurDataUrl && !isLoaded && (
        <img
          src={blurDataUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
        />
      )}

      {/* Skeleton placeholder */}
      {!blurDataUrl && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Bild nicht verfügbar</span>
        </div>
      )}
      
      {/* Actual image */}
      {shouldLoad && !hasError && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
});

/**
 * Responsive image component with srcset support
 */
interface ResponsiveImageProps extends Omit<LazyImageProps, 'srcSet'> {
  /** Array of image sources with widths: [{src: '/img-400.jpg', width: 400}, ...] */
  srcSet?: { src: string; width: number }[];
  /** Sizes attribute for responsive images */
  sizes?: string;
}

export const ResponsiveImage = memo(function ResponsiveImage({
  src,
  srcSet,
  sizes = '100vw',
  ...props
}: ResponsiveImageProps) {
  const srcSetString = srcSet
    ?.map(({ src, width }) => `${src} ${width}w`)
    .join(', ');

  return (
    <LazyImage
      src={src}
      {...(srcSetString && { srcSet: srcSetString })}
      sizes={sizes}
      {...props}
    />
  );
});

export default LazyImage;
