import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '@/lib/storage';

const ANALYTICS_KEY = 'cms_analytics';
const CONSENT_KEY = 'cookie_consent';

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'product_click' | 'category_click' | 'contact_click' | 'scroll_depth' | 'time_on_page';
  page: string;
  data?: Record<string, string | number>;
  timestamp: string;
  sessionId: string;
}

export interface AnalyticsSummary {
  totalPageViews: number;
  pageViews: Record<string, number>;
  productClicks: Record<string, number>;
  categoryClicks: Record<string, number>;
  avgScrollDepth: number;
  avgTimeOnPage: number;
  sessions: number;
}

interface AnalyticsContextType {
  events: AnalyticsEvent[];
  summary: AnalyticsSummary;
  consentGiven: boolean | null;
  setConsent: (consent: boolean) => void;
  trackEvent: (type: AnalyticsEvent['type'], page: string, data?: Record<string, string | number>) => void;
  clearAnalytics: () => void;
  importAnalytics: (newEvents: AnalyticsEvent[], mode: 'replace' | 'merge') => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

function generateSessionId(): string {
  const existing = sessionStorage.getItem('session_id');
  if (existing) return existing;
  const newId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', newId);
  return newId;
}

function calculateSummary(events: AnalyticsEvent[]): AnalyticsSummary {
  const summary: AnalyticsSummary = {
    totalPageViews: 0,
    pageViews: {},
    productClicks: {},
    categoryClicks: {},
    avgScrollDepth: 0,
    avgTimeOnPage: 0,
    sessions: 0
  };

  const scrollDepths: number[] = [];
  const timesOnPage: number[] = [];
  const sessionIds = new Set<string>();

  events.forEach(event => {
    sessionIds.add(event.sessionId);

    switch (event.type) {
      case 'page_view':
        summary.totalPageViews++;
        summary.pageViews[event.page] = (summary.pageViews[event.page] || 0) + 1;
        break;
      case 'product_click':
        const productName = event.data?.productName as string || 'unknown';
        summary.productClicks[productName] = (summary.productClicks[productName] || 0) + 1;
        break;
      case 'category_click':
        const categoryName = event.data?.categoryName as string || 'unknown';
        summary.categoryClicks[categoryName] = (summary.categoryClicks[categoryName] || 0) + 1;
        break;
      case 'scroll_depth':
        if (event.data?.depth) scrollDepths.push(event.data.depth as number);
        break;
      case 'time_on_page':
        if (event.data?.seconds) timesOnPage.push(event.data.seconds as number);
        break;
    }
  });

  summary.sessions = sessionIds.size;
  summary.avgScrollDepth = scrollDepths.length > 0 
    ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length) 
    : 0;
  summary.avgTimeOnPage = timesOnPage.length > 0 
    ? Math.round(timesOnPage.reduce((a, b) => a + b, 0) / timesOnPage.length) 
    : 0;

  return summary;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary>(calculateSummary([]));

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent !== null) {
      setConsentGiven(consent === 'true');
    }
    
    const storedEvents = getStorageItem<AnalyticsEvent[]>(ANALYTICS_KEY, []);
    setEvents(storedEvents);
    setSummary(calculateSummary(storedEvents));
  }, []);

  const setConsent = useCallback((consent: boolean) => {
    localStorage.setItem(CONSENT_KEY, String(consent));
    setConsentGiven(consent);
  }, []);

  const trackEvent = useCallback((
    type: AnalyticsEvent['type'], 
    page: string, 
    data?: Record<string, string | number>
  ) => {
    if (!consentGiven) return;

    const newEvent: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      page,
      data,
      timestamp: new Date().toISOString(),
      sessionId: generateSessionId()
    };

    setEvents(prev => {
      const updated = [...prev, newEvent].slice(-1000); // Keep last 1000 events
      setStorageItem(ANALYTICS_KEY, updated);
      setSummary(calculateSummary(updated));
      return updated;
    });
  }, [consentGiven]);

  const clearAnalytics = useCallback(() => {
    setEvents([]);
    setStorageItem(ANALYTICS_KEY, []);
    setSummary(calculateSummary([]));
  }, []);

  const importAnalytics = useCallback((newEvents: AnalyticsEvent[], mode: 'replace' | 'merge') => {
    let updated: AnalyticsEvent[];
    if (mode === 'replace') {
      updated = newEvents;
    } else {
      // Merge: add new events, avoid duplicates by id
      const existingIds = new Set(events.map(e => e.id));
      const uniqueNew = newEvents.filter(e => !existingIds.has(e.id));
      updated = [...events, ...uniqueNew].slice(-1000);
    }
    setEvents(updated);
    setStorageItem(ANALYTICS_KEY, updated);
    setSummary(calculateSummary(updated));
  }, [events]);

  return (
    <AnalyticsContext.Provider value={{
      events,
      summary,
      consentGiven,
      setConsent,
      trackEvent,
      clearAnalytics,
      importAnalytics
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
