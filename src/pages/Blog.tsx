import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";

// Demo-Blogposts
const posts = [
  {
    id: 1,
    slug: "12-monats-business-roadmap",
    title: "Meine 12-Monats Business-Roadmap",
    excerpt: "Ein detaillierter Einblick in meine strategische Planung für das kommende Jahr – von Cashflow-Stabilisierung bis zur Entwicklung eigener Produkte.",
    date: "2024-01-15",
    tags: ["Strategie", "Business", "Planung"],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
  },
  {
    id: 2,
    slug: "multilayer-system",
    title: "Das Multilayer-System meines Business",
    excerpt: "Wie ich mein Solo-Business in drei Ebenen strukturiere: Cashflow, Skalierung und Exploration – für nachhaltige Stabilität und Wachstum.",
    date: "2024-01-08",
    tags: ["Business", "Strategie", "Skalierung"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
  }
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export default function Blog() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Gedanken, Einblicke und Learnings aus meiner Arbeit mit KI, 
              Automatisierung und Content-Produktion.
            </p>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="group h-full overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar size={14} />
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>
                    
                    <h2 className="font-display text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-primary font-medium text-sm">
                      Weiterlesen
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
