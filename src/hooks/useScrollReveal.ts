import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -80px 0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

// Multi-element observer for staggered animations
export function useMultiScrollReveal(count: number, options: UseScrollRevealOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(count).fill(false));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleItems(new Array(count).fill(true));
          observer.unobserve(container);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [count, threshold, rootMargin]);

  return { containerRef, visibleItems, allVisible: visibleItems.every(v => v) };
}
