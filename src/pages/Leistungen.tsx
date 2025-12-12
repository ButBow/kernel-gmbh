import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
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
function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
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
    </motion.div>
  );
}

// Collapsed Category Card (shown in sidebar when another is expanded)
function CollapsedCategoryCard({ 
  category, 
  productCount,
  onClick,
  index
}: { 
  category: Category; 
  productCount: number;
  onClick: () => void;
  index: number;
}) {
  const IconComponent = iconMap[category.icon] || Package;
  
  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
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
    </motion.button>
  );
}

// Category Grid Card
function CategoryGridCard({
  category,
  products,
  sortedCategories,
  onClick
}: {
  category: Category;
  products: Product[];
  sortedCategories: Category[];
  onClick: () => void;
}) {
  const colors = getCategoryColors(category.id, sortedCategories);
  const IconComponent = iconMap[category.icon] || Package;
  const categoryProducts = products.filter(p => p.categoryId === category.id && p.status === 'published');
  const productCount = categoryProducts.length;
  
  const description = category.pageSettings?.heroSubtitle 
    || category.description 
    || generateAutoDescription(category, products);

  return (
    <motion.button
      layoutId={`category-card-${category.id}`}
      onClick={onClick}
      className="block text-left w-full group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Card className={`h-full transition-all duration-300 border-2 ${colors.border} hover:border-primary/50 hover:shadow-lg`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <motion.div 
              layoutId={`category-icon-${category.id}`}
              className={`h-14 w-14 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}
            >
              <IconComponent className={`h-7 w-7 ${colors.text}`} />
            </motion.div>
            <div className="flex-1 min-w-0">
              <motion.h3 
                layoutId={`category-title-${category.id}`}
                className={`font-display text-xl font-bold mb-1 transition-colors ${colors.hoverText}`}
              >
                {category.name}
              </motion.h3>
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
    </motion.button>
  );
}

// Expanded Category Header
function ExpandedCategoryHeader({
  category,
  sortedCategories,
  onClose
}: {
  category: Category;
  sortedCategories: Category[];
  onClose: () => void;
}) {
  const IconComponent = iconMap[category.icon] || Package;
  const colors = getCategoryColors(category.id, sortedCategories);

  return (
    <motion.button
      layoutId={`category-card-${category.id}`}
      onClick={onClose}
      className="w-full mb-6 group text-left"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card className="border-2 border-primary/50 bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <motion.div 
              layoutId={`category-icon-${category.id}`}
              className={`h-16 w-16 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}
            >
              <IconComponent className={`h-8 w-8 ${colors.text}`} />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <motion.h2 
                  layoutId={`category-title-${category.id}`}
                  className="font-display text-2xl font-bold"
                >
                  {category.name}
                </motion.h2>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5 text-primary" />
                </motion.div>
              </div>
              <p className="text-muted-foreground">
                {category.pageSettings?.heroSubtitle || category.description}
              </p>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Schliessen</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.button>
  );
}

export default function Leistungen() {
  const { categories, products } = useContent();
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
      // Scroll to top of section
      window.scrollTo({ top: 200, behavior: 'smooth' });
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
          <LayoutGroup>
            <AnimatePresence mode="wait">
              {/* Expanded View */}
              {expandedCategory ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col lg:flex-row gap-6"
                >
                  {/* Main Expanded Category */}
                  <div className="flex-1">
                    <ExpandedCategoryHeader
                      category={expandedCategory}
                      sortedCategories={sortedCategories}
                      onClose={() => setExpandedCategoryId(null)}
                    />

                    {/* Products Grid */}
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <AnimatePresence>
                        {expandedProducts.map((product, index) => (
                          <ProductCard key={product.id} product={product} index={index} />
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {expandedProducts.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-muted-foreground"
                      >
                        Keine Leistungen in dieser Kategorie verfügbar.
                      </motion.div>
                    )}

                    {/* CTA for expanded category */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20 text-center"
                    >
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
                    </motion.div>
                  </div>

                  {/* Sidebar with other categories */}
                  {otherCategories.length > 0 && (
                    <motion.div 
                      className="lg:w-72 shrink-0"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                        Weitere Kategorien
                      </h3>
                      <div className="space-y-2">
                        <AnimatePresence>
                          {otherCategories.map((category, index) => {
                            const productCount = products.filter(
                              p => p.categoryId === category.id && p.status === 'published'
                            ).length;
                            return (
                              <CollapsedCategoryCard
                                key={category.id}
                                category={category}
                                productCount={productCount}
                                onClick={() => handleCategoryClick(category.id)}
                                index={index}
                              />
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* Grid View (Default) */
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="font-display text-2xl font-bold mb-8">Alle Kategorien</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCategories.map((category) => (
                      <CategoryGridCard
                        key={category.id}
                        category={category}
                        products={products}
                        sortedCategories={sortedCategories}
                        onClick={() => handleCategoryClick(category.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </section>

      {/* CTA Section (only show when no category is expanded) */}
      <AnimatePresence>
        {!expandedCategoryId && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 bg-card/50 border-t border-border"
          >
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
          </motion.section>
        )}
      </AnimatePresence>
    </Layout>
  );
}
