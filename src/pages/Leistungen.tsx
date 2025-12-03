import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  Cpu, 
  Wrench, 
  Code, 
  Image, 
  FileText,
  Users,
  ChevronRight,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

// Demo-Daten für Kategorien
const categories = [
  {
    id: "video",
    name: "Video & Social Media Editing",
    description: "Professionelle Videoproduktion für Social Media und Events.",
    icon: Video,
  },
  {
    id: "ai",
    name: "AI-Systeme & Automation",
    description: "Intelligente Automatisierungen und KI-gestützte Workflows.",
    icon: Cpu,
  },
  {
    id: "support",
    name: "IT-Support & Beratung",
    description: "Technische Unterstützung und strategische Beratung.",
    icon: Wrench,
  },
  {
    id: "tools",
    name: "Programmierung & Tools",
    description: "Massgeschneiderte Software und Micro-SaaS Lösungen.",
    icon: Code,
  },
  {
    id: "design",
    name: "Bild & Design",
    description: "Visuelles Design für Social Media und Marketing.",
    icon: Image,
  },
  {
    id: "text",
    name: "Texterstellung & Konzeption",
    description: "Professionelle Texte und Content-Strategien.",
    icon: FileText,
  },
  {
    id: "management",
    name: "Management & Account-Betreuung",
    description: "Vollständige Betreuung Ihrer digitalen Präsenz.",
    icon: Users,
  },
];

// Demo-Daten für Produkte
const products = [
  {
    id: 1,
    categoryId: "video",
    name: "Kurzvideo Social Media (30–60s)",
    type: "Service",
    shortDescription: "Kurzes, dynamisches Social-Media-Video mit Fokus auf Hook & Message.",
    description: "Professionell produzierte Kurzvideos, optimiert für maximales Engagement auf Instagram, TikTok und LinkedIn. Inklusive Storytelling-Beratung, professionellem Schnitt und plattformgerechter Optimierung.",
    priceText: "CHF 120–350",
    showcases: [
      {
        title: "Basic",
        description: "1 Video, Light Color-Grading, Simple Cuts",
        price: "CHF 120–180"
      },
      {
        title: "Standard",
        description: "1–2 Videos (bis 90s), Sounddesign, Color-Grading, Social Media Optimierung",
        price: "CHF 260–350"
      }
    ],
    targetAudience: ["Einzelunternehmer", "KMU", "Creators"]
  },
  {
    id: 2,
    categoryId: "video",
    name: "Event-Highlight-Video / Full Day Coverage",
    type: "Paket",
    shortDescription: "Ganztagesbegleitung eines Events mit Highlight-Video und Social-Clips.",
    description: "Umfassende Video-Dokumentation Ihres Events. Von der Ankunft bis zum Abschluss – professionell eingefangen und zu einem packenden Highlight-Video sowie mehreren Social-Media-Clips verarbeitet.",
    priceText: "CHF 700–1400",
    showcases: [
      {
        title: "Event Paket",
        description: "Full Coverage + 1 Highlight-Video + 10–30 Social Clips",
        price: "CHF 700–1400"
      }
    ],
    targetAudience: ["Unternehmen", "Agenturen", "Veranstalter"]
  },
  {
    id: 3,
    categoryId: "ai",
    name: "Starter Automation Setup",
    type: "Paket",
    shortDescription: "Einsteiger-Setup aus Notion-Dashboard, einfachem AI-Workflow und Templates.",
    description: "Der perfekte Einstieg in die Welt der Automatisierung. Beinhaltet ein massgeschneidertes Notion-Dashboard, einen einfachen aber wirkungsvollen AI-Workflow, Python-Automation-Basics und ein anpassbares Template für Ihren Use Case.",
    priceText: "CHF 300–600",
    showcases: [
      {
        title: "Starter",
        description: "Notion-Dashboard + 1 AI-Workflow + Python-Automation + 1 Template",
        price: "CHF 300–600"
      }
    ],
    targetAudience: ["Einzelunternehmer", "Freelancer"]
  },
  {
    id: 4,
    categoryId: "ai",
    name: "Pro AI Workspace",
    type: "Service",
    shortDescription: "Vollautomatisierter Workspace mit Python, Notion, API-Integrationen und AI-Agenten.",
    description: "Die Premium-Lösung für maximale Effizienz. Vollständig automatisierter Workspace mit nahtloser Integration von Python, Notion und externen APIs. Inklusive konfigurierbarer AI-Agenten, umfassender Trainingsphase und detaillierter Dokumentation.",
    priceText: "CHF 1200–3000",
    showcases: [
      {
        title: "Pro Workspace",
        description: "Python + Notion + API-Integrationen, AI-Agenten, Training & Dokumentation",
        price: "CHF 1200–3000"
      }
    ],
    targetAudience: ["KMU", "Agenturen", "Startups"]
  },
  {
    id: 5,
    categoryId: "ai",
    name: "Monthly AI Maintenance",
    type: "Retainer",
    shortDescription: "Monatliche Wartung, Monitoring & Feintuning von Automationen.",
    description: "Sorgenfreier Betrieb Ihrer Automatisierungen. Regelmässige Überprüfung, proaktives Monitoring und kontinuierliche Optimierung Ihrer AI-Systeme. Inklusive monatlichem Report und Priority-Support.",
    priceText: "CHF 60–150/Monat",
    showcases: [
      {
        title: "Maintenance",
        description: "Monitoring, Wartung, Feintuning, monatlicher Report",
        price: "CHF 60–150/Monat"
      }
    ],
    targetAudience: ["Bestehende Kunden", "KMU"]
  },
  {
    id: 6,
    categoryId: "support",
    name: "Tech-Beratung & Systemcheck (Remote)",
    type: "Beratung",
    shortDescription: "Analyse Ihrer bestehenden Systeme und konkrete Optimierungsvorschläge.",
    description: "Umfassende Analyse Ihrer technischen Infrastruktur und Workflows. Identifikation von Optimierungspotenzialen und konkrete, umsetzbare Handlungsempfehlungen.",
    priceText: "CHF 80–150/h",
    showcases: [
      {
        title: "Beratung",
        description: "1–2h Analyse + Dokumentation mit Empfehlungen",
        price: "CHF 80–150/h"
      }
    ],
    targetAudience: ["Einzelunternehmer", "KMU"]
  },
  {
    id: 7,
    categoryId: "support",
    name: "Account- & Tool-Setup für Creator / Einzelfirmen",
    type: "Service",
    shortDescription: "Professionelles Setup aller wichtigen Tools und Accounts.",
    description: "Komplettes Setup Ihrer digitalen Infrastruktur: Social Media Accounts, Produktivitäts-Tools, Cloud-Storage, Kommunikationstools – alles professionell eingerichtet und optimiert.",
    priceText: "CHF 150–400",
    showcases: [
      {
        title: "Setup Paket",
        description: "Komplettes Tool-Setup inkl. Einführung",
        price: "CHF 150–400"
      }
    ],
    targetAudience: ["Creators", "Einzelunternehmer"]
  },
  {
    id: 8,
    categoryId: "tools",
    name: "Micro-SaaS / Mini-Tools Entwicklung",
    type: "Service",
    shortDescription: "Entwicklung kleiner, fokussierter Tools und Anwendungen.",
    description: "Massgeschneiderte Entwicklung von kleinen aber mächtigen Tools für Ihren spezifischen Use Case. Von der Idee bis zum funktionierenden Prototyp.",
    priceText: "Ab CHF 500",
    showcases: [
      {
        title: "Prototyp",
        description: "Konzeption + MVP-Entwicklung + 1 Iterationsrunde",
        price: "Ab CHF 500"
      }
    ],
    targetAudience: ["Startups", "Unternehmen"]
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
      {
        title: "Single Design",
        description: "1 Thumbnail oder Social Post",
        price: "CHF 30–50"
      },
      {
        title: "Paket (5er)",
        description: "5 Designs im einheitlichen Stil",
        price: "CHF 120–200"
      }
    ],
    targetAudience: ["Creators", "KMU", "Influencer"]
  }
];

interface ProductDetailProps {
  product: typeof products[0];
  onClose: () => void;
}

function ProductDetail({ product, onClose }: ProductDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-xl border border-border shadow-card animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Schliessen"
        >
          <X size={20} />
        </button>
        
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{product.type}</Badge>
            {product.targetAudience?.map((audience) => (
              <Badge key={audience} variant="outline">{audience}</Badge>
            ))}
          </div>
          
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            {product.name}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {product.description}
          </p>
          
          <div className="mb-6">
            <span className="text-2xl font-bold text-primary">{product.priceText}</span>
          </div>
          
          {product.showcases && product.showcases.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display font-semibold mb-4">Pakete & Varianten</h3>
              <div className="space-y-4">
                {product.showcases.map((showcase, index) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{showcase.title}</h4>
                      <span className="text-primary font-semibold">{showcase.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{showcase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <Link to="/kontakt">Anfragen</Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Schliessen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Leistungen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

  const selectedCategoryData = selectedCategory
    ? categories.find(c => c.id === selectedCategory)
    : null;

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Meine <span className="text-gradient">Leistungen</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Von der kreativen Content-Produktion bis zur technischen Automatisierung – 
              hier finden Sie alle Services, die ich anbiete.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Alle
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Header (wenn ausgewählt) */}
      {selectedCategoryData && (
        <section className="py-8 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <selectedCategoryData.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">{selectedCategoryData.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedCategoryData.description}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const category = categories.find(c => c.id === product.categoryId);
              return (
                <Card 
                  key={product.id}
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
                  onClick={() => setSelectedProduct(product)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{product.type}</Badge>
                      {category && (
                        <Badge variant="outline" className="text-xs">
                          {category.name}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-display text-lg group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">{product.priceText}</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </Layout>
  );
}
