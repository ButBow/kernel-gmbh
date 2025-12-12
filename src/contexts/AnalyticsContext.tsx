import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { TrackingType, defaultCookieSettings, isTrackingEnabled, CookieSettings } from '@/types/cookieSettings';

const ANALYTICS_KEY = 'cms_analytics';
const CONSENT_KEY = 'cookie_consent';

export interface AnalyticsEvent {
  id: string;
  type: TrackingType;
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
  contactClicks: number;
  productInquiries: number;
  searches: Record<string, number>;
  downloads: Record<string, number>;
  outboundLinks: Record<string, number>;
  formInteractions: Record<string, number>;
  videoPlays: Record<string, number>;
  avgScrollDepth: number;
  avgTimeOnPage: number;
  sessions: number;
  chatMessages: Record<string, number>;
  chatSessions: number;
}

interface AnalyticsContextType {
  events: AnalyticsEvent[];
  summary: AnalyticsSummary;
  consentGiven: boolean | null;
  setConsent: (consent: boolean) => void;
  trackEvent: (type: TrackingType, page: string, data?: Record<string, string | number>) => void;
  clearAnalytics: () => void;
  importAnalytics: (newEvents: AnalyticsEvent[], mode: 'replace' | 'merge') => void;
  isTrackingTypeEnabled: (type: TrackingType) => boolean;
  cookieSettings: CookieSettings;
  updateCookieSettings: (settings: CookieSettings) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

function generateSessionId(): string {
  const existing = sessionStorage.getItem('session_id');
  if (existing) return existing;
  const newId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', newId);
  return newId;
}

function calculateSummary(events: AnalyticsEvent[], cookieSettings: CookieSettings): AnalyticsSummary {
  const summary: AnalyticsSummary = {
    totalPageViews: 0,
    pageViews: {},
    productClicks: {},
    categoryClicks: {},
    contactClicks: 0,
    productInquiries: 0,
    searches: {},
    downloads: {},
    outboundLinks: {},
    formInteractions: {},
    videoPlays: {},
    avgScrollDepth: 0,
    avgTimeOnPage: 0,
    sessions: 0,
    chatMessages: {},
    chatSessions: 0
  };

  const scrollDepths: number[] = [];
  const timesOnPage: number[] = [];
  const sessionIds = new Set<string>();

  events.forEach(event => {
    // Only process events that are currently enabled in settings
    if (!isTrackingEnabled(cookieSettings, event.type)) return;

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
      case 'contact_click':
        summary.contactClicks++;
        break;
      case 'product_inquiry':
        summary.productInquiries++;
        break;
      case 'search':
        const searchTerm = event.data?.term as string || 'unknown';
        summary.searches[searchTerm] = (summary.searches[searchTerm] || 0) + 1;
        break;
      case 'download':
        const fileName = event.data?.fileName as string || 'unknown';
        summary.downloads[fileName] = (summary.downloads[fileName] || 0) + 1;
        break;
      case 'outbound_link':
        const linkUrl = event.data?.url as string || 'unknown';
        summary.outboundLinks[linkUrl] = (summary.outboundLinks[linkUrl] || 0) + 1;
        break;
      case 'form_interaction':
        const formName = event.data?.formName as string || 'unknown';
        summary.formInteractions[formName] = (summary.formInteractions[formName] || 0) + 1;
        break;
      case 'video_play':
        const videoTitle = event.data?.videoTitle as string || 'unknown';
        summary.videoPlays[videoTitle] = (summary.videoPlays[videoTitle] || 0) + 1;
        break;
      case 'scroll_depth':
        if (event.data?.depth) scrollDepths.push(event.data.depth as number);
        break;
      case 'time_on_page':
        if (event.data?.seconds) timesOnPage.push(event.data.seconds as number);
        break;
      case 'chat_message':
        const chatQuery = event.data?.message as string || 'unknown';
        summary.chatMessages[chatQuery] = (summary.chatMessages[chatQuery] || 0) + 1;
        break;
      case 'chat_session':
        summary.chatSessions++;
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
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>(defaultCookieSettings);
  const [summary, setSummary] = useState<AnalyticsSummary>(calculateSummary([], defaultCookieSettings));

  useEffect(() => {
    // Use sessionStorage for consent - resets on each new browser session
    const consent = sessionStorage.getItem(CONSENT_KEY);
    if (consent !== null) {
      setConsentGiven(consent === 'true');
    }
    
    const storedEvents = getStorageItem<AnalyticsEvent[]>(ANALYTICS_KEY, []);
    setEvents(storedEvents);
    setSummary(calculateSummary(storedEvents, cookieSettings));
  }, []);

  // Recalculate summary when cookie settings change
  useEffect(() => {
    setSummary(calculateSummary(events, cookieSettings));
  }, [cookieSettings, events]);

  const setConsent = useCallback((consent: boolean) => {
    // Use sessionStorage - consent only valid for current session
    sessionStorage.setItem(CONSENT_KEY, String(consent));
    setConsentGiven(consent);
    
    // Track consent event if accepted
    if (consent) {
      const consentEvent: AnalyticsEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'page_view',
        page: window.location.pathname,
        data: { action: 'consent_given' },
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId()
      };
      setEvents(prev => {
        const updated = [...prev, consentEvent].slice(-1000);
        setStorageItem(ANALYTICS_KEY, updated);
        setSummary(calculateSummary(updated, cookieSettings));
        return updated;
      });
    }
  }, [cookieSettings]);

  const updateCookieSettings = useCallback((settings: CookieSettings) => {
    setCookieSettings(settings);
  }, []);

  const isTrackingTypeEnabled = useCallback((type: TrackingType): boolean => {
    if (!consentGiven) return false;
    return isTrackingEnabled(cookieSettings, type);
  }, [consentGiven, cookieSettings]);

  const trackEvent = useCallback((
    type: TrackingType, 
    page: string, 
    data?: Record<string, string | number>
  ) => {
    // Check consent and if this specific tracking type is enabled
    if (!consentGiven) return;
    if (!isTrackingEnabled(cookieSettings, type)) return;

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
      setSummary(calculateSummary(updated, cookieSettings));
      return updated;
    });
  }, [consentGiven, cookieSettings]);

  const clearAnalytics = useCallback(() => {
    setEvents([]);
    setStorageItem(ANALYTICS_KEY, []);
    setSummary(calculateSummary([], cookieSettings));
  }, [cookieSettings]);

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
    setSummary(calculateSummary(updated, cookieSettings));
  }, [events, cookieSettings]);

  return (
    <AnalyticsContext.Provider value={{
      events,
      summary,
      consentGiven,
      setConsent,
      trackEvent,
      clearAnalytics,
      importAnalytics,
      isTrackingTypeEnabled,
      cookieSettings,
      updateCookieSettings
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
