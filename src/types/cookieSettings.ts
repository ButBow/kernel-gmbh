// Tracking types that can be enabled/disabled
export type TrackingType = 
  | 'page_view'
  | 'product_click'
  | 'category_click'
  | 'contact_click'
  | 'scroll_depth'
  | 'time_on_page'
  | 'product_inquiry'
  | 'search'
  | 'download'
  | 'outbound_link'
  | 'form_interaction'
  | 'video_play'
  | 'chat_message'
  | 'chat_session';

// Configuration for each tracking type
export interface TrackingConfig {
  id: TrackingType;
  label: string;
  description: string;
  enabled: boolean;
}

// All available tracking options with defaults
export const ALL_TRACKING_OPTIONS: TrackingConfig[] = [
  { 
    id: 'page_view', 
    label: 'Seitenaufrufe', 
    description: 'Erfasst welche Seiten besucht werden',
    enabled: true 
  },
  { 
    id: 'product_click', 
    label: 'Produkt-Klicks', 
    description: 'Erfasst Klicks auf Produkte/Leistungen',
    enabled: true 
  },
  { 
    id: 'category_click', 
    label: 'Kategorie-Klicks', 
    description: 'Erfasst Klicks auf Kategorien',
    enabled: true 
  },
  { 
    id: 'scroll_depth', 
    label: 'Scroll-Tiefe', 
    description: 'Erfasst wie weit Besucher scrollen',
    enabled: true 
  },
  { 
    id: 'time_on_page', 
    label: 'Verweildauer', 
    description: 'Erfasst wie lange Besucher auf Seiten bleiben',
    enabled: true 
  },
  { 
    id: 'product_inquiry', 
    label: 'Produkt-Anfragen', 
    description: 'Erfasst Anfragen zu Produkten',
    enabled: true 
  },
  { 
    id: 'contact_click', 
    label: 'Kontakt-Interaktionen', 
    description: 'Erfasst Klicks auf Kontakt-Elemente',
    enabled: true 
  },
  { 
    id: 'search', 
    label: 'Suchbegriffe', 
    description: 'Erfasst was Besucher suchen',
    enabled: false 
  },
  { 
    id: 'download', 
    label: 'Downloads', 
    description: 'Erfasst Datei-Downloads',
    enabled: false 
  },
  { 
    id: 'outbound_link', 
    label: 'Externe Links', 
    description: 'Erfasst Klicks auf externe Links',
    enabled: false 
  },
  { 
    id: 'form_interaction', 
    label: 'Formular-Interaktionen', 
    description: 'Erfasst Interaktionen mit Formularen',
    enabled: false 
  },
  { 
    id: 'video_play', 
    label: 'Video-Wiedergaben', 
    description: 'Erfasst gestartete Videos',
    enabled: false 
  },
  { 
    id: 'chat_message', 
    label: 'Chat-Nachrichten', 
    description: 'Erfasst Chatbot-Nachrichten und häufige Fragen',
    enabled: false 
  },
  { 
    id: 'chat_session', 
    label: 'Chat-Sitzungen', 
    description: 'Erfasst Chatbot-Nutzung und Verlauf',
    enabled: false 
  },
];

export interface CookieSettings {
  enabled: boolean;
  title: string;
  description: string;
  acceptAllText: string;
  rejectText: string;
  moreInfoText: string;
  privacyLinkText: string;
  // New: Structured tracking options instead of just strings
  trackingOptions: TrackingConfig[];
  showDetailedInfo: boolean;
  position: 'bottom' | 'top' | 'center';
  style: 'minimal' | 'detailed' | 'floating';
}

export const defaultCookieSettings: CookieSettings = {
  enabled: true,
  title: 'Cookie-Einstellungen',
  description: 'Wir verwenden Cookies und ähnliche Technologien, um Ihre Nutzungserfahrung zu analysieren und unsere Website zu verbessern. Bei Zustimmung zu allen Cookies werden auch Chatbot-Interaktionen und Verläufe erfasst. Alle Daten werden lokal in Ihrem Browser gespeichert und nicht an Dritte weitergegeben.',
  acceptAllText: 'Alle akzeptieren',
  rejectText: 'Nur notwendige',
  moreInfoText: 'Mehr erfahren',
  privacyLinkText: 'Datenschutzerklärung',
  trackingOptions: ALL_TRACKING_OPTIONS.filter(opt => opt.enabled),
  showDetailedInfo: true,
  position: 'bottom',
  style: 'detailed'
};

// Helper to get enabled tracking types
export function getEnabledTrackingTypes(settings: CookieSettings): TrackingType[] {
  return settings.trackingOptions
    .filter(opt => opt.enabled)
    .map(opt => opt.id);
}

// Helper to check if a tracking type is enabled
export function isTrackingEnabled(settings: CookieSettings, type: TrackingType): boolean {
  const option = settings.trackingOptions.find(opt => opt.id === type);
  return option?.enabled ?? false;
}
