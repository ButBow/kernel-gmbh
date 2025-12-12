import { useState, useMemo, useEffect } from "react";
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
  defaultCollapsed?: boolean;
}

export function PackageSelector({ products, categories, value, onChange, defaultCollapsed = false }: PackageSelectorProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed || !!value);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  // Collapse when value is set externally (e.g., from URL)
  useEffect(() => {
    if (value && defaultCollapsed) {
      setIsCollapsed(true);
    }
  }, [value, defaultCollapsed]);

  // Sort categories by order and filter hidden ones
  const sortedCategories = useMemo(() => 
    [...categories]
      .filter(c => !c.hidden) // Filter out hidden categories
      .sort((a, b) => a.order - b.order),
    [categories]
  );

  // Group products by category (only from visible categories)
  const groupedPackages: GroupedPackages[] = useMemo(() => {
    return sortedCategories
      .map(category => {
        const categoryProducts = products
          .filter(p => p.categoryId === category.id && p.status === 'published')
          .map(product => {
            const packages: PackageOption[] = [];
            
            packages.push({
              value: `${product.name} (${product.priceText})`,
              label: product.name,
              price: product.priceText,
              isPackage: false
            });
            
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

  // Find color for selected value
  const selectedColor = useMemo(() => {
    for (const group of groupedPackages) {
      for (const { packages } of group.products) {
        if (packages.some(pkg => pkg.value === value)) {
          return group.colors;
        }
      }
    }
    return null;
  }, [value, groupedPackages]);

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
    setIsCollapsed(true);
  };

  const clearSelection = () => {
    onChange("");
  };

  const isSelected = (optionValue: string) => value === optionValue;

  // Collapsed view
  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setIsCollapsed(false)}
        className={`w-full border rounded-lg overflow-hidden bg-card text-left transition-colors hover:border-primary/50 ${
          value && selectedColor ? selectedColor.border : 'border-border'
        }`}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            {value ? (
              <div>
                <span className="text-xs text-muted-foreground block">Ausgewähltes Paket</span>
                <span className={`text-sm font-medium ${selectedColor ? selectedColor.text : 'text-foreground'}`}>
                  {value}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Produkt / Paket auswählen</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>
    );
  }

  // Expanded view
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Produkt / Paket auswählen</span>
        </div>
        <div className="flex items-center gap-3">
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Auswahl löschen
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>

      {/* Category Groups */}
      <div className="max-h-[400px] overflow-y-auto">
        {groupedPackages.map(({ category, colors, products: categoryProducts }) => (
          <div key={category.id} className="border-b border-border last:border-b-0">
            {/* Category Header - only text is colored */}
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 py-3 flex items-center justify-between bg-secondary/20 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${colors.solid}`} />
                <span className={`font-medium ${colors.text}`}>{category.name}</span>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {categoryProducts.length}
                </Badge>
              </div>
              {expandedCategories.has(category.id) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                        className={`flex-1 px-2 py-2 text-left flex items-center justify-between rounded-md mr-2 transition-all ${
                          isSelected(packages[0].value) 
                            ? `${colors.bg} ${colors.border} border` 
                            : 'hover:bg-secondary/50'
                        }`}
                      >
                        <span className={`text-sm ${isSelected(packages[0].value) ? 'font-medium text-foreground' : ''}`}>
                          {product.name}
                        </span>
                        <span className={`text-xs ${isSelected(packages[0].value) ? colors.text : 'text-muted-foreground'}`}>
                          {product.priceText}
                        </span>
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
                            className={`w-full px-3 py-2 text-left flex items-center justify-between rounded-md transition-all ${
                              isSelected(pkg.value) 
                                ? `${colors.bg} ${colors.border} border` 
                                : 'bg-secondary/20 hover:bg-secondary/40 border border-transparent'
                            }`}
                          >
                            <span className={`text-sm ${isSelected(pkg.value) ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                              {pkg.label}
                            </span>
                            <span className={`text-xs ${isSelected(pkg.value) ? colors.text : 'text-muted-foreground'}`}>
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