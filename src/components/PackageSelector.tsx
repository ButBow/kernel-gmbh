import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryColors, type CategoryColorSet } from "@/lib/categoryColors";
import type { Product, Category } from "@/data/initialData";

interface PackageOption {
  value: string;
  label: string;
  price: string;
  isPackage?: boolean;
}

interface GroupedPackages {
  category: Category;
  colors: CategoryColorSet;
  products: {
    product: Product;
    packages: PackageOption[];
  }[];
}

interface PackageSelectorProps {
  products: Product[];
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * ============================================================================
 * AI NOTES: GROUPED PACKAGE SELECTOR
 * ============================================================================
 * 
 * This component displays packages grouped by category with expandable sections.
 * - Categories are color-coded using the same colors as Leistungen page
 * - Products within each category can be expanded to show individual packages
 * - Clicking a product selects it with its price range
 * - Clicking a package selects that specific package with its price
 * 
 * Data flow:
 * - products: All published products from ContentContext
 * - categories: All categories from ContentContext
 * - value: Currently selected package string (format: "Product - Package (Price)")
 * - onChange: Callback when selection changes
 * ============================================================================
 */
export function PackageSelector({ products, categories, value, onChange }: PackageSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  // Sort categories by order
  const sortedCategories = useMemo(() => 
    [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  // Group products by category
  const groupedPackages: GroupedPackages[] = useMemo(() => {
    return sortedCategories
      .map(category => {
        const categoryProducts = products
          .filter(p => p.categoryId === category.id && p.status === 'published')
          .map(product => {
            const packages: PackageOption[] = [];
            
            // Add main product option
            packages.push({
              value: `${product.name} (${product.priceText})`,
              label: product.name,
              price: product.priceText,
              isPackage: false
            });
            
            // Add individual showcases/packages
            if (product.showcases && product.showcases.length > 0) {
              product.showcases.forEach(showcase => {
                packages.push({
                  value: `${product.name} - ${showcase.title} (${showcase.price})`,
                  label: showcase.title,
                  price: showcase.price,
                  isPackage: true
                });
              });
            }
            
            return { product, packages };
          });

        return {
          category,
          colors: getCategoryColors(category.id, sortedCategories),
          products: categoryProducts
        };
      })
      .filter(group => group.products.length > 0);
  }, [products, sortedCategories]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleProduct = (productId: number) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
  };

  const clearSelection = () => {
    onChange("");
  };

  // Check if a value is selected
  const isSelected = (optionValue: string) => value === optionValue;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Produkt / Paket auswählen</span>
        </div>
        {value && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Auswahl löschen
          </button>
        )}
      </div>

      {/* Selected Item Display */}
      {value && (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20">
          <p className="text-sm">
            <span className="text-muted-foreground">Ausgewählt: </span>
            <span className="font-medium text-primary">{value}</span>
          </p>
        </div>
      )}

      {/* Category Groups */}
      <div className="max-h-[400px] overflow-y-auto">
        {groupedPackages.map(({ category, colors, products: categoryProducts }) => (
          <div key={category.id} className="border-b border-border last:border-b-0">
            {/* Category Header */}
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`w-full px-4 py-3 flex items-center justify-between ${colors.bg} hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${colors.solid}`} />
                <span className={`font-medium ${colors.text}`}>{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryProducts.length} {categoryProducts.length === 1 ? 'Produkt' : 'Produkte'}
                </Badge>
              </div>
              {expandedCategories.has(category.id) ? (
                <ChevronDown className={`h-4 w-4 ${colors.text}`} />
              ) : (
                <ChevronRight className={`h-4 w-4 ${colors.text}`} />
              )}
            </button>

            {/* Products in Category */}
            {expandedCategories.has(category.id) && (
              <div className="bg-background">
                {categoryProducts.map(({ product, packages }) => (
                  <div key={product.id} className="border-t border-border/50">
                    {/* Product Header */}
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                        className="px-4 py-2 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        {packages.length > 1 ? (
                          expandedProducts.has(product.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )
                        ) : (
                          <div className="w-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelect(packages[0].value)}
                        className={`flex-1 px-2 py-2 text-left flex items-center justify-between hover:bg-secondary/50 rounded transition-colors ${
                          isSelected(packages[0].value) ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className={`text-sm ${isSelected(packages[0].value) ? 'font-medium text-primary' : ''}`}>
                          {product.name}
                        </span>
                        <Badge className={`${colors.bg} ${colors.text} border-0 text-xs`}>
                          {product.priceText}
                        </Badge>
                      </button>
                    </div>

                    {/* Individual Packages */}
                    {expandedProducts.has(product.id) && packages.length > 1 && (
                      <div className="pl-12 pr-4 pb-2 space-y-1">
                        {packages.slice(1).map((pkg, index) => (
                          <button
                            key={`${product.id}-${index}`}
                            type="button"
                            onClick={() => handleSelect(pkg.value)}
                            className={`w-full px-3 py-2 text-left flex items-center justify-between rounded transition-colors ${
                              isSelected(pkg.value) 
                                ? 'bg-primary/10 border border-primary/30' 
                                : 'bg-secondary/30 hover:bg-secondary/50 border border-transparent'
                            }`}
                          >
                            <span className={`text-sm ${isSelected(pkg.value) ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                              {pkg.label}
                            </span>
                            <span className={`text-xs ${isSelected(pkg.value) ? 'text-primary' : 'text-muted-foreground'}`}>
                              {pkg.price}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
