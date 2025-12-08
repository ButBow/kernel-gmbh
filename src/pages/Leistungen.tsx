import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/contexts/ContentContext";
import { getCategoryColors } from "@/lib/categoryColors";
import { 
  Video, 
  Cpu, 
  Wrench, 
  Code, 
  Image as ImageIcon, 
  FileText,
  Users,
  ChevronRight,
  Package,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Category, Product } from "@/data/initialData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Video, Cpu, Wrench, Code, Image: ImageIcon, FileText, Users, Package
};

// Auto-generate description based on category products
function generateAutoDescription(category: Category, products: Product[]): string {
  const activeProducts = products.filter(p => p.categoryId === category.id && p.status === 'published');
  const productCount = activeProducts.length;
  
  if (productCount === 0) {
    return `Entdecken Sie unsere ${category.name} Angebote.`;
  }
  
  const types = [...new Set(activeProducts.map(p => p.type))];
  const typeText = types.length > 1 
    ? `${types.slice(0, -1).join(', ')} und ${types[types.length - 1]}`
    : types[0] || 'Leistungen';
    
  return `${productCount} ${typeText} für ${category.description.toLowerCase().replace(/\.$/, '')}.`;
}

export default function Leistungen() {
  const { categories, products } = useContent();

  // Filter categories: only show those with active products OR explicitly not hidden
  const activeCategories = categories.filter(category => {
    // Check if category is explicitly hidden
    if (category.hidden) return false;
    
    // Auto-hide if no active products
    const hasActiveProducts = products.some(
      p => p.categoryId === category.id && p.status === 'published'
    );
    return hasActiveProducts;
  });

  const sortedCategories = [...activeCategories].sort((a, b) => a.order - b.order);

  // Get featured products across all categories
  const featuredProducts = products
    .filter(p => p.status === 'published' && p.featured)
    .slice(0, 6);

  return (
    <Layout 
      pageTitle="Leistungen" 
      pageDescription="Von der kreativen Content-Produktion bis zur technischen Automatisierung – hier finden Sie alle Services, die ich anbiete."
    >
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Meine <span className="text-gradient">Leistungen</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Von der kreativen Content-Produktion bis zur technischen Automatisierung – 
              hier finden Sie alle Services, die ich anbiete.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-8 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <h2 className="font-display text-xl font-semibold">Beliebteste Leistungen</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => {
                const colors = getCategoryColors(product.categoryId, sortedCategories);
                const category = categories.find(c => c.id === product.categoryId);
                const categorySlug = category?.slug || category?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unknown';
                return (
                  <Link 
                    key={product.id}
                    to={`/leistungen/${categorySlug}`}
                    className="block"
                  >
                    <Card className={`group h-full transition-all duration-300 border-2 ${colors.border} ${colors.glow} ring-2 ring-primary/20 hover:scale-[1.02]`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-primary text-primary-foreground border-0">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Beliebt
                          </Badge>
                          <Badge className={`${colors.bg} ${colors.text} border-0`}>{product.type}</Badge>
                        </div>
                        <h3 className={`font-display text-lg font-semibold mb-2 transition-colors ${colors.hoverText}`}>
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {product.shortDescription}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${colors.text}`}>{product.priceText}</span>
                          <ChevronRight className={`h-5 w-5 text-muted-foreground transition-colors ${colors.hoverText}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Category Cards */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-8">Alle Kategorien</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCategories.map((category) => {
              const colors = getCategoryColors(category.id, sortedCategories);
              const IconComponent = iconMap[category.icon] || Package;
              const categoryProducts = products.filter(p => p.categoryId === category.id && p.status === 'published');
              const productCount = categoryProducts.length;
              
              // Use pageSettings description, category description, or auto-generate
              const description = category.pageSettings?.heroSubtitle 
                || category.description 
                || generateAutoDescription(category, products);

              return (
                <Link 
                  key={category.id}
                  to={`/leistungen/${category.slug}`}
                  className="block group"
                >
                  <Card className={`h-full transition-all duration-300 border-2 ${colors.border} hover:border-primary/50 hover:shadow-lg`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`h-14 w-14 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                          <IconComponent className={`h-7 w-7 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-display text-xl font-bold mb-1 transition-colors ${colors.hoverText}`}>
                            {category.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {productCount} {productCount === 1 ? 'Leistung' : 'Leistungen'}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className={`text-sm font-medium ${colors.text}`}>
                          Details ansehen
                        </span>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 ${colors.hoverText}`} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-card/50 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">
            Nicht sicher, welche Leistung Sie benötigen?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Kontaktieren Sie mich für eine unverbindliche Beratung. Gemeinsam finden wir die beste Lösung für Ihr Projekt.
          </p>
          <Link 
            to="/kontakt"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Kostenlos beraten lassen
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}