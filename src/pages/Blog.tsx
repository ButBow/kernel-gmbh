import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/contexts/ContentContext";
import { Calendar, ArrowRight } from "lucide-react";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export default function Blog() {
  const { posts } = useContent();

  // Only show published posts, sorted by date
  const publishedPosts = posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Layout 
      pageTitle="Blog" 
      pageDescription="Gedanken, Einblicke und Learnings aus meiner Arbeit mit KI, Automatisierung und Content-Produktion."
    >
      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-dark overflow-hidden">
        <div className="absolute inset-0 glow-bg" aria-hidden="true" />
        <div className="glow-top-right glow-pulse" aria-hidden="true" />
        <div className="container relative mx-auto px-4">
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

      {/* Section Divider */}
      <div className="section-divider" aria-hidden="true" />

      {/* Posts */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="glow-right glow-pulse" aria-hidden="true" />
        <div className="container relative mx-auto px-4">
          {publishedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {publishedPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="group h-full overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
                    {post.image && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Noch keine Blogbeiträge vorhanden.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
