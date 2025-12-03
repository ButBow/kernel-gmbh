import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContent } from "@/contexts/ContentContext";
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
  Package
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/initialData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Video, Cpu, Wrench, Code, Image, FileText, Users, Package
};

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

function ProductDetail({ product, onClose }: ProductDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-xl border border-border shadow-card animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Schliessen"
        >
          <X size={20} />
        </button>
        
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{product.type}</Badge>
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
            <span className="text-2xl font-bold text-primary">{product.priceText}</span>
          </div>
          
          {product.showcases && product.showcases.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display font-semibold mb-4">Pakete & Varianten</h3>
              <div className="space-y-4">
                {product.showcases.map((showcase, index) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{showcase.title}</h4>
                      <span className="text-primary font-semibold">{showcase.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{showcase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <Link to="/kontakt">Anfragen</Link>
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Only show published products
  const publishedProducts = products.filter(p => p.status === 'published');

  const filteredProducts = selectedCategory
    ? publishedProducts.filter(p => p.categoryId === selectedCategory)
    : publishedProducts;

  const selectedCategoryData = selectedCategory
    ? categories.find(c => c.id === selectedCategory)
    : null;

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

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

      {/* Categories */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Alle
            </button>
            {sortedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Header (wenn ausgewählt) */}
      {selectedCategoryData && (
        <section className="py-8 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                {(() => {
                  const IconComponent = iconMap[selectedCategoryData.icon] || Package;
                  return <IconComponent className="h-6 w-6 text-primary" />;
                })()}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">{selectedCategoryData.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedCategoryData.description}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const category = categories.find(c => c.id === product.categoryId);
              return (
                <Card 
                  key={product.id}
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
                  onClick={() => setSelectedProduct(product)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{product.type}</Badge>
                      {category && (
                        <Badge variant="outline" className="text-xs">
                          {category.name}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-display text-lg group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">{product.priceText}</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
        />
      )}
    </Layout>
  );
}
