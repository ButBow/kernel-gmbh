import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContent } from "@/contexts/ContentContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { usePageTracking } from "@/hooks/usePageTracking";
import { getCategoryColors } from "@/lib/categoryColors";
import { 
  Video, 
  Cpu, 
  Wrench, 
  Code, 
  Image, 
  FileText,
  Users,
  ChevronRight,
  X,
  Package,
  Star,
  Send
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product, Showcase } from "@/data/initialData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Video, Cpu, Wrench, Code, Image, FileText, Users, Package
};

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onInquiry: (product: Product, showcase?: Showcase) => void;
  categories: { id: string; order?: number; name: string }[];
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

export default function Leistungen() {
  const { categories, products } = useContent();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();
  usePageTracking();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Only show published products, sorted by category order first, then featured within category
  const publishedProducts = products
    .filter(p => p.status === 'published')
    .sort((a, b) => {
      // First sort by category order
      const catA = sortedCategories.find(c => c.id === a.categoryId);
      const catB = sortedCategories.find(c => c.id === b.categoryId);
      const orderA = catA?.order ?? 999;
      const orderB = catB?.order ?? 999;
      
      if (orderA !== orderB) return orderA - orderB;
      
      // Within same category, featured products first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  const featuredProducts = publishedProducts.filter(p => p.featured);

  const filteredProducts = selectedCategory
    ? publishedProducts.filter(p => p.categoryId === selectedCategory)
    : publishedProducts;

  const handleProductClick = (product: Product) => {
    trackEvent('product_click', '/leistungen', { productName: product.name });
    setSelectedProduct(product);
  };

  const handleCategoryClick = (categoryId: string | null, categoryName: string) => {
    trackEvent('category_click', '/leistungen', { categoryName });
    setSelectedCategory(categoryId);
  };

  const handleInquiry = (product: Product, showcase?: Showcase) => {
    trackEvent('product_inquiry', '/leistungen', { 
      productName: product.name,
      packageName: showcase?.title || 'general'
    });
    
    const params = new URLSearchParams();
    params.set('product', product.name);
    params.set('productPrice', product.priceText);
    
    if (showcase) {
      params.set('package', showcase.title);
      params.set('packagePrice', showcase.price);
      params.set('packageDescription', showcase.description);
    }
    
    navigate(`/kontakt?${params.toString()}`);
  };

  const selectedCategoryData = selectedCategory
    ? categories.find(c => c.id === selectedCategory)
    : null;

  return (
    <Layout>
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

      {/* Featured Products - FIRST (before filters) */}
      {!selectedCategory && featuredProducts.length > 0 && (
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
                return (
                  <Card 
                    key={product.id}
                    className={`group cursor-pointer transition-all duration-300 border-2 ${colors.border} ${colors.glow} ring-2 ring-primary/20`}
                    onClick={() => handleProductClick(product)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary text-primary-foreground border-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Beliebt
                        </Badge>
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
                        <span className={`font-semibold ${colors.text}`}>{product.priceText}</span>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-colors ${colors.hoverText}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Categories Filter */}
      <section className="py-8 sm:py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => handleCategoryClick(null, 'Alle')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors touch-target ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Alle
            </button>
            {sortedCategories.map((category, index) => {
              const colors = getCategoryColors(category.id, sortedCategories);
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id, category.name)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? `${colors.solid} text-white`
                      : `${colors.bg} ${colors.text} hover:opacity-80`
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Header (wenn ausgewählt) */}
      {selectedCategoryData && (
        <section className="py-8 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              {(() => {
                const colors = getCategoryColors(selectedCategoryData.id, sortedCategories);
                const IconComponent = iconMap[selectedCategoryData.icon] || Package;
                return (
                  <>
                    <div className={`h-12 w-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <IconComponent className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h2 className={`font-display text-xl font-bold ${colors.text}`}>{selectedCategoryData.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedCategoryData.description}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {!selectedCategory && featuredProducts.length > 0 && (
            <h2 className="font-display text-xl font-semibold mb-6">Alle Leistungen</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const category = categories.find(c => c.id === product.categoryId);
              const colors = getCategoryColors(product.categoryId, sortedCategories);
              return (
                <Card 
                  key={product.id}
                  className={`group cursor-pointer transition-all duration-300 border-2 ${colors.border} ${colors.glow}`}
                  onClick={() => handleProductClick(product)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      {product.featured && (
                        <Badge className="bg-primary/10 text-primary border-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                        </Badge>
                      )}
                      <Badge className={`${colors.bg} ${colors.text} border-0`}>{product.type}</Badge>
                      {category && (
                        <Badge variant="outline" className={`text-xs ${colors.border} ${colors.text}`}>
                          {category.name}
                        </Badge>
                      )}
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
                      <span className={`font-semibold ${colors.text}`}>{product.priceText}</span>
                      <ChevronRight className={`h-5 w-5 text-muted-foreground transition-colors ${colors.hoverText}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onInquiry={handleInquiry}
          categories={sortedCategories}
        />
      )}
    </Layout>
  );
}
