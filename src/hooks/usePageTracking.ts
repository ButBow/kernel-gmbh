import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export function usePageTracking() {
  const location = useLocation();
  const { trackEvent, consentGiven } = useAnalytics();
  const startTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);

  useEffect(() => {
    if (!consentGiven) return;

    // Track page view
    trackEvent('page_view', location.pathname);

    // Reset tracking for new page
    startTime.current = Date.now();
    maxScrollDepth.current = 0;

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const currentDepth = Math.round((window.scrollY / scrollHeight) * 100);
        if (currentDepth > maxScrollDepth.current) {
          maxScrollDepth.current = currentDepth;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track time on page when leaving
    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      if (timeSpent > 3) { // Only track if spent more than 3 seconds
        trackEvent('time_on_page', location.pathname, { seconds: timeSpent });
      }
      
      if (maxScrollDepth.current > 0) {
        trackEvent('scroll_depth', location.pathname, { depth: maxScrollDepth.current });
      }
    };
  }, [location.pathname, consentGiven, trackEvent]);
}
