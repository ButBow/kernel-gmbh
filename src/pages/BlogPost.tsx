import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";

// Demo-Blogposts mit vollständigem Content
const posts: Record<string, {
  title: string;
  date: string;
  tags: string[];
  image: string;
  content: string;
}> = {
  "12-monats-business-roadmap": {
    title: "Meine 12-Monats Business-Roadmap",
    date: "2024-01-15",
    tags: ["Strategie", "Business", "Planung"],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    content: `
## Die Vision

Als Solo-Unternehmer ist strategische Planung entscheidend. Hier teile ich meine 12-Monats-Roadmap, die mir als Leitfaden dient.

## Phase 1: Foundation (Monat 1-3)

In den ersten drei Monaten liegt der Fokus auf der Stabilisierung:

- **Cashflow sichern**: Bestehende Kundenbeziehungen pflegen und ausbauen
- **Prozesse optimieren**: Wiederkehrende Aufgaben automatisieren
- **Tools konsolidieren**: Tech-Stack vereinfachen und effizienter gestalten

## Phase 2: Growth (Monat 4-6)

Mit stabiler Basis kann ich in Wachstum investieren:

- **Neue Services**: AI-Automatisierungspakete weiterentwickeln
- **Content-Marketing**: Regelmässige Blog-Posts und LinkedIn-Präsenz
- **Netzwerk**: Aktive Teilnahme an relevanten Events und Communities

## Phase 3: Scale (Monat 7-9)

Zeit für Skalierung:

- **Produktisierung**: Aus Services standardisierte Pakete entwickeln
- **Passive Einnahmen**: Erste digitale Produkte oder Templates
- **Partnerschaften**: Strategische Kooperationen aufbauen

## Phase 4: Innovate (Monat 10-12)

Das letzte Quartal für Innovation:

- **Neue Märkte**: Mögliche Expansion in neue Bereiche evaluieren
- **Eigene Tools**: Micro-SaaS Ideen validieren und umsetzen
- **Reflexion**: Jahresrückblick und Planung für das nächste Jahr

## Fazit

Diese Roadmap ist kein starres Korsett, sondern ein flexibler Rahmen. Sie hilft mir, fokussiert zu bleiben und trotzdem auf Chancen reagieren zu können.
    `
  },
  "multilayer-system": {
    title: "Das Multilayer-System meines Business",
    date: "2024-01-08",
    tags: ["Business", "Strategie", "Skalierung"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    content: `
## Die drei Ebenen

Mein Solo-Business strukturiere ich in drei Ebenen, die unterschiedliche Funktionen erfüllen und sich gegenseitig unterstützen.

## Ebene 1: Cashflow-Layer

Die Basis ist der Cashflow-Layer – hier verdiene ich das Geld, das alles andere ermöglicht:

- **Client Services**: Video-Produktion, AI-Beratung, technischer Support
- **Retainer**: Regelmässige Wartungs- und Support-Verträge
- **Quick Wins**: Kleinere Projekte mit schneller Abwicklung

Diese Ebene muss stabil laufen. Sie finanziert nicht nur meinen Alltag, sondern auch die anderen beiden Ebenen.

## Ebene 2: Scaling-Layer

Hier investiere ich Zeit in Dinge, die langfristig mehr Effizienz oder passive Einnahmen bringen:

- **Produktisierte Services**: Standardisierte Pakete statt Custom-Arbeit
- **Templates & Vorlagen**: Wiederverwendbare Bausteine für schnellere Projekte
- **Dokumentation**: Wissen so aufbereiten, dass es skaliert

## Ebene 3: Exploration-Layer

Der spannendste, aber auch riskanteste Bereich:

- **Neue Technologien**: Experimentieren mit neuen AI-Tools
- **Eigene Produkte**: Micro-SaaS Ideen entwickeln und testen
- **Unbekanntes Terrain**: Bewusst Dinge ausprobieren, die nicht direkt Geld bringen

## Das Zusammenspiel

Das Schöne an diesem System: Die Ebenen sind nicht isoliert. Ein Experiment aus dem Exploration-Layer kann zum neuen Service im Cashflow-Layer werden. Ein produktisierter Service aus dem Scaling-Layer kann zum Template werden, das ich verkaufe.

## Warum dieses System funktioniert

1. **Stabilität**: Der Cashflow-Layer gibt Sicherheit
2. **Wachstum**: Der Scaling-Layer ermöglicht Effizienz
3. **Innovation**: Der Exploration-Layer hält mich relevant

So balanciere ich zwischen der Notwendigkeit, Geld zu verdienen, und dem Wunsch, Neues zu schaffen.
    `
  }
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? posts[slug] : null;

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Beitrag nicht gefunden</h1>
          <p className="text-muted-foreground mb-8">
            Der gesuchte Blogbeitrag existiert nicht.
          </p>
          <Button asChild>
            <Link to="/blog">Zurück zum Blog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      <article className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link 
            to="/blog" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Blog
          </Link>

          {/* Header */}
          <header className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-card mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar size={14} />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {post.content.split('\n').map((line, index) => {
              if (line.startsWith('## ')) {
                return (
                  <h2 key={index} className="font-display text-2xl font-bold mt-8 mb-4 text-foreground">
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              if (line.startsWith('- **')) {
                const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
                if (match) {
                  return (
                    <p key={index} className="my-2 text-muted-foreground">
                      <strong className="text-foreground">{match[1]}:</strong> {match[2]}
                    </p>
                  );
                }
              }
              if (line.startsWith('- ')) {
                return (
                  <p key={index} className="my-2 text-muted-foreground pl-4">
                    • {line.replace('- ', '')}
                  </p>
                );
              }
              if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                return (
                  <p key={index} className="my-2 text-muted-foreground">
                    {line}
                  </p>
                );
              }
              if (line.trim() === '') {
                return <br key={index} />;
              }
              return (
                <p key={index} className="my-4 text-muted-foreground">
                  {line}
                </p>
              );
            })}
          </div>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <Link 
                to="/blog" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Weitere Beiträge
              </Link>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Teilen
              </Button>
            </div>
          </div>
        </div>
      </article>

      <div className="h-24" />
    </Layout>
  );
}
