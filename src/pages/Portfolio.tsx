import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";

// Demo-Projekte
const projects = [
  {
    id: 1,
    title: "Social Media Kampagne – TechStartup X",
    category: "Video",
    description: "Komplette Social Media Video-Kampagne für einen Schweizer Tech-Startup. 15 Kurzvideos für Instagram und TikTok, optimiert für maximales Engagement.",
    fullDescription: "Für TechStartup X haben wir eine umfassende Social Media Kampagne entwickelt und produziert. Das Projekt umfasste 15 kurze, dynamische Videos, die speziell für Instagram Reels und TikTok optimiert wurden. Jedes Video wurde mit professionellem Color-Grading, Sounddesign und plattformspezifischen Anpassungen versehen. Die Kampagne erzielte eine durchschnittliche Engagement-Rate von 8.5%.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    tags: ["Social Media", "Video Production", "Campaign"],
    relatedProduct: "Kurzvideo Social Media (30–60s)"
  },
  {
    id: 2,
    title: "AI Automation Workspace – Kreativagentur",
    category: "AI-System",
    description: "Vollautomatisierter Workspace mit Notion, Python und API-Integrationen für eine 10-köpfige Kreativagentur.",
    fullDescription: "Für eine wachsende Kreativagentur haben wir einen vollständig automatisierten Workspace implementiert. Das System umfasst ein zentrales Notion-Dashboard, Python-basierte Automatisierungen für wiederkehrende Aufgaben, und nahtlose API-Integrationen mit Tools wie Slack, Google Workspace und dem Projektmanagement-System der Agentur. Die Zeitersparnis beträgt geschätzt 15 Stunden pro Woche.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    tags: ["Automation", "AI", "Notion", "Python"],
    relatedProduct: "Pro AI Workspace"
  },
  {
    id: 3,
    title: "Event Coverage – Firmen-Jubiläum",
    category: "Video",
    description: "Ganztägige Video-Dokumentation eines Firmenjubiläums mit Highlight-Video und 25 Social Clips.",
    fullDescription: "Zum 25-jährigen Jubiläum eines Schweizer Familienunternehmens haben wir die gesamte Veranstaltung dokumentiert. Das Ergebnis: Ein emotionales 3-minütiges Highlight-Video sowie 25 kurze Social Media Clips für die interne und externe Kommunikation. Die Videos wurden sowohl für die Website als auch für LinkedIn und Instagram optimiert.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    tags: ["Event", "Video Production", "Corporate"],
    relatedProduct: "Event-Highlight-Video / Full Day Coverage"
  }
];

const categories = ["Alle", "Video", "AI-System", "Tool", "Beratung"];

interface ProjectDetailProps {
  project: typeof projects[0];
  onClose: () => void;
}

function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-xl border border-border shadow-card animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors z-10"
          aria-label="Schliessen"
        >
          <X size={20} />
        </button>
        
        <div className="aspect-video w-full overflow-hidden rounded-t-xl">
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge>{project.category}</Badge>
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            {project.title}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {project.fullDescription}
          </p>
          
          {project.relatedProduct && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border mb-6">
              <p className="text-sm text-muted-foreground mb-1">Verwandter Service:</p>
              <p className="font-semibold">{project.relatedProduct}</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose}>
              Schliessen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

  const filteredProjects = selectedCategory === "Alle"
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Portfolio</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Eine Auswahl meiner Projekte – von Video-Produktionen bis zu 
              komplexen Automatisierungslösungen.
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card 
                  key={project.id}
                  className="group cursor-pointer overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge>{project.category}</Badge>
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Keine Projekte in dieser Kategorie gefunden.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetail 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </Layout>
  );
}
