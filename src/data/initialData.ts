// Initial demo data for the CMS

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export interface Showcase {
  title: string;
  description: string;
  price: string;
}

export interface Product {
  id: number;
  categoryId: string;
  name: string;
  type: string;
  shortDescription: string;
  description: string;
  priceText: string;
  showcases: Showcase[];
  targetAudience: string[];
  status: 'draft' | 'published';
  featured?: boolean;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title?: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  image: string;
  tags: string[];
  relatedProduct: string;
  status: 'draft' | 'published';
  gallery?: GalleryItem[];
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  image: string;
  status: 'draft' | 'published';
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface CoreValue {
  title: string;
  description: string;
  icon: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface Testimonial {
  name: string;
  position: string;
  company: string;
  image: string;
  quote: string;
  rating?: number;
}

export interface Partner {
  name: string;
  logo: string;
  link?: string;
  quote?: string;
}

export interface Executive {
  name: string;
  position: string;
}

import { Promotion, DEFAULT_PROMOTIONS } from '@/types/promotion';
import { CookieSettings, defaultCookieSettings } from '@/types/cookieSettings';

// Chatbot Configuration
export interface ChatbotSettings {
  enabled: boolean;
  welcomeMessage: string;
  placeholderText: string;
  suggestedQuestions: string[];
  ollamaUrl: string;
  ollamaModel: string;
  maxTokens: number;
  temperature: number;
  systemPromptAddition: string;
  // System prompt from uploaded markdown file
  systemPromptMarkdown?: string;
  systemPromptFileName?: string;
}

export const defaultChatbotSettings: ChatbotSettings = {
  enabled: true,
  welcomeMessage: 'Willkommen! Ich bin der KernelFlow Assistent. Wie kann ich Ihnen helfen?',
  placeholderText: 'Schreiben Sie eine Nachricht...',
  suggestedQuestions: ['Was bietet KernelFlow?', 'Preise & Pakete', 'Kontakt'],
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2:latest',
  maxTokens: 1024,
  temperature: 0.7,
  systemPromptAddition: '',
  systemPromptMarkdown: '',
  systemPromptFileName: '',
};

export interface SiteSettings {
  companyName: string;
  ownerName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  whyWorkWithMe: string[];
  aboutText: string;
  aboutImage: string;
  aboutTagline: string;
  aboutMission: string;
  milestones: Milestone[];
  coreValues: CoreValue[];
  stats: StatItem[];
  testimonials: Testimonial[];
  partners: Partner[];
  skills: string[];
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialTiktok?: string;
  socialFacebook?: string;
  footerText: string;
  impressumText: string;
  datenschutzText: string;
  // Impressum details
  companyHeadquarters?: string;
  tradeRegistry?: string;
  uidNumber?: string;
  executives?: Executive[];
  // Notion Integration
  notionEnabled?: boolean;
  notionDatabaseId?: string;
  notionApiKey?: string;
  // Server/API configuration for self-hosting
  apiBaseUrl?: string;
  // Promotions & Discount Codes
  promotions?: Promotion[];
  // Cookie Consent Settings
  cookieSettings?: CookieSettings;
  // Chatbot Settings
  chatbotSettings?: ChatbotSettings;
}

export { DEFAULT_PROMOTIONS, defaultCookieSettings };

export const initialCategories: Category[] = [
  { id: "video", name: "Video & Social Media Editing", description: "Professionelle Videoproduktion für Social Media und Events.", icon: "Video", order: 1 },
  { id: "ai", name: "AI-Systeme & Automation", description: "Intelligente Automatisierungen und KI-gestützte Workflows.", icon: "Cpu", order: 2 },
  { id: "support", name: "IT-Support & Beratung", description: "Technische Unterstützung und strategische Beratung.", icon: "Wrench", order: 3 },
  { id: "tools", name: "Programmierung & Tools", description: "Massgeschneiderte Software und Micro-SaaS Lösungen.", icon: "Code", order: 4 },
  { id: "design", name: "Bild & Design", description: "Visuelles Design für Social Media und Marketing.", icon: "Image", order: 5 },
  { id: "text", name: "Texterstellung & Konzeption", description: "Professionelle Texte und Content-Strategien.", icon: "FileText", order: 6 },
  { id: "management", name: "Management & Account-Betreuung", description: "Vollständige Betreuung Ihrer digitalen Präsenz.", icon: "Users", order: 7 },
];

export const initialProducts: Product[] = [
  {
    id: 1,
    categoryId: "video",
    name: "Kurzvideo Social Media (30–60s)",
    type: "Service",
    shortDescription: "Kurzes, dynamisches Social-Media-Video mit Fokus auf Hook & Message.",
    description: "Professionell produzierte Kurzvideos, optimiert für maximales Engagement auf Instagram, TikTok und LinkedIn. Inklusive Storytelling-Beratung, professionellem Schnitt und plattformgerechter Optimierung.",
    priceText: "CHF 120–350",
    showcases: [
      { title: "Basic", description: "1 Video, Light Color-Grading, Simple Cuts", price: "CHF 120–180" },
      { title: "Standard", description: "1–2 Videos (bis 90s), Sounddesign, Color-Grading, Social Media Optimierung", price: "CHF 260–350" }
    ],
    targetAudience: ["Einzelunternehmer", "KMU", "Creators"],
    status: "published",
    featured: true  // Featured: Video category
  },
  {
    id: 2,
    categoryId: "video",
    name: "Event-Highlight-Video / Full Day Coverage",
    type: "Paket",
    shortDescription: "Ganztagesbegleitung eines Events mit Highlight-Video und Social-Clips.",
    description: "Umfassende Video-Dokumentation Ihres Events. Von der Ankunft bis zum Abschluss – professionell eingefangen und zu einem packenden Highlight-Video sowie mehreren Social-Media-Clips verarbeitet.",
    priceText: "CHF 700–1400",
    showcases: [{ title: "Event Paket", description: "Full Coverage + 1 Highlight-Video + 10–30 Social Clips", price: "CHF 700–1400" }],
    targetAudience: ["Unternehmen", "Agenturen", "Veranstalter"],
    status: "published"
  },
  {
    id: 3,
    categoryId: "ai",
    name: "Starter Automation Setup",
    type: "Paket",
    shortDescription: "Einsteiger-Setup aus Notion-Dashboard, einfachem AI-Workflow und Templates.",
    description: "Der perfekte Einstieg in die Welt der Automatisierung. Beinhaltet ein massgeschneidertes Notion-Dashboard, einen einfachen aber wirkungsvollen AI-Workflow, Python-Automation-Basics und ein anpassbares Template für Ihren Use Case.",
    priceText: "CHF 300–600",
    showcases: [{ title: "Starter", description: "Notion-Dashboard + 1 AI-Workflow + Python-Automation + 1 Template", price: "CHF 300–600" }],
    targetAudience: ["Einzelunternehmer", "Freelancer"],
    status: "published"
  },
  {
    id: 4,
    categoryId: "ai",
    name: "Pro AI Workspace",
    type: "Service",
    shortDescription: "Vollautomatisierter Workspace mit Python, Notion, API-Integrationen und AI-Agenten.",
    description: "Die Premium-Lösung für maximale Effizienz. Vollständig automatisierter Workspace mit nahtloser Integration von Python, Notion und externen APIs. Inklusive konfigurierbarer AI-Agenten, umfassender Trainingsphase und detaillierter Dokumentation.",
    priceText: "CHF 1200–3000",
    showcases: [{ title: "Pro Workspace", description: "Python + Notion + API-Integrationen, AI-Agenten, Training & Dokumentation", price: "CHF 1200–3000" }],
    targetAudience: ["KMU", "Agenturen", "Startups"],
    status: "published",
    featured: true  // Featured: AI category
  },
  {
    id: 5,
    categoryId: "ai",
    name: "Monthly AI Maintenance",
    type: "Retainer",
    shortDescription: "Monatliche Wartung, Monitoring & Feintuning von Automationen.",
    description: "Sorgenfreier Betrieb Ihrer Automatisierungen. Regelmässige Überprüfung, proaktives Monitoring und kontinuierliche Optimierung Ihrer AI-Systeme. Inklusive monatlichem Report und Priority-Support.",
    priceText: "CHF 60–150/Monat",
    showcases: [{ title: "Maintenance", description: "Monitoring, Wartung, Feintuning, monatlicher Report", price: "CHF 60–150/Monat" }],
    targetAudience: ["Bestehende Kunden", "KMU"],
    status: "published"
  },
  {
    id: 6,
    categoryId: "support",
    name: "Tech-Beratung & Systemcheck (Remote)",
    type: "Beratung",
    shortDescription: "Analyse Ihrer bestehenden Systeme und konkrete Optimierungsvorschläge.",
    description: "Umfassende Analyse Ihrer technischen Infrastruktur und Workflows. Identifikation von Optimierungspotenzialen und konkrete, umsetzbare Handlungsempfehlungen.",
    priceText: "CHF 80–150/h",
    showcases: [{ title: "Beratung", description: "1–2h Analyse + Dokumentation mit Empfehlungen", price: "CHF 80–150/h" }],
    targetAudience: ["Einzelunternehmer", "KMU"],
    status: "published",
    featured: true  // Featured: Support category
  },
  {
    id: 7,
    categoryId: "support",
    name: "Account- & Tool-Setup für Creator / Einzelfirmen",
    type: "Service",
    shortDescription: "Professionelles Setup aller wichtigen Tools und Accounts.",
    description: "Komplettes Setup Ihrer digitalen Infrastruktur: Social Media Accounts, Produktivitäts-Tools, Cloud-Storage, Kommunikationstools – alles professionell eingerichtet und optimiert.",
    priceText: "CHF 150–400",
    showcases: [{ title: "Setup Paket", description: "Komplettes Tool-Setup inkl. Einführung", price: "CHF 150–400" }],
    targetAudience: ["Creators", "Einzelunternehmer"],
    status: "published"
  },
  {
    id: 8,
    categoryId: "tools",
    name: "Micro-SaaS / Mini-Tools Entwicklung",
    type: "Service",
    shortDescription: "Entwicklung kleiner, fokussierter Tools und Anwendungen.",
    description: "Massgeschneiderte Entwicklung von kleinen aber mächtigen Tools für Ihren spezifischen Use Case. Von der Idee bis zum funktionierenden Prototyp.",
    priceText: "Ab CHF 500",
    showcases: [{ title: "Prototyp", description: "Konzeption + MVP-Entwicklung + 1 Iterationsrunde", price: "Ab CHF 500" }],
    targetAudience: ["Startups", "Unternehmen"],
    status: "published",
    featured: true  // Featured: Tools category
  },
  {
    id: 9,
    categoryId: "design",
    name: "Thumbnail / Social Post Design",
    type: "Service",
    shortDescription: "Eye-catching Designs für maximale Aufmerksamkeit.",
    description: "Professionelles Design für YouTube-Thumbnails, Instagram-Posts, LinkedIn-Grafiken und mehr. Optimiert für maximale Klickrate und Engagement.",
    priceText: "CHF 30–80/Stück",
    showcases: [
      { title: "Single Design", description: "1 Thumbnail oder Social Post", price: "CHF 30–50" },
      { title: "Paket (5er)", description: "5 Designs im einheitlichen Stil", price: "CHF 120–200" }
    ],
    targetAudience: ["Creators", "KMU", "Influencer"],
    status: "published",
    featured: true  // Featured: Design category
  }
];

export const initialProjects: Project[] = [
  {
    id: 1,
    title: "Social Media Kampagne – TechStartup X",
    category: "Video",
    description: "Komplette Social Media Video-Kampagne für einen Schweizer Tech-Startup. 15 Kurzvideos für Instagram und TikTok, optimiert für maximales Engagement.",
    fullDescription: "Für TechStartup X haben wir eine umfassende Social Media Kampagne entwickelt und produziert. Das Projekt umfasste 15 kurze, dynamische Videos, die speziell für Instagram Reels und TikTok optimiert wurden. Jedes Video wurde mit professionellem Color-Grading, Sounddesign und plattformspezifischen Anpassungen versehen. Die Kampagne erzielte eine durchschnittliche Engagement-Rate von 8.5%.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    tags: ["Social Media", "Video Production", "Campaign"],
    relatedProduct: "Kurzvideo Social Media (30–60s)",
    status: "published"
  },
  {
    id: 2,
    title: "AI Automation Workspace – Kreativagentur",
    category: "AI-System",
    description: "Vollautomatisierter Workspace mit Notion, Python und API-Integrationen für eine 10-köpfige Kreativagentur.",
    fullDescription: "Für eine wachsende Kreativagentur haben wir einen vollständig automatisierten Workspace implementiert. Das System umfasst ein zentrales Notion-Dashboard, Python-basierte Automatisierungen für wiederkehrende Aufgaben, und nahtlose API-Integrationen mit Tools wie Slack, Google Workspace und dem Projektmanagement-System der Agentur. Die Zeitersparnis beträgt geschätzt 15 Stunden pro Woche.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    tags: ["Automation", "AI", "Notion", "Python"],
    relatedProduct: "Pro AI Workspace",
    status: "published"
  },
  {
    id: 3,
    title: "Event Coverage – Firmen-Jubiläum",
    category: "Video",
    description: "Ganztägige Video-Dokumentation eines Firmenjubiläums mit Highlight-Video und 25 Social Clips.",
    fullDescription: "Zum 25-jährigen Jubiläum eines Schweizer Familienunternehmens haben wir die gesamte Veranstaltung dokumentiert. Das Ergebnis: Ein emotionales 3-minütiges Highlight-Video sowie 25 kurze Social Media Clips für die interne und externe Kommunikation. Die Videos wurden sowohl für die Website als auch für LinkedIn und Instagram optimiert.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    tags: ["Event", "Video Production", "Corporate"],
    relatedProduct: "Event-Highlight-Video / Full Day Coverage",
    status: "published"
  }
];

export const initialPosts: Post[] = [
  {
    id: 1,
    slug: "12-monats-business-roadmap",
    title: "Meine 12-Monats Business-Roadmap",
    excerpt: "Ein detaillierter Einblick in meine strategische Planung für das kommende Jahr – von Cashflow-Stabilisierung bis zur Entwicklung eigener Produkte.",
    content: `# Meine 12-Monats Business-Roadmap

Ein detaillierter Einblick in meine strategische Planung für das kommende Jahr.

## Phase 1: Fundament (Monat 1-3)
- Cashflow stabilisieren durch Service-Arbeit
- Erste Automatisierungen implementieren
- Kundenbasis erweitern

## Phase 2: Skalierung (Monat 4-6)
- Produktisierte Services einführen
- Passive Einkommensströme aufbauen
- Team-Kapazitäten prüfen

## Phase 3: Expansion (Monat 7-9)
- Erste eigene Tools launchen
- Content-Marketing intensivieren
- Partnerschaften aufbauen

## Phase 4: Optimierung (Monat 10-12)
- Systeme verfeinern
- Jahresreview durchführen
- Planung für das Folgejahr`,
    date: "2024-01-15",
    tags: ["Strategie", "Business", "Planung"],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    status: "published"
  },
  {
    id: 2,
    slug: "multilayer-system",
    title: "Das Multilayer-System meines Business",
    excerpt: "Wie ich mein Solo-Business in drei Ebenen strukturiere: Cashflow, Skalierung und Exploration – für nachhaltige Stabilität und Wachstum.",
    content: `# Das Multilayer-System meines Business

Wie ich mein Solo-Business strukturiere für nachhaltiges Wachstum.

## Layer 1: Cashflow (Fundament)
Das Fundament bilden Services mit direktem Kundenkontakt:
- Video-Produktion
- AI-Setups
- Beratung

Diese Leistungen generieren sofortigen Umsatz und ermöglichen alles Weitere.

## Layer 2: Skalierung (Wachstum)
Auf dem stabilen Fundament baue ich skalierbare Angebote:
- Produktisierte Pakete
- Templates & Vorlagen
- Retainer-Modelle

## Layer 3: Exploration (Zukunft)
Hier experimentiere ich mit neuen Ideen:
- Eigene Micro-SaaS Tools
- Digitale Produkte
- Neue Märkte

Dieses System erlaubt mir, stabil zu bleiben während ich wachse.`,
    date: "2024-01-08",
    tags: ["Business", "Strategie", "Skalierung"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    status: "published"
  }
];

export const initialSettings: SiteSettings = {
  companyName: "Mein Firmenname",
  ownerName: "Max Mustermann",
  heroTitle: "Effizienz durch Technologie & Kreativität",
  heroSubtitle: "Ich helfe Firmen, Creators und Einzelunternehmern, ihre Arbeit mit KI und Automatisierung schneller, sauberer und kreativer zu machen. Zusätzlich produziere ich hochwertigen Social Media Content für Events und Marken. Und für die Zukunft entwickle ich Tools und Apps, die produktiver machen.",
  heroCta: "Projekt anfragen",
  whyWorkWithMe: [
    "Schnelle, zuverlässige Umsetzung",
    "Technisch & kreativ stark",
    "Modular, zukunftssicher",
    "Fokus auf echte Effizienz"
  ],
  aboutText: "Als Einzelunternehmer verbinde ich technisches Know-how mit kreativem Denken. Meine Mission: Komplexe Prozesse vereinfachen und beeindruckende Ergebnisse liefern – ob durch automatisierte Workflows, professionellen Video-Content oder massgeschneiderte Tools.",
  aboutImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  aboutTagline: "Technologie trifft Kreativität",
  aboutMission: "Meine Mission ist es, Unternehmen und Creators dabei zu helfen, das volle Potenzial moderner Technologien auszuschöpfen – ohne die Komplexität. Ich glaube daran, dass gute Lösungen einfach sein sollten.",
  milestones: [
    { year: "2024", title: "Gründung", description: "Start als Einzelunternehmer mit Fokus auf AI & Automation" },
    { year: "2023", title: "Erste Projekte", description: "Erfolgreiche Video- und Automatisierungsprojekte für KMU" },
    { year: "2022", title: "Spezialisierung", description: "Vertiefung in KI-Technologien und Workflow-Automation" }
  ],
  coreValues: [
    { title: "Qualität", description: "Jedes Projekt verdient höchste Sorgfalt und Präzision", icon: "Star" },
    { title: "Innovation", description: "Immer auf der Suche nach besseren Lösungen", icon: "Lightbulb" },
    { title: "Transparenz", description: "Offene Kommunikation und faire Preise", icon: "Eye" },
    { title: "Effizienz", description: "Zeit ist wertvoll – für mich und meine Kunden", icon: "Zap" }
  ],
  stats: [
    { value: "50+", label: "Projekte" },
    { value: "30+", label: "Zufriedene Kunden" },
    { value: "3+", label: "Jahre Erfahrung" },
    { value: "100%", label: "Leidenschaft" }
  ],
  testimonials: [
    {
      name: "Sarah Weber",
      position: "Marketing Leiterin",
      company: "TechCorp AG",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      quote: "Die Zusammenarbeit war hervorragend. Das Projekt wurde schnell und professionell umgesetzt. Die Qualität hat unsere Erwartungen übertroffen.",
      rating: 5
    },
    {
      name: "Michael Schneider",
      position: "CEO",
      company: "StartupHub",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      quote: "Endlich jemand, der Technologie und Kreativität perfekt verbindet. Die Automatisierungen haben uns enorm viel Zeit gespart.",
      rating: 5
    },
    {
      name: "Anna Müller",
      position: "Content Creator",
      company: "Digital Dreams",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      quote: "Die Video-Produktion war top! Schnelle Umsetzung, kreative Ideen und ein super Endresultat. Absolut empfehlenswert!",
      rating: 5
    }
  ],
  partners: [
    {
      name: "TechCorp",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80",
      link: "https://example.com",
      quote: "Innovationspartner seit 2023"
    },
    {
      name: "StartupHub",
      logo: "https://images.unsplash.com/photo-1516876437184-593fda40c7ce?w=200&q=80",
      link: "https://example.com",
      quote: "Gemeinsam für digitale Lösungen"
    },
    {
      name: "DigitalFirst",
      logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&q=80",
      link: "https://example.com",
      quote: "Vertrauen durch Zusammenarbeit"
    },
    {
      name: "CreativeStudio",
      logo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&q=80",
      link: "https://example.com",
      quote: "Kreativität ohne Grenzen"
    }
  ],
  skills: ["Video & Content Production", "AI & Automation", "Programmierung", "IT-Support & Beratung", "Projekt-Management"],
  contactEmail: "kontakt@meinefirma.ch",
  contactPhone: "+41 79 123 45 67",
  contactLocation: "Zürich, Schweiz",
  socialInstagram: "",
  socialLinkedin: "",
  socialTwitter: "",
  socialYoutube: "",
  socialTiktok: "",
  socialFacebook: "",
  footerText: "© 2024 Mein Firmenname. Alle Rechte vorbehalten.",
  companyHeadquarters: "",
  tradeRegistry: "",
  uidNumber: "",
  executives: [],
  impressumText: `## Haftungsausschluss

Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.

Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen.

## Urheberrechte

Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website gehören ausschliesslich dem Betreiber oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.`,
  datenschutzText: `## Allgemeine Hinweise

Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.

## Datenerfassung auf dieser Website

### Kontaktformular
Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.

### Server-Log-Dateien
Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
- Browsertyp und Browserversion
- Verwendetes Betriebssystem
- Referrer URL
- Hostname des zugreifenden Rechners
- Uhrzeit der Serveranfrage
- IP-Adresse

Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.

## Cookies und lokale Speicherung

### Cookie-Consent
Beim ersten Besuch unserer Website werden Sie gefragt, ob Sie der Verwendung von Analyse-Funktionen zustimmen. Ihre Entscheidung wird lokal in Ihrem Browser gespeichert.

### Lokale Analyse (bei Zustimmung)
Wenn Sie allen Cookies zustimmen, werden folgende Daten **ausschliesslich lokal in Ihrem Browser (localStorage)** gespeichert und **nicht an externe Server übertragen**:

- **Seitenaufrufe**: Welche Seiten Sie besuchen
- **Produkt-/Kategorie-Klicks**: Interesse an unseren Leistungen
- **Scroll-Verhalten und Verweildauer**: Zur Optimierung der Benutzerfreundlichkeit
- **Kontakt-Interaktionen**: Klicks auf Kontakt-Elemente
- **Formular-Interaktionen**: Nutzung von Formularen
- **Suchbegriffe**: Falls eine Suchfunktion genutzt wird

### Chatbot-Interaktionen (bei Zustimmung)
Unser KI-gestützter Chatbot hilft Ihnen bei Fragen zu unseren Leistungen. Bei Zustimmung zu erweiterten Cookies werden zusätzlich erfasst:

- **Chat-Nachrichten**: Die ersten 100 Zeichen Ihrer Fragen (anonymisiert, zur Verbesserung des Service)
- **Chat-Sitzungen**: Anzahl und Zeitpunkt der Chatbot-Nutzungen

**Wichtiger Hinweis**: Der Chatbot verarbeitet Ihre Anfragen lokal auf unserem Server. Es werden keine Daten an externe KI-Dienste wie OpenAI oder Google übermittelt. Die Verarbeitung erfolgt durch ein lokal gehostetes Sprachmodell.

### Keine Cookies bei Ablehnung
Wenn Sie nur notwendige Cookies akzeptieren, werden keinerlei Analyse- oder Chatbot-Daten gespeichert.

## Ihre Rechte

Sie haben jederzeit das Recht:
- **Auskunft** über Ihre gespeicherten Daten zu erhalten
- Die **Löschung** Ihrer Daten zu verlangen (lokale Daten können Sie selbst durch Löschen des Browser-Speichers entfernen)
- Ihre **Einwilligung zu widerrufen** (durch Löschen der Cookies in Ihrem Browser)
- **Beschwerde** bei einer Aufsichtsbehörde einzureichen

Für Anfragen zum Datenschutz kontaktieren Sie uns bitte über die im Impressum angegebenen Kontaktdaten.

## Datenübertragung

Alle auf dieser Website erfassten Analyse-Daten werden **ausschliesslich lokal in Ihrem Browser** gespeichert. Es erfolgt keine Übertragung an Dritte oder externe Analyse-Dienste.

## Änderungen

Wir können diese Datenschutzerklärung jederzeit ohne Vorankündigung anpassen. Es gilt die jeweils aktuelle, auf unserer Website publizierte Fassung.`,
  apiBaseUrl: "",
  promotions: DEFAULT_PROMOTIONS
};
