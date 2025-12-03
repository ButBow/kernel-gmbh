import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Video, 
  Cpu, 
  Wrench, 
  Code, 
  ArrowRight, 
  CheckCircle,
  Zap,
  Shield,
  Lightbulb
} from "lucide-react";

const services = [
  {
    icon: Video,
    title: "Video & Content-Produktion",
    description: "Professionelle Social Media Videos und Event-Coverage für Ihre Marke.",
    href: "/leistungen"
  },
  {
    icon: Cpu,
    title: "AI-Systeme & Automation",
    description: "Intelligente Workflows und Automatisierungen für mehr Effizienz.",
    href: "/leistungen"
  },
  {
    icon: Wrench,
    title: "IT-Support & Beratung",
    description: "Technische Unterstützung und strategische Beratung für Ihr Business.",
    href: "/leistungen"
  },
  {
    icon: Code,
    title: "Tools & Micro-SaaS",
    description: "Massgeschneiderte Tools und Anwendungen für Ihre spezifischen Bedürfnisse.",
    href: "/leistungen"
  }
];

const benefits = [
  {
    icon: Zap,
    title: "Schnelle, zuverlässige Umsetzung",
    description: "Effiziente Arbeitsweise mit klaren Deadlines und Ergebnissen."
  },
  {
    icon: Lightbulb,
    title: "Technisch & kreativ stark",
    description: "Die perfekte Kombination aus technischem Know-how und kreativem Denken."
  },
  {
    icon: Shield,
    title: "Modular & zukunftssicher",
    description: "Lösungen, die mit Ihrem Business wachsen und sich anpassen."
  },
  {
    icon: CheckCircle,
    title: "Fokus auf echte Effizienz",
    description: "Keine Spielerei, sondern messbare Verbesserungen für Ihr Business."
  }
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(38_92%_50%/0.1),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up">
              Ihr Partner für{" "}
              <span className="text-gradient">KI, Automatisierung</span>
              {" "}& Content
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Ich helfe Firmen, Creators und Einzelunternehmern, ihre Arbeit mit KI und Automatisierung 
              schneller, sauberer und kreativer zu machen. Zusätzlich produziere ich hochwertigen 
              Social Media Content für Events und Marken.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" asChild>
                <Link to="/kontakt">
                  Projekt anfragen
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
            {services.map((service, index) => (
              <Link key={service.title} to={service.href}>
                <Card 
                  className="h-full group hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
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
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title} 
                className="flex gap-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
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
                  <Link to="/kontakt">Projekt anfragen</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
