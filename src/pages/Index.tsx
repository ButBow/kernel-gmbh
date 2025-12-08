import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/contexts/ContentContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { PartnersSection } from "@/components/PartnersSection";
import { getCategoryColors } from "@/lib/categoryColors";
import { 
  Video, 
  Cpu, 
  Wrench, 
  Code, 
  ArrowRight, 
  CheckCircle,
  Zap,
  Shield,
  Lightbulb,
  Image,
  FileText,
  Users,
  Star,
  ChevronRight
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Video, Cpu, Wrench, Code, Image, FileText, Users
};

const benefitIcons = [Zap, Lightbulb, Shield, CheckCircle];

export default function Index() {
  const { settings, categories, products } = useContent();
  const { trackEvent } = useAnalytics();

  // Get first 4 categories for service teasers
  const serviceCategories = categories.slice(0, 4);
  
  // Sorted categories for color mapping
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Get all featured products
  const featuredProducts = products.filter(p => p.status === 'published' && p.featured);

  const handleProductClick = (productName: string) => {
    trackEvent('product_click', '/', { productName });
  };

  return (
    <Layout pageTitle="Startseite" pageDescription={settings.heroSubtitle}>
      {/* Hero Section - Semantic HTML for SEO/AEO */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 bg-gradient-dark" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(38_92%_50%/0.15),transparent_60%)]" aria-hidden="true" />
        
        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <h1 id="hero-title" className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-gradient">{settings.heroTitle}</span>
            </h1>
            
            <p className="hero-description mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {settings.heroSubtitle}
            </p>
            
            <nav className="mt-10 flex flex-col sm:flex-row gap-4 justify-center" aria-label="Primäre Aktionen">
              <Button size="lg" asChild>
                <Link to="/kontakt" aria-label={`${settings.heroCta} - Kontaktformular öffnen`}>
                  {settings.heroCta}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/leistungen" aria-label="Alle verfügbaren Leistungen ansehen">Leistungen entdecken</Link>
              </Button>
            </nav>
          </div>
        </div>
      </section>

      {/* Services Section - Semantic HTML for SEO/AEO */}
      <section className="py-20 md:py-28" aria-labelledby="services-title">
        <div className="container mx-auto px-4">
          <header className="text-center mb-12">
            <h2 id="services-title" className="font-display text-3xl md:text-4xl font-bold">
              Meine Leistungsbereiche
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Von der Content-Produktion bis zur vollständigen Automatisierung – 
              alles aus einer Hand.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((category) => {
              const IconComponent = iconMap[category.icon] || Code;
              const categoryProducts = products.filter(p => p.categoryId === category.id && p.status === 'published');
              const prices = categoryProducts
                .map(p => {
                  const match = p.priceText.match(/[\d.,]+/);
                  return match ? parseFloat(match[0].replace('.', '').replace(',', '.')) : null;
                })
                .filter((price): price is number => price !== null && price > 0);
              const minPrice = prices.length > 0 ? Math.min(...prices) : null;
              
              return (
                <Link key={category.id} to="/leistungen">
                  <Card className="h-full group hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      {minPrice && minPrice !== Infinity && (
                        <p className="text-sm font-medium text-primary">
                          Ab {minPrice.toLocaleString('de-DE')} €
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section - Semantic HTML for SEO/AEO */}
      {featuredProducts.length > 0 && (
        <section className="py-20 md:py-28 bg-card" aria-labelledby="featured-title">
          <div className="container mx-auto px-4">
            <header className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4" aria-hidden="true">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">Meist gebucht</span>
              </div>
              <h2 id="featured-title" className="font-display text-3xl md:text-4xl font-bold">
                Beliebte Leistungen
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Diese Services werden von meinen Kunden am häufigsten gebucht.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => {
                const category = categories.find(c => c.id === product.categoryId);
                const colors = getCategoryColors(product.categoryId, sortedCategories);
                return (
                  <Link 
                    key={product.id} 
                    to="/leistungen"
                    onClick={() => handleProductClick(product.name)}
                  >
                    <Card className={`h-full group transition-all duration-300 cursor-pointer border-2 ${colors.border} ${colors.glow}`}>
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className="bg-primary text-primary-foreground">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Beliebt
                          </Badge>
                          <Badge className={`${colors.bg} ${colors.text} border-0`}>{product.type}</Badge>
                          {category && (
                            <Badge variant="outline" className={`text-xs ${colors.border} ${colors.text}`}>
                              {category.name}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className={`font-display text-lg transition-colors ${colors.hoverText}`}>
                          {product.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {product.shortDescription}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${colors.text}`}>{product.priceText}</span>
                          <ChevronRight className={`h-5 w-5 text-muted-foreground transition-colors ${colors.hoverText}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" variant="outline" asChild>
                <Link to="/leistungen">Alle Leistungen ansehen</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section - Semantic HTML for SEO/AEO */}
      <section className="py-20 md:py-28" aria-labelledby="benefits-title">
        <div className="container mx-auto px-4">
          <header className="text-center mb-12">
            <h2 id="benefits-title" className="font-display text-3xl md:text-4xl font-bold">
              Warum mit mir arbeiten?
            </h2>
          </header>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto list-none" role="list" aria-label="Vorteile der Zusammenarbeit">
            {settings.whyWorkWithMe.map((item, index) => {
              const Icon = benefitIcons[index % benefitIcons.length];
              return (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0" aria-hidden="true">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">
                      {item}
                    </h3>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link to="/kontakt">
                Jetzt Kontakt aufnehmen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <PartnersSection />

      {/* CTA Section - Semantic HTML for SEO/AEO */}
      <aside className="py-20 md:py-28" aria-labelledby="cta-title">
        <div className="container mx-auto px-4">
          <article className="relative rounded-2xl overflow-hidden" role="region" aria-label="Handlungsaufforderung">
            <div className="absolute inset-0 bg-gradient-primary opacity-90" aria-hidden="true" />
            <div className="relative px-8 py-16 md:py-20 text-center">
              <h2 id="cta-title" className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
                Bereit, Ihr Projekt zu starten?
              </h2>
              <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
                Lassen Sie uns gemeinsam herausfinden, wie ich Ihnen helfen kann. 
                Unverbindliche Erstberatung inklusive.
              </p>
              <div className="mt-8">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/kontakt" aria-label={`${settings.heroCta} - Jetzt Projekt starten`}>{settings.heroCta}</Link>
                </Button>
              </div>
            </div>
          </article>
        </div>
      </aside>
    </Layout>
  );
}
