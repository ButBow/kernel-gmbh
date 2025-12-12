import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContent } from "@/contexts/ContentContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
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
  ChevronLeft,
  X,
  Package,
  Send,
  ArrowLeft
} from "lucide-react";
import type { Product, Showcase, Category } from "@/data/initialData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Video, Cpu, Wrench, Code, Image: ImageIcon, FileText, Users, Package
};

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onInquiry: (product: Product, showcase?: Showcase) => void;
  categories: Category[];
}

function ProductDetail({ product, onClose, onInquiry, categories }: ProductDetailProps) {
  const colors = getCategoryColors(product.categoryId, categories);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-xl border-2 ${colors.border} shadow-card animate-scale-in`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Schliessen"
        >
          <X size={20} />
        </button>
        
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className={`${colors.bg} ${colors.text} border-0`}>{product.type}</Badge>
            {product.targetAudience?.map((audience) => (
              <Badge key={audience} variant="outline">{audience}</Badge>
            ))}
          </div>
          
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            {product.name}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {product.description}
          </p>
          
          <div className="mb-6">
            <span className={`text-2xl font-bold ${colors.text}`}>{product.priceText}</span>
          </div>
          
          {product.showcases && product.showcases.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display font-semibold mb-4">Pakete & Varianten</h3>
              <div className="space-y-4">
                {product.showcases.map((showcase, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg ${colors.bg} border ${colors.border} hover:border-primary/50 transition-colors group`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{showcase.title}</h4>
                      <span className={`${colors.text} font-semibold`}>{showcase.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{showcase.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onInquiry(product, showcase)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Dieses Paket anfragen
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button onClick={() => onInquiry(product)} className="flex-1">
              Anfragen
            </Button>
            <Button variant="outline" onClick={onClose}>
              Schliessen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KategorieSeite() {
  const { slug } = useParams<{ slug: string }>();
  const { categories, products } = useContent();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Find category by slug
  const category = categories.find(c => c.slug === slug);
  
  if (!category) {
    return (
      <Layout pageTitle="Kategorie nicht gefunden">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Kategorie nicht gefunden</h1>
          <p className="text-muted-foreground mb-8">Die angeforderte Kategorie existiert nicht.</p>
          <Button asChild>
            <Link to="/leistungen">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu allen Leistungen
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const pageSettings = category.pageSettings || {};
  const colors = getCategoryColors(category.id, categories);
  const IconComponent = iconMap[category.icon] || Package;
  
  // Get products for this category
  const categoryProducts = products
    .filter(p => p.categoryId === category.id && p.status === 'published');

  // Get other categories for navigation
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
  const prevCategory = currentIndex > 0 ? sortedCategories[currentIndex - 1] : null;
  const nextCategory = currentIndex < sortedCategories.length - 1 ? sortedCategories[currentIndex + 1] : null;

  const handleProductClick = (product: Product) => {
    trackEvent('product_click', `/leistungen/${slug}`, { productName: product.name });
    setSelectedProduct(product);
  };

  const handleInquiry = (product: Product, showcase?: Showcase) => {
    trackEvent('product_inquiry', `/leistungen/${slug}`, { 
      productName: product.name,
      packageName: showcase?.title || 'general'
    });
    
    const params = new URLSearchParams();
    params.set('product', product.name);
    params.set('productPrice', product.priceText);
    params.set('category', category.name);
    
    if (showcase) {
      params.set('package', showcase.title);
      params.set('packagePrice', showcase.price);
      params.set('packageDescription', showcase.description);
    }
    
    navigate(`/kontakt?${params.toString()}`);
  };

  const layout = pageSettings.layout || 'grid';
  const columns = pageSettings.columnsDesktop || 3;

  const gridClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <Layout 
      pageTitle={pageSettings.seoTitle || category.name}
      pageDescription={pageSettings.seoDescription || category.description}
    >
      {/* Hero Section */}
      <section 
        className="py-16 md:py-24 bg-gradient-dark relative overflow-hidden"
        style={pageSettings.heroImage ? { 
          backgroundImage: `linear-gradient(to bottom, hsl(var(--background)/0.9), hsl(var(--background))), url(${pageSettings.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/leistungen" className="hover:text-foreground transition-colors">Leistungen</Link>
            <ChevronRight className="h-4 w-4" />
            <span className={colors.text}>{category.name}</span>
          </nav>

          <div className="flex items-start gap-6">
            <div className={`h-16 w-16 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
              <IconComponent className={`h-8 w-8 ${colors.text}`} />
            </div>
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                {pageSettings.heroTitle || category.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {pageSettings.heroSubtitle || category.description || generateAutoDescription(category, products)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-4 border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {prevCategory ? (
              <Link 
                to={`/leistungen/${prevCategory.slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {prevCategory.name}
              </Link>
            ) : <div />}
            
            <Link 
              to="/leistungen"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Alle Kategorien
            </Link>
            
            {nextCategory ? (
              <Link 
                to={`/leistungen/${nextCategory.slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {nextCategory.name}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>

      {/* Products Grid/List */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {layout === 'list' ? (
            <div className="space-y-4">
              {categoryProducts.map((product) => (
                <Card 
                  key={product.id}
                  className={`group cursor-pointer transition-all duration-300 border ${colors.border} hover:border-primary/50`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center p-4 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${colors.bg} ${colors.text} border-0`}>{product.type}</Badge>
                      </div>
                      <h3 className={`font-display font-semibold transition-colors ${colors.hoverText}`}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.shortDescription}
                      </p>
                    </div>
                    {pageSettings.showPrices !== false && (
                      <span className={`font-semibold ${colors.text} whitespace-nowrap`}>{product.priceText}</span>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${gridClasses[columns]} gap-6`}>
              {categoryProducts.map((product) => (
                <Card 
                  key={product.id}
                  className={`group cursor-pointer transition-all duration-300 border-2 ${colors.border} ${colors.glow}`}
                  onClick={() => handleProductClick(product)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${colors.bg} ${colors.text} border-0`}>{product.type}</Badge>
                    </div>
                    <CardTitle className={`font-display text-lg transition-colors ${colors.hoverText}`}>
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      {pageSettings.showPrices !== false && (
                        <span className={`font-semibold ${colors.text}`}>{product.priceText}</span>
                      )}
                      <ChevronRight className={`h-5 w-5 text-muted-foreground transition-colors ${colors.hoverText}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {categoryProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">In dieser Kategorie gibt es noch keine Leistungen.</p>
              <Button asChild variant="outline">
                <Link to="/leistungen">Alle Leistungen ansehen</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      {pageSettings.faqItems && pageSettings.faqItems.length > 0 && (
        <section className="py-12 bg-card/50 border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-8 text-center">
              Häufige Fragen zu {category.name}
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {pageSettings.faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {pageSettings.ctaText && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className={`text-center p-8 md:p-12 rounded-2xl ${colors.bg} border ${colors.border}`}>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                {pageSettings.ctaText}
              </h2>
              <Button 
                size="lg" 
                onClick={() => navigate(pageSettings.ctaLink || '/kontakt')}
              >
                Jetzt anfragen
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onInquiry={handleInquiry}
          categories={categories}
        />
      )}
    </Layout>
  );
}