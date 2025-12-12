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
  Users
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Video, Cpu, Wrench, Code, Image, FileText, Users
};

const benefitIcons = [Zap, Lightbulb, Shield, CheckCircle];

export default function Index() {
  const { settings, categories, products } = useContent();
  const { trackEvent } = useAnalytics();

  // Sorted categories for display - filter hidden and sort by order
  const sortedCategories = [...categories]
    .filter(c => !c.hidden)
    .sort((a, b) => a.order - b.order);
  
  // Get first 4 active categories for service teasers
  const serviceCategories = sortedCategories.slice(0, 4);

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
              const colors = getCategoryColors(category.id, sortedCategories);
              const categoryProducts = products.filter(p => p.categoryId === category.id && p.status === 'published');
              const prices = categoryProducts
                .map(p => {
                  const match = p.priceText.match(/[\d.,]+/);
                  return match ? parseFloat(match[0].replace('.', '').replace(',', '.')) : null;
                })
                .filter((price): price is number => price !== null && price > 0);
              const minPrice = prices.length > 0 ? Math.min(...prices) : null;
              
              return (
                <Link key={category.id} to={`/leistungen/${category.slug}`}>
                  <Card className={`h-full group transition-all duration-300 hover:shadow-lg cursor-pointer border-2 ${colors.border} hover:border-primary/50`}>
                    <CardContent className="p-6">
                      <div className={`h-12 w-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.pageSettings?.heroSubtitle || category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {minPrice && minPrice !== Infinity && (
                          <p className="text-sm font-medium text-primary">
                            Ab CHF {minPrice.toLocaleString('de-CH')}
                          </p>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {categoryProducts.length} {categoryProducts.length === 1 ? 'Leistung' : 'Leistungen'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      {/* Benefits Section - Semantic HTML for SEO/AEO */}
      <section className="py-20 md:py-28 bg-card/30" aria-labelledby="benefits-title">
        <div className="container mx-auto px-4">
          <header className="text-center mb-12">
            <h2 id="benefits-title" className="font-display text-3xl md:text-4xl font-bold">
              Warum mit mir arbeiten?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Qualität, Zuverlässigkeit und Innovation – das sind meine Versprechen an Sie.
            </p>
          </header>

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 list-none" role="list" aria-label="Vorteile der Zusammenarbeit">
            {settings.whyWorkWithMe.map((item, index) => {
              const Icon = benefitIcons[index % benefitIcons.length];
              return (
                <li key={index}>
                  <Card className="h-full border-2 border-border hover:border-primary/30 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all" aria-hidden="true">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-lg">
                        {item}
                      </h3>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link to="/kontakt">
                Unverbindliche Anfrage stellen
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
