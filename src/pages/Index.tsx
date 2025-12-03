import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useContent } from "@/contexts/ContentContext";
import { PartnersSection } from "@/components/PartnersSection";
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
  const { settings, categories } = useContent();

  // Get first 4 categories for service teasers
  const serviceCategories = categories.slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(38_92%_50%/0.1),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up">
              <span className="text-gradient">{settings.heroTitle}</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {settings.heroSubtitle}
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" asChild>
                <Link to="/kontakt">
                  {settings.heroCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/leistungen">Leistungen entdecken</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Meine Leistungsbereiche
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Von der Content-Produktion bis zur vollständigen Automatisierung – 
              alles aus einer Hand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((category, index) => {
              const IconComponent = iconMap[category.icon] || Code;
              return (
                <Link key={category.id} to="/leistungen">
                  <Card 
                    className="h-full group hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Warum mit mir arbeiten?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {settings.whyWorkWithMe.map((item, index) => {
              const Icon = benefitIcons[index % benefitIcons.length];
              return (
                <div 
                  key={index} 
                  className="flex gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">
                      {item}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

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

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-90" />
            <div className="relative px-8 py-16 md:py-20 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
                Bereit, Ihr Projekt zu starten?
              </h2>
              <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
                Lassen Sie uns gemeinsam herausfinden, wie ich Ihnen helfen kann. 
                Unverbindliche Erstberatung inklusive.
              </p>
              <div className="mt-8">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/kontakt">{settings.heroCta}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
