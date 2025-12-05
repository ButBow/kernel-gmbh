import { useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Performance thresholds based on Web Vitals
const thresholds = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Hook to monitor Web Vitals performance metrics
 * Logs metrics to console in development, can be extended to send to analytics
 */
export function useWebVitals(onMetric?: (metric: PerformanceMetric) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reportMetric = (metric: PerformanceMetric) => {
      if (process.env.NODE_ENV === 'development') {
        const colors = {
          good: 'color: #0cce6b',
          'needs-improvement': 'color: #ffa400',
          poor: 'color: #ff4e42',
        };
        console.log(
          `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
          colors[metric.rating]
        );
      }
      onMetric?.(metric);
    };

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        const value = lastEntry.startTime;
        reportMetric({ name: 'LCP', value, rating: getRating('LCP', value) });
      }
    });

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        const value = entry.processingStart - entry.startTime;
        reportMetric({ name: 'FID', value, rating: getRating('FID', value) });
      });
    });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
    });

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          const value = entry.startTime;
          reportMetric({ name: 'FCP', value, rating: getRating('FCP', value) });
        }
      });
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      // Browser doesn't support these observers
    }

    // Report CLS on page hide
    const reportCLS = () => {
      reportMetric({ name: 'CLS', value: clsValue, rating: getRating('CLS', clsValue) });
    };

    // Navigation timing
    const reportNavigationTiming = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        reportMetric({ name: 'TTFB', value: ttfb, rating: getRating('TTFB', ttfb) });
      }
    };

    // Report on page visibility change or unload
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportCLS();
      }
    });

    // Report navigation timing after load
    if (document.readyState === 'complete') {
      reportNavigationTiming();
    } else {
      window.addEventListener('load', reportNavigationTiming);
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      fcpObserver.disconnect();
    };
  }, [onMetric]);
}
