import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useContent } from "@/contexts/ContentContext";
import { 
  Video, 
  Cpu, 
  Code, 
  Wrench, 
  Users, 
  Star,
  Lightbulb,
  Eye,
  Zap,
  Target,
  Heart,
  Shield,
  Rocket,
  Award,
  Quote
} from "lucide-react";

const skillIcons = [Video, Cpu, Code, Wrench, Users, Star, Lightbulb, Target];
const valueIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Star,
  Lightbulb,
  Eye,
  Zap,
  Target,
  Heart,
  Shield,
  Rocket,
  Award
};

export default function UeberMich() {
  const { settings } = useContent();

  return (
    <Layout pageTitle="Über mich">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 animate-fade-in">
                {settings.aboutTagline || "Über mich"}
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                {settings.ownerName}
              </h1>
              <p className="text-xl text-primary font-medium mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Gründer von {settings.companyName}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: "0.3s" }}>
                {settings.aboutText}
              </p>
            </div>
            
            {/* Profile Image */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative animate-scale-in">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl" />
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-glow">
                  <img 
                    src={settings.aboutImage} 
                    alt={settings.ownerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-card border border-border rounded-xl shadow-lg">
                  <p className="text-sm font-medium text-primary">Verfügbar für Projekte</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {settings.stats && settings.stats.length > 0 && (
        <section className="py-12 border-y border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {settings.stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mission Section */}
      {settings.aboutMission && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium uppercase tracking-wider mb-6">
                Mission
              </span>
              <blockquote className="text-2xl md:text-3xl font-display font-medium leading-relaxed text-foreground">
                "{settings.aboutMission}"
              </blockquote>
            </div>
          </div>
        </section>
      )}

      {/* Core Values */}
      {settings.coreValues && settings.coreValues.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-dark">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Meine <span className="text-gradient">Werte</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Die Prinzipien, die meine Arbeit leiten und jeden Kundenprojekt prägen.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {settings.coreValues.map((value, index) => {
                const IconComponent = valueIcons[value.icon] || Star;
                return (
                  <Card 
                    key={index} 
                    className="group hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Timeline / Milestones */}
      {settings.milestones && settings.milestones.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Mein <span className="text-gradient">Werdegang</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Die wichtigsten Stationen auf meinem Weg.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />
                
                {settings.milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`relative flex items-start gap-6 mb-12 last:mb-0 animate-fade-in ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {/* Year bubble */}
                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10 shadow-glow">
                      <span className="font-display font-bold text-primary text-sm">{milestone.year}</span>
                    </div>
                    
                    {/* Content card */}
                    <div className={`ml-24 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                      <Card className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-5">
                          <h3 className="font-display font-semibold text-lg mb-2">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {settings.testimonials && settings.testimonials.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Was Kunden <span className="text-gradient">sagen</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Echte Erfahrungen von Menschen, die mit mir zusammengearbeitet haben.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {settings.testimonials.map((testimonial, index) => (
                <Card 
                  key={index} 
                  className="group hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    {/* Quote Icon */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Quote className="h-5 w-5 text-primary" />
                    </div>
                    
                    {/* Quote Text */}
                    <blockquote className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    {/* Rating */}
                    {testimonial.rating && (
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating! ? 'fill-primary text-primary' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {testimonial.position}
                        </p>
                        <p className="text-xs text-primary truncate">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {settings.skills.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-dark">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Meine <span className="text-gradient">Kompetenzen</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Die Fähigkeiten, die ich täglich einsetze, um Ihre Projekte zum Erfolg zu führen.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {settings.skills.map((skill, index) => {
                const Icon = skillIcons[index % skillIcons.length];
                return (
                  <Card 
                    key={index} 
                    className="group hover:border-primary/50 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold">{skill}</h4>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Lassen Sie uns zusammenarbeiten
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Haben Sie ein Projekt im Kopf? Ich freue mich darauf, Ihre Ideen in die Realität umzusetzen.
              </p>
              <a 
                href="/kontakt"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Kontakt aufnehmen
                <Rocket className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
