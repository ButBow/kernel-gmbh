import { useState, useRef } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Upload, FileJson, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Category, Product } from '@/data/initialData';

type ImportMode = 'add' | 'replace';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: Category[] | Product[] | null;
}

const AVAILABLE_ICONS = ['Video', 'Cpu', 'Wrench', 'Code', 'Image', 'FileText', 'Users', 'Package', 'Briefcase', 'Globe', 'Palette'];
const AVAILABLE_TYPES = ['Service', 'Paket', 'Beratung', 'Retainer', 'Tool', 'Workshop'];
const AVAILABLE_STATUS = ['draft', 'published'];

export function ImportExport() {
  const { categories, products, importCategories, importProducts } = useContent();
  const [importMode, setImportMode] = useState<ImportMode>('add');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ type: 'categories' | 'products'; data: any[] } | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);
  const productFileRef = useRef<HTMLInputElement>(null);

  // Generate dynamic category template
  const generateCategoryTemplate = () => {
    return {
      _instructions: {
        description: "Dieses Template zeigt das Format für Kategorien. Ersetzen Sie die Beispiele mit Ihren eigenen Daten.",
        availableIcons: AVAILABLE_ICONS,
        requiredFields: ["name", "description", "icon"]
      },
      categories: [
        {
          name: "Beispiel-Kategorie",
          description: "Beschreibung der Kategorie",
          icon: "Package"
        }
      ]
    };
  };

  // Generate dynamic product template with current categories
  const generateProductTemplate = () => {
    const availableCategories = categories.map(c => ({ id: c.id, name: c.name }));
    
    return {
      _instructions: {
        description: "Dieses Template zeigt das Format für Produkte. Die categoryId muss einer existierenden Kategorie entsprechen.",
        availableCategories: availableCategories,
        availableTypes: AVAILABLE_TYPES,
        availableStatus: AVAILABLE_STATUS,
        requiredFields: ["categoryId", "name", "type", "shortDescription", "description", "priceText"],
        optionalFields: ["showcases", "targetAudience", "status"]
      },
      products: [
        {
          categoryId: availableCategories[0]?.id || "category_id_hier",
          name: "Beispiel-Produkt",
          type: "Service",
          shortDescription: "Kurze Beschreibung für Übersichten",
          description: "Ausführliche Beschreibung des Produkts oder Services",
          priceText: "CHF 100-200",
          showcases: [
            { title: "Basic", description: "Enthält X, Y, Z", price: "CHF 100" },
            { title: "Premium", description: "Enthält alles von Basic plus A, B, C", price: "CHF 200" }
          ],
          targetAudience: ["KMU", "Startups", "Creators"],
          status: "draft"
        }
      ]
    };
  };

  // Download helper
  const downloadJSON = (data: object, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Validate categories
  const validateCategories = (data: any): ValidationResult => {
    const errors: string[] = [];
    
    if (!data.categories || !Array.isArray(data.categories)) {
      return { valid: false, errors: ['JSON muss ein "categories" Array enthalten'], data: null };
    }

    const validCategories: Category[] = [];
    
    data.categories.forEach((cat: any, index: number) => {
      const entryErrors: string[] = [];
      
      if (!cat.name || typeof cat.name !== 'string') {
        entryErrors.push(`name fehlt oder ungültig`);
      }
      if (!cat.description || typeof cat.description !== 'string') {
        entryErrors.push(`description fehlt oder ungültig`);
      }
      if (!cat.icon || !AVAILABLE_ICONS.includes(cat.icon)) {
        entryErrors.push(`icon fehlt oder ungültig (verfügbar: ${AVAILABLE_ICONS.join(', ')})`);
      }

      if (entryErrors.length > 0) {
        errors.push(`Eintrag ${index + 1}: ${entryErrors.join(', ')}`);
      } else {
        validCategories.push({
          id: cat.id || `cat_${Date.now()}_${index}`,
          name: cat.name,
          slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: cat.description,
          icon: cat.icon,
          order: cat.order || index + 1
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      data: validCategories.length > 0 ? validCategories : null
    };
  };

  // Validate products
  const validateProducts = (data: any, existingCategories: Category[]): ValidationResult => {
    const errors: string[] = [];
    
    if (!data.products || !Array.isArray(data.products)) {
      return { valid: false, errors: ['JSON muss ein "products" Array enthalten'], data: null };
    }

    const categoryIds = existingCategories.map(c => c.id);
    const validProducts: Product[] = [];
    
    data.products.forEach((prod: any, index: number) => {
      const entryErrors: string[] = [];
      
      if (!prod.categoryId || !categoryIds.includes(prod.categoryId)) {
        entryErrors.push(`categoryId ungültig (verfügbar: ${categoryIds.join(', ')})`);
      }
      if (!prod.name || typeof prod.name !== 'string') {
        entryErrors.push(`name fehlt`);
      }
      if (!prod.type || !AVAILABLE_TYPES.includes(prod.type)) {
        entryErrors.push(`type ungültig (verfügbar: ${AVAILABLE_TYPES.join(', ')})`);
      }
      if (!prod.shortDescription) {
        entryErrors.push(`shortDescription fehlt`);
      }
      if (!prod.description) {
        entryErrors.push(`description fehlt`);
      }
      if (!prod.priceText) {
        entryErrors.push(`priceText fehlt`);
      }

      if (entryErrors.length > 0) {
        errors.push(`Produkt "${prod.name || index + 1}": ${entryErrors.join(', ')}`);
      } else {
        validProducts.push({
          id: prod.id || Date.now() + index,
          categoryId: prod.categoryId,
          name: prod.name,
          type: prod.type,
          shortDescription: prod.shortDescription,
          description: prod.description,
          priceText: prod.priceText,
          showcases: Array.isArray(prod.showcases) ? prod.showcases : [],
          targetAudience: Array.isArray(prod.targetAudience) ? prod.targetAudience : [],
          status: AVAILABLE_STATUS.includes(prod.status) ? prod.status : 'draft'
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      data: validProducts.length > 0 ? validProducts : null
    };
  };

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'categories' | 'products') => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const result = type === 'categories' 
        ? validateCategories(data)
        : validateProducts(data, categories);
      
      setValidationResult(result);
      
      if (result.data && result.data.length > 0) {
        setPendingImport({ type, data: result.data });
        
        if (importMode === 'replace') {
          setShowConfirmDialog(true);
        } else {
          executeImport(type, result.data);
        }
      } else if (result.errors.length > 0) {
        toast({
          title: "Validierungsfehler",
          description: result.errors.slice(0, 3).join('\n'),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Fehler beim Lesen der Datei",
        description: "Die Datei ist kein gültiges JSON.",
        variant: "destructive"
      });
    }
  };

  // Execute import
  const executeImport = (type: 'categories' | 'products', data: any[]) => {
    if (type === 'categories') {
      importCategories(data as Category[], importMode);
      toast({
        title: "Kategorien importiert",
        description: `${data.length} Kategorie(n) erfolgreich ${importMode === 'add' ? 'hinzugefügt' : 'ersetzt'}.`
      });
    } else {
      importProducts(data as Product[], importMode);
      toast({
        title: "Produkte importiert",
        description: `${data.length} Produkt(e) erfolgreich ${importMode === 'add' ? 'hinzugefügt' : 'ersetzt'}.`
      });
    }
    
    setValidationResult(null);
    setPendingImport(null);
  };

  const handleConfirmReplace = () => {
    if (pendingImport) {
      executeImport(pendingImport.type, pendingImport.data);
    }
    setShowConfirmDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Templates Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Download className="h-5 w-5" />
            Templates herunterladen
          </CardTitle>
          <CardDescription>
            Laden Sie die JSON-Templates herunter, um Daten mit AI zu generieren oder manuell zu bearbeiten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => downloadJSON(generateCategoryTemplate(), 'kategorien-template.json')}
            >
              <FileJson className="h-4 w-4 mr-2" />
              Kategorien-Template
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => downloadJSON(generateProductTemplate(), 'produkte-template.json')}
            >
              <FileJson className="h-4 w-4 mr-2" />
              Produkte-Template
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Das Produkte-Template enthält automatisch alle aktuellen Kategorien ({categories.length} verfügbar).
          </p>
        </CardContent>
      </Card>

      {/* Import Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Upload className="h-5 w-5" />
            Daten importieren
          </CardTitle>
          <CardDescription>
            Importieren Sie Kategorien oder Produkte aus JSON-Dateien.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import Mode */}
          <div className="space-y-3">
            <Label>Import-Modus</Label>
            <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as ImportMode)}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="add" id="add" />
                <div className="grid gap-0.5">
                  <Label htmlFor="add" className="font-normal cursor-pointer">
                    Hinzufügen
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Neue Einträge werden zu bestehenden hinzugefügt
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <div className="grid gap-0.5">
                  <Label htmlFor="replace" className="font-normal cursor-pointer">
                    Ersetzen (Inventur)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Alle bestehenden Daten werden gelöscht und ersetzt
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Upload Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                ref={categoryFileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'categories');
                  e.target.value = '';
                }}
              />
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => categoryFileRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Kategorien importieren
              </Button>
            </div>
            <div>
              <input
                ref={productFileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'products');
                  e.target.value = '';
                }}
              />
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => productFileRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Produkte importieren
              </Button>
            </div>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`p-3 rounded-lg border ${validationResult.valid ? 'border-green-500/20 bg-green-500/10' : 'border-destructive/20 bg-destructive/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                {validationResult.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="font-medium text-sm">
                  {validationResult.valid ? 'Validierung erfolgreich' : 'Validierungsfehler'}
                </span>
              </div>
              {validationResult.errors.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {validationResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                  {validationResult.errors.length > 5 && (
                    <li>... und {validationResult.errors.length - 5} weitere Fehler</li>
                  )}
                </ul>
              )}
            </div>
          )}

          {importMode === 'replace' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Im Ersetzen-Modus werden alle bestehenden Daten gelöscht, bevor die neuen importiert werden.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Current Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Download className="h-5 w-5" />
            Aktuelle Daten exportieren
          </CardTitle>
          <CardDescription>
            Exportieren Sie Ihre aktuellen Kategorien und Produkte als Backup oder zur Bearbeitung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => downloadJSON({ categories }, `kategorien-export-${new Date().toISOString().split('T')[0]}.json`)}
            >
              <Download className="h-4 w-4 mr-2" />
              Kategorien ({categories.length})
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => downloadJSON({ products }, `produkte-export-${new Date().toISOString().split('T')[0]}.json`)}
            >
              <Download className="h-4 w-4 mr-2" />
              Produkte ({products.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Replace Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Daten ersetzen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingImport?.type === 'categories' ? (
                <>
                  Alle <strong>{categories.length}</strong> bestehenden Kategorien werden gelöscht und durch <strong>{pendingImport.data.length}</strong> neue ersetzt.
                  <br /><br />
                  <span className="text-destructive">Achtung: Wenn Produkte den gelöschten Kategorien zugeordnet sind, werden diese ungültig!</span>
                </>
              ) : (
                <>
                  Alle <strong>{products.length}</strong> bestehenden Produkte werden gelöscht und durch <strong>{pendingImport?.data.length}</strong> neue ersetzt.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImport(null)}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReplace} className="bg-destructive hover:bg-destructive/90">
              Ja, ersetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
