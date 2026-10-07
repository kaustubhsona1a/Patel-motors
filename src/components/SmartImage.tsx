import React, { useState, useEffect, useRef } from 'react';
import { resolveImageUrl, getCachedBlobUrl, getInMemoryImageUrl, isCacheableUrl, isBombayMotorsUrl } from '../lib/imageCache';

export { isBombayMotorsUrl };

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  cacheLocally?: boolean;
}

export const VEHICLE_PLACEHOLDER_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500' fill='none'><rect width='800' height='500' fill='%23121214'/><path d='M250 280 L320 200 L480 200 L550 280 Z' stroke='%23ffffff' stroke-width='4' stroke-linejoin='round' opacity='0.25'/><circle cx='320' cy='310' r='35' stroke='%23ffffff' stroke-width='4' opacity='0.25'/><circle cx='480' cy='310' r='35' stroke='%23ffffff' stroke-width='4' opacity='0.25'/><text x='50%' y='68%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' opacity='0.3' font-family='sans-serif' font-size='14' letter-spacing='2'>PHOTO PENDING</text></svg>";

export function getAlternativeMirrorUrl(_failedUrl: string, originalSrc?: string): string | null {
  if (originalSrc && originalSrc.startsWith('http') && !isBombayMotorsUrl(originalSrc)) {
    return originalSrc;
  }
  return null;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  fallbackSrc = VEHICLE_PLACEHOLDER_FALLBACK,
  alt = 'Patel Motors Motorcycle',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  onError,
  ...props
}) => {
  const isDirectlyBlocked = isBombayMotorsUrl(src);
  const resolved = !isDirectlyBlocked ? resolveImageUrl(src) : '';
  const isBlocked = isDirectlyBlocked || !resolved || isBombayMotorsUrl(resolved);
  const inMemory = !isBlocked ? getInMemoryImageUrl(resolved) : null;
  
  const [currentSrc, setCurrentSrc] = useState<string>(isBlocked ? fallbackSrc : (inMemory || resolved || fallbackSrc));
  const [isFailed, setIsFailed] = useState<boolean>(isBlocked);
  const [hasTriedAlternative, setHasTriedAlternative] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(loading === 'eager');
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset fallback status on src change
  useEffect(() => {
    setHasTriedAlternative(false);
    if (!src || isBombayMotorsUrl(src)) {
      setCurrentSrc(fallbackSrc);
      setIsFailed(true);
      return;
    }
    const nextResolved = resolveImageUrl(src);
    if (!nextResolved || isBombayMotorsUrl(nextResolved)) {
      setCurrentSrc(fallbackSrc);
      setIsFailed(true);
    } else {
      setIsFailed(false);
      setCurrentSrc(nextResolved);
    }
  }, [src, fallbackSrc]);

  // Lazy viewport observer to ensure images offscreen are never fetched prematurely
  useEffect(() => {
    if (loading === 'eager' || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px 0px', threshold: 0.01 }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [loading]);

  // Handle caching and source updates when in view
  useEffect(() => {
    if (!isInView) return;
    if (!src || isBombayMotorsUrl(src)) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    const nextResolved = resolveImageUrl(src);
    if (!nextResolved || isBombayMotorsUrl(nextResolved)) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    // 1. Instant in-memory check (0ms)
    const cached = getInMemoryImageUrl(nextResolved);
    if (cached) {
      setCurrentSrc(cached);
      setIsFailed(false);
      return;
    }

    let isMounted = true;

    // 2. Check persistent IndexedDB before network
    if (isCacheableUrl(nextResolved)) {
      getCachedBlobUrl(nextResolved)
        .then((blobUrl) => {
          if (!isMounted) return;
          if (blobUrl) {
            setCurrentSrc(blobUrl);
            setIsFailed(false);
          } else {
            setCurrentSrc(nextResolved);
            setIsFailed(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setCurrentSrc(nextResolved);
            setIsFailed(false);
          }
        });
    } else {
      setCurrentSrc(nextResolved);
      setIsFailed(false);
    }

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc, isInView]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (isBombayMotorsUrl(src) || isBombayMotorsUrl(currentSrc)) {
      setCurrentSrc(fallbackSrc);
      setIsFailed(true);
      if (onError) onError(e);
      return;
    }

    if (!hasTriedAlternative) {
      const mirror = getAlternativeMirrorUrl(currentSrc, src);
      if (mirror && mirror !== currentSrc && !isBombayMotorsUrl(mirror)) {
        setHasTriedAlternative(true);
        setCurrentSrc(mirror);
        return;
      }
    }

    if (!isFailed) {
      setIsFailed(true);
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
    }
    if (onError) {
      onError(e);
    }
  };

  if (!currentSrc && !isInView) {
    return <div ref={imgRef} className={className} />;
  }

  return (
    <img
      ref={imgRef}
      src={isInView ? currentSrc : (inMemory || fallbackSrc)}
      alt={alt}
      loading={loading}
      decoding={decoding}
      referrerPolicy="no-referrer"
      className={className}
      onError={handleError}
      {...props}
    />
  );
};
