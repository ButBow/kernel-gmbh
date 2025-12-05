import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContent } from "@/contexts/ContentContext";
import { X, Image as ImageIcon, Video, Play } from "lucide-react";
import { ProjectGalleryModal } from "@/components/ProjectGalleryModal";
import type { Project } from "@/data/initialData";

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onOpenGallery: () => void;
}

function ProjectDetail({ project, onClose, onOpenGallery }: ProjectDetailProps) {
  const hasGallery = project.gallery && project.gallery.length > 0;
  
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
        
        {project.image && (
          <div className="aspect-video w-full overflow-hidden rounded-t-xl">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
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

          {/* Gallery Preview */}
          {hasGallery && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">
                Galerie ({project.gallery!.length} {project.gallery!.length === 1 ? 'Element' : 'Elemente'})
              </p>
              <div className="grid grid-cols-4 gap-2">
                {project.gallery!.slice(0, 4).map((item, index) => (
                  <button
                    key={item.id}
                    onClick={onOpenGallery}
                    className="aspect-video rounded-lg overflow-hidden bg-muted relative group"
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    )}
                    {index === 3 && project.gallery!.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold">+{project.gallery!.length - 4}</span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1">
                      {item.type === 'video' ? (
                        <Video className="h-3 w-3 text-white drop-shadow-md" />
                      ) : (
                        <ImageIcon className="h-3 w-3 text-white drop-shadow-md" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            {hasGallery && (
              <Button onClick={onOpenGallery} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Arbeit ansehen
              </Button>
            )}
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
  const { projects } = useContent();
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  // Only show published projects
  const publishedProjects = projects.filter(p => p.status === 'published');

  // Get unique categories from projects
  const projectCategories = ["Alle", ...new Set(publishedProjects.map(p => p.category))];

  const filteredProjects = selectedCategory === "Alle"
    ? publishedProjects
    : publishedProjects.filter(p => p.category === selectedCategory);

  const handleOpenGallery = () => {
    setShowGallery(true);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  return (
    <Layout pageTitle="Portfolio">
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
            {projectCategories.map((category) => (
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
                  {project.image && (
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {project.gallery && project.gallery.length > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-md flex items-center gap-1">
                          {project.gallery.some(g => g.type === 'video') && (
                            <Video className="h-3 w-3 text-white" />
                          )}
                          {project.gallery.some(g => g.type === 'image') && (
                            <ImageIcon className="h-3 w-3 text-white" />
                          )}
                          <span className="text-xs text-white">{project.gallery.length}</span>
                        </div>
                      )}
                    </div>
                  )}
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
      {selectedProject && !showGallery && (
        <ProjectDetail 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)}
          onOpenGallery={handleOpenGallery}
        />
      )}

      {/* Gallery Modal */}
      {selectedProject && showGallery && selectedProject.gallery && selectedProject.gallery.length > 0 && (
        <ProjectGalleryModal
          items={selectedProject.gallery}
          projectTitle={selectedProject.title}
          onClose={handleCloseGallery}
        />
      )}
    </Layout>
  );
}
