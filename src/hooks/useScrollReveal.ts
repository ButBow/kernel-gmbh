import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  // Separate margins for entering (bottom) and leaving (top)
  enterMargin?: string;
  leaveMargin?: string;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { 
    threshold = 0.1,
    // Element appears when 80px from bottom of viewport
    enterMargin = '0px 0px -80px 0px',
    // Element disappears only when 200px above viewport (generous buffer)
    leaveMargin = '200px 0px -80px 0px'
  } = options;
  
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const wasVisible = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Use different margins based on scroll direction
    const observer = new IntersectionObserver(
      ([entry]) => {
        const rect = entry.boundingClientRect;
        const viewportHeight = window.innerHeight;
        
        if (entry.isIntersecting) {
          // Element is entering view
          setIsVisible(true);
          wasVisible.current = true;
        } else if (wasVisible.current) {
          // Element was visible, check if it's really out of view
          // Only hide if element top is above viewport by a good margin
          // or element bottom is below viewport
          const isAboveViewport = rect.bottom < -100; // 100px buffer above
          const isBelowViewport = rect.top > viewportHeight + 50;
          
          if (isAboveViewport || isBelowViewport) {
            setIsVisible(false);
            wasVisible.current = false;
          }
        }
      },
      { 
        threshold: [0, threshold, 0.5],
        rootMargin: leaveMargin 
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, enterMargin, leaveMargin]);

  return { ref, isVisible };
}

// Lazy loading hook for images
export function useLazyLoad<T extends HTMLElement = HTMLImageElement>() {
  const ref = useRef<T>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

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
  }, []);

  return { ref, shouldLoad, isLoaded, setIsLoaded };
}
