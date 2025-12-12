import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ChevronDown,
  Package,
  X
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

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="h-full border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="secondary" className="text-xs shrink-0">
            {product.type}
          </Badge>
        </div>
        <h4 className="font-display font-semibold text-lg mb-2 line-clamp-2">
          {product.name}
        </h4>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {product.shortDescription}
        </p>
        
        {product.showcases.length > 0 && (
          <div className="space-y-2 mb-4">
            {product.showcases.slice(0, 2).map((showcase, i) => (
              <div key={i} className="text-xs p-2 rounded bg-secondary/50">
                <span className="font-medium">{showcase.title}</span>
                <span className="text-muted-foreground ml-2">{showcase.price}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-primary font-semibold text-sm">
            {product.priceText}
          </span>
          {product.targetAudience.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {product.targetAudience[0]}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Collapsed Category Card (shown in sidebar when another is expanded)
function CollapsedCategoryCard({ 
  category, 
  productCount,
  onClick 
}: { 
  category: Category; 
  productCount: number;
  onClick: () => void;
}) {
  const IconComponent = iconMap[category.icon] || Package;
  
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all duration-300 text-left group"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{category.name}</p>
          <p className="text-xs text-muted-foreground">{productCount} Leistungen</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}

export default function Leistungen() {
  const { categories, products, settings } = useContent();
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Filter categories: only show those with active products and not hidden
  const activeCategories = categories.filter(category => {
    if (category.hidden) return false;
    const hasActiveProducts = products.some(
      p => p.categoryId === category.id && p.status === 'published'
    );
    return hasActiveProducts;
  });

  const sortedCategories = [...activeCategories].sort((a, b) => a.order - b.order);
  
  const expandedCategory = sortedCategories.find(c => c.id === expandedCategoryId);
  const otherCategories = sortedCategories.filter(c => c.id !== expandedCategoryId);
  
  const expandedProducts = expandedCategory 
    ? products.filter(p => p.categoryId === expandedCategory.id && p.status === 'published')
    : [];

  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
    } else {
      setExpandedCategoryId(categoryId);
    }
  };

  return (
    <Layout 
      pageTitle="Leistungen" 
      pageDescription="Von der kreativen Content-Produktion bis zur technischen Automatisierung – hier finden Sie alle Services, die ich anbiete."
    >
      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-dark">
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

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          
          {/* Expanded View */}
          {expandedCategory ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Expanded Category */}
              <div className="flex-1 animate-fade-in">
                {/* Expanded Category Header */}
                <button
                  onClick={() => setExpandedCategoryId(null)}
                  className="w-full mb-6 group"
                >
                  <Card className="border-2 border-primary/50 bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {(() => {
                          const IconComponent = iconMap[expandedCategory.icon] || Package;
                          const colors = getCategoryColors(expandedCategory.id, sortedCategories);
                          return (
                            <>
                              <div className={`h-16 w-16 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                                <IconComponent className={`h-8 w-8 ${colors.text}`} />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <h2 className="font-display text-2xl font-bold">
                                    {expandedCategory.name}
                                  </h2>
                                  <ChevronDown className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-muted-foreground">
                                  {expandedCategory.pageSettings?.heroSubtitle || expandedCategory.description}
                                </p>
                              </div>
                              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                                <X className="h-4 w-4" />
                                <span>Schliessen</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </button>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expandedProducts.map((product, index) => (
                    <div 
                      key={product.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {expandedProducts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Keine Leistungen in dieser Kategorie verfügbar.
                  </div>
                )}

                {/* CTA for expanded category */}
                <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <h3 className="font-display text-lg font-semibold mb-2">
                    Interesse an {expandedCategory.name}?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Kontaktieren Sie mich für eine unverbindliche Beratung.
                  </p>
                  <Button asChild>
                    <Link to="/kontakt">
                      Unverbindliche Anfrage stellen
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Sidebar with other categories */}
              {otherCategories.length > 0 && (
                <div className="lg:w-72 shrink-0 animate-fade-in">
                  <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                    Weitere Kategorien
                  </h3>
                  <div className="space-y-2">
                    {otherCategories.map((category, index) => {
                      const productCount = products.filter(
                        p => p.categoryId === category.id && p.status === 'published'
                      ).length;
                      return (
                        <div 
                          key={category.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <CollapsedCategoryCard
                            category={category}
                            productCount={productCount}
                            onClick={() => handleCategoryClick(category.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Grid View (Default) */
            <>
              <h2 className="font-display text-2xl font-bold mb-8">Alle Kategorien</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCategories.map((category, index) => {
                  const colors = getCategoryColors(category.id, sortedCategories);
                  const IconComponent = iconMap[category.icon] || Package;
                  const categoryProducts = products.filter(p => p.categoryId === category.id && p.status === 'published');
                  const productCount = categoryProducts.length;
                  
                  const description = category.pageSettings?.heroSubtitle 
                    || category.description 
                    || generateAutoDescription(category, products);

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="block text-left group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Card className={`h-full transition-all duration-300 border-2 ${colors.border} hover:border-primary/50 hover:shadow-lg hover:scale-[1.02]`}>
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
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section (only show when no category is expanded) */}
      {!expandedCategoryId && (
        <section className="py-12 bg-card/50 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold mb-4">
              Nicht sicher, welche Leistung Sie benötigen?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Kontaktieren Sie mich für eine unverbindliche Beratung. Gemeinsam finden wir die beste Lösung für Ihr Projekt.
            </p>
            <Button asChild size="lg">
              <Link to="/kontakt">
                Unverbindliche Anfrage stellen
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}
    </Layout>
  );
}
