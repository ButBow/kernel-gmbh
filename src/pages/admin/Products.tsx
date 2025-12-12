import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { LivePreview } from '@/components/admin/LivePreview';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, ChevronRight, ArrowUpDown, ChevronUp, ChevronDown, Settings2, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ImportExport } from '@/components/admin/ImportExport';
import { CategoryPageEditor } from '@/components/admin/CategoryPageEditor';
import type { Category, Product, Showcase, CategoryPageSettings } from '@/data/initialData';

export default function AdminProducts() {
  const { categories, products, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct, reorderProducts } = useContent();
  const scrollPositionRef = useRef<number>(0);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [pageEditorCategory, setPageEditorCategory] = useState<Category | null>(null);
  const [pageEditorOpen, setPageEditorOpen] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'Package',
    slug: ''
  });

  const [productForm, setProductForm] = useState<Omit<Product, 'id'> & { image?: string }>({
    categoryId: '',
    name: '',
    type: 'Service',
    shortDescription: '',
    description: '',
    priceText: '',
    showcases: [],
    targetAudience: [],
    status: 'draft',
    image: ''
  });

  const [showcaseForm, setShowcaseForm] = useState<Showcase>({
    title: '',
    description: '',
    price: ''
  });

  const [audienceInput, setAudienceInput] = useState('');

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', icon: 'Package', slug: '' });
    setEditingCategory(null);
  };

  const resetProductForm = () => {
    setProductForm({
      categoryId: categories[0]?.id || '',
      name: '',
      type: 'Service',
      shortDescription: '',
      description: '',
      priceText: '',
      showcases: [],
      targetAudience: [],
      status: 'draft',
      image: ''
    });
    setEditingProduct(null);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name) return;
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
    } else {
      addCategory(categoryForm);
    }
    setCategoryDialogOpen(false);
    resetCategoryForm();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      slug: category.slug || ''
    });
    setCategoryDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.categoryId) return;
    scrollPositionRef.current = window.scrollY;
    if (editingProduct) {
      updateProduct(editingProduct.id, productForm);
    } else {
      addProduct(productForm);
    }
    setProductDialogOpen(false);
    resetProductForm();
    // Restore scroll position after React re-render
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      scrollPositionRef.current = window.scrollY;
      setProductDialogOpen(false);
      resetProductForm();
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
      });
    } else {
      setProductDialogOpen(true);
    }
  };

  const moveProduct = (categoryId: string, productId: number, direction: 'up' | 'down') => {
    scrollPositionRef.current = window.scrollY;
    const categoryProducts = products.filter(p => p.categoryId === categoryId);
    const otherProducts = products.filter(p => p.categoryId !== categoryId);
    const currentIndex = categoryProducts.findIndex(p => p.id === productId);
    
    if (direction === 'up' && currentIndex > 0) {
      [categoryProducts[currentIndex], categoryProducts[currentIndex - 1]] = 
      [categoryProducts[currentIndex - 1], categoryProducts[currentIndex]];
    } else if (direction === 'down' && currentIndex < categoryProducts.length - 1) {
      [categoryProducts[currentIndex], categoryProducts[currentIndex + 1]] = 
      [categoryProducts[currentIndex + 1], categoryProducts[currentIndex]];
    }
    
    reorderProducts([...otherProducts, ...categoryProducts]);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      categoryId: product.categoryId,
      name: product.name,
      type: product.type,
      shortDescription: product.shortDescription,
      description: product.description,
      priceText: product.priceText,
      showcases: [...product.showcases],
      targetAudience: [...product.targetAudience],
      status: product.status,
      image: (product as Product & { image?: string }).image || ''
    });
    setProductDialogOpen(true);
  };

  const addShowcase = () => {
    if (!showcaseForm.title) return;
    setProductForm({
      ...productForm,
      showcases: [...productForm.showcases, { ...showcaseForm }]
    });
    setShowcaseForm({ title: '', description: '', price: '' });
  };

  const removeShowcase = (index: number) => {
    setProductForm({
      ...productForm,
      showcases: productForm.showcases.filter((_, i) => i !== index)
    });
  };

  const addAudience = () => {
    if (!audienceInput.trim()) return;
    setProductForm({
      ...productForm,
      targetAudience: [...productForm.targetAudience, audienceInput.trim()]
    });
    setAudienceInput('');
  };

  const removeAudience = (index: number) => {
    setProductForm({
      ...productForm,
      targetAudience: productForm.targetAudience.filter((_, i) => i !== index)
    });
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const handleEditCategoryPage = (category: Category) => {
    setPageEditorCategory(category);
    setPageEditorOpen(true);
  };

  const handleSaveCategoryPage = (settings: CategoryPageSettings) => {
    if (pageEditorCategory) {
      updateCategory(pageEditorCategory.id, { pageSettings: settings });
    }
    setPageEditorOpen(false);
    setPageEditorCategory(null);
  };

  return (
    <AdminLayout title="Produkte & Services">
      <Tabs defaultValue="products">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-6">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto">
            <TabsTrigger value="products" className="text-xs sm:text-sm">Produkte ({products.length})</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Kategorien ({categories.length})</TabsTrigger>
            <TabsTrigger value="import-export" className="text-xs sm:text-sm">
              <ArrowUpDown className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
              Import/Export
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="products">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-muted-foreground">
              Verwalten Sie Ihre Produkte und Services
            </p>
            <Dialog open={productDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Produkt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt erstellen'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {/* Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Kategorie</label>
                        <Select
                          value={productForm.categoryId}
                          onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategorie wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Typ</label>
                        <Select
                          value={productForm.type}
                          onValueChange={(value) => setProductForm({ ...productForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['Service', 'Paket', 'Beratung', 'Retainer', 'Tool', 'Workshop'].map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="Produktname"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Kurzbeschreibung</label>
                      <Input
                        value={productForm.shortDescription}
                        onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                        placeholder="Kurze Beschreibung für Übersichten"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Ausführliche Beschreibung</label>
                      <Textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        placeholder="Detaillierte Produktbeschreibung"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Preis</label>
                      <Input
                        value={productForm.priceText}
                        onChange={(e) => setProductForm({ ...productForm, priceText: e.target.value })}
                        placeholder="z.B. CHF 120–350 oder ab CHF 500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Zielgruppe</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={audienceInput}
                          onChange={(e) => setAudienceInput(e.target.value)}
                          placeholder="z.B. KMU"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAudience())}
                        />
                        <Button type="button" variant="outline" onClick={addAudience}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {productForm.targetAudience.map((audience, i) => (
                          <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeAudience(i)}>
                            {audience} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Pakete / Showcases</label>
                      <div className="space-y-2 mb-2">
                        {productForm.showcases.map((showcase, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{showcase.title}</p>
                              <p className="text-xs text-muted-foreground">{showcase.description}</p>
                              <p className="text-xs text-primary">{showcase.price}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeShowcase(i)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border border-dashed rounded-lg space-y-2">
                        <Input
                          value={showcaseForm.title}
                          onChange={(e) => setShowcaseForm({ ...showcaseForm, title: e.target.value })}
                          placeholder="Paket-Titel (z.B. Basic)"
                        />
                        <Input
                          value={showcaseForm.description}
                          onChange={(e) => setShowcaseForm({ ...showcaseForm, description: e.target.value })}
                          placeholder="Beschreibung"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={showcaseForm.price}
                            onChange={(e) => setShowcaseForm({ ...showcaseForm, price: e.target.value })}
                            placeholder="Preis"
                          />
                          <Button type="button" variant="outline" onClick={addShowcase}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={productForm.status}
                        onValueChange={(value: 'draft' | 'published') => setProductForm({ ...productForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Entwurf</SelectItem>
                          <SelectItem value="published">Veröffentlicht</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Preview */}
                  <LivePreview title="Produkt-Vorschau">
                    <div className="p-4 bg-background">
                      <div className="rounded-lg border border-border p-4">
                        <div className="flex gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-secondary rounded text-xs text-muted-foreground">
                            {productForm.type || 'Typ'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {productForm.name || 'Produktname'}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {productForm.shortDescription || 'Kurzbeschreibung...'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-semibold text-sm">
                            {productForm.priceText || 'Preis'}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {productForm.showcases.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs text-muted-foreground">Pakete:</p>
                          {productForm.showcases.map((s, i) => (
                            <div key={i} className="p-2 bg-secondary rounded text-xs">
                              <div className="flex justify-between">
                                <span className="text-foreground">{s.title}</span>
                                <span className="text-primary">{s.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </LivePreview>
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                  <Button variant="outline" onClick={() => handleDialogClose(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveProduct}>
                    {editingProduct ? 'Speichern' : 'Erstellen'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {sortedCategories.map((category) => {
              const categoryProducts = products.filter(p => p.categoryId === category.id);
              if (categoryProducts.length === 0) return null;
              
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categoryProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                                onClick={() => moveProduct(category.id, product.id, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                                onClick={() => moveProduct(category.id, product.id, 'down')}
                                disabled={index === categoryProducts.length - 1}
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{product.name}</span>
                                <Badge variant={product.status === 'published' ? 'default' : 'outline'}>
                                  {product.status === 'published' ? 'Live' : 'Entwurf'}
                                </Badge>
                                <Badge variant="secondary">{product.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{product.priceText}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Produkt wirklich löschen?')) {
                                  deleteProduct(product.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              Kategorien für Ihre Produkte und Services
            </p>
            <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
              setCategoryDialogOpen(open);
              if (!open) resetCategoryForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Kategorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie erstellen'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="Kategoriename"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Beschreibung</label>
                    <Textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Kurze Beschreibung"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Icon</label>
                    <Select
                      value={categoryForm.icon}
                      onValueChange={(value) => setCategoryForm({ ...categoryForm, icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Video', 'Cpu', 'Wrench', 'Code', 'Image', 'FileText', 'Users', 'Package'].map((icon) => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleSaveCategory}>
                      {editingCategory ? 'Speichern' : 'Erstellen'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {sortedCategories.map((category) => {
              const productCount = products.filter(p => p.categoryId === category.id).length;
              const isActive = !category.hidden;
              return (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-4 rounded-lg bg-card border border-border transition-opacity ${category.hidden ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => updateCategory(category.id, { hidden: !checked })}
                        aria-label={isActive ? 'Kategorie deaktivieren' : 'Kategorie aktivieren'}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{category.name}</p>
                          {category.hidden && (
                            <Badge variant="outline" className="text-xs">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Ausgeblendet
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{productCount} Produkte</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditCategoryPage(category)}
                      className="text-primary"
                    >
                      <Settings2 className="h-4 w-4 mr-1" />
                      Seite
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Kategorie wirklich löschen?')) {
                          deleteCategory(category.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="import-export">
          <ImportExport />
        </TabsContent>
      </Tabs>

      {/* Category Page Editor Dialog */}
      {pageEditorOpen && pageEditorCategory && (
        <Dialog open={pageEditorOpen} onOpenChange={(open) => {
          if (!open) {
            setPageEditorOpen(false);
            setPageEditorCategory(null);
          }
        }}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Seite bearbeiten: {pageEditorCategory.name}</DialogTitle>
            </DialogHeader>
            <CategoryPageEditor
              category={pageEditorCategory}
              onSave={handleSaveCategoryPage}
              onClose={() => {
                setPageEditorOpen(false);
                setPageEditorCategory(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
