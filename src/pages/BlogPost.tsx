import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContent } from "@/contexts/ContentContext";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";

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
  const { posts } = useContent();
  
  const post = posts.find(p => p.slug === slug && p.status === 'published');

  if (!post) {
    return (
      <Layout pageTitle="Beitrag nicht gefunden">
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
    <Layout pageTitle={post.title}>
      {/* Hero Image */}
      {post.image && (
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className={`container mx-auto px-4 ${post.image ? '-mt-20 relative z-20' : 'pt-16'}`}>
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
              if (line.startsWith('# ')) {
                return (
                  <h1 key={index} className="font-display text-3xl font-bold mt-8 mb-4 text-foreground">
                    {line.replace('# ', '')}
                  </h1>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={index} className="font-display text-2xl font-bold mt-8 mb-4 text-foreground">
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              if (line.startsWith('### ')) {
                return (
                  <h3 key={index} className="font-display text-xl font-bold mt-6 mb-3 text-foreground">
                    {line.replace('### ', '')}
                  </h3>
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
              if (line.match(/^\d+\. /)) {
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
