export interface CookieSettings {
  enabled: boolean;
  title: string;
  description: string;
  acceptAllText: string;
  rejectText: string;
  moreInfoText: string;
  privacyLinkText: string;
  collectedDataItems: string[];
  showDetailedInfo: boolean;
  position: 'bottom' | 'top' | 'center';
  style: 'minimal' | 'detailed' | 'floating';
}

export const defaultCookieSettings: CookieSettings = {
  enabled: true,
  title: 'Cookie-Einstellungen',
  description: 'Wir verwenden Cookies und ähnliche Technologien, um Ihre Nutzungserfahrung zu analysieren und unsere Website zu verbessern. Die Daten werden lokal in Ihrem Browser gespeichert und nicht an Dritte weitergegeben.',
  acceptAllText: 'Alle akzeptieren',
  rejectText: 'Nur notwendige',
  moreInfoText: 'Mehr erfahren',
  privacyLinkText: 'Datenschutzerklärung',
  collectedDataItems: [
    'Seitenaufrufe und Navigation',
    'Klicks auf Produkte und Kategorien',
    'Verweildauer auf Seiten',
    'Scroll-Tiefe'
  ],
  showDetailedInfo: true,
  position: 'bottom',
  style: 'detailed'
};
