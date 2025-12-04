/**
 * ============================================================================
 * AI NOTES: BACKUP & RESTORE UI COMPONENT
 * ============================================================================
 * 
 * This component provides the user interface for:
 * - Creating full or selective backups
 * - Importing backups with validation preview
 * - Merge or replace modes for import
 * 
 * The actual backup logic is in src/lib/backup.ts
 * ============================================================================
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, Upload, AlertCircle, CheckCircle2, 
  FileJson, Database, Palette, BarChart3,
  FileText, FolderOpen, Package, ShoppingBag,
  AlertTriangle, Info
} from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { toast } from 'sonner';
import {
  BackupOptions,
  ValidationResult,
  createFullBackup,
  validateBackup,
  importBackup,
  downloadBackup,
  parseBackupFile,
  BACKUP_VERSION,
  SCHEMA_VERSION,
} from '@/lib/backup';
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

export function BackupRestore() {
  const { categories, products, projects, posts, settings, importCategories, importProducts, importProjects, importPosts, updateSettings } = useContent();
  const { themeConfig, importThemes } = useTheme();
  const { events: analyticsEvents, importAnalytics } = useAnalytics();

  // Export options
  const [exportOptions, setExportOptions] = useState<BackupOptions>({
    includeCategories: true,
    includeProducts: true,
    includeProjects: true,
    includePosts: true,
    includeSettings: true,
    includeThemes: true,
    includeAnalytics: false,
  });

  // Import state
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [importValidation, setImportValidation] = useState<ValidationResult | null>(null);
  const [importData, setImportData] = useState<unknown>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle export
  const handleExport = () => {
    const backup = createFullBackup(
      {
        categories,
        products,
        projects,
        posts,
        settings,
        themeConfig,
        analyticsEvents,
      },
      exportOptions
    );
    downloadBackup(backup);
    toast.success('Backup erstellt und heruntergeladen');
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseBackupFile(file);
      const validation = validateBackup(data);
      setImportValidation(validation);
      setImportData(data);
    } catch (error) {
      toast.error('Fehler beim Lesen der Datei');
      setImportValidation(null);
      setImportData(null);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle import confirmation
  const handleImport = () => {
    if (!importData || !importValidation?.valid) return;

    const result = importBackup(importData);
    if (!result.success || !result.data) {
      toast.error(result.error || 'Import fehlgeschlagen');
      return;
    }

    const data = result.data;
    const mode = importMode === 'merge' ? 'add' : 'replace';

    // Import all data
    if (data.categories?.length) {
      importCategories(data.categories, mode);
    }
    if (data.products?.length) {
      importProducts(data.products, mode);
    }
    if (data.projects?.length) {
      importProjects(data.projects, mode);
    }
    if (data.posts?.length) {
      importPosts(data.posts, mode);
    }
    if (data.settings && importMode === 'replace') {
      updateSettings(data.settings);
    }
    if (data.themes) {
      importThemes(data.themes, importMode);
    }
    if (data.analytics?.events?.length) {
      importAnalytics(data.analytics.events, importMode);
    }

    // Show success message
    const migrationNote = result.migrated 
      ? ` (migriert von v${result.fromVersion} auf v${result.toVersion})`
      : '';
    toast.success(`Backup erfolgreich importiert${migrationNote}`);

    // Reset state
    setImportValidation(null);
    setImportData(null);
    setShowConfirmDialog(false);
  };

  // Calculate counts
  const counts = {
    categories: categories.length,
    products: products.length,
    projects: projects.length,
    posts: posts.length,
    customThemes: themeConfig.customThemes.length,
    analyticsEvents: analyticsEvents.length,
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Backup erstellen
          </CardTitle>
          <CardDescription>
            Erstelle eine Sicherung aller Daten als JSON-Datei
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
              <Checkbox
                checked={exportOptions.includeCategories}
                onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeCategories: !!checked })}
              />
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Kategorien ({counts.categories})</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
              <Checkbox
                checked={exportOptions.includeProducts}
                onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeProducts: !!checked })}
              />
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Produkte ({counts.products})</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
              <Checkbox
                checked={exportOptions.includeProjects}
                onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeProjects: !!checked })}
              />
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Projekte ({counts.projects})</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
              <Checkbox
                checked={exportOptions.includePosts}
                onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includePosts: !!checked })}
              />
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Blog-Posts ({counts.posts})</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
              <Checkbox
                checked={exportOptions.includeSettings}
                onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeSettings: !!checked })}
              />
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Einstellungen</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
              <Checkbox
                checked={exportOptions.includeThemes}
                onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeThemes: !!checked })}
              />
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Themes ({counts.customThemes})</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer col-span-2 md:col-span-1">
              <Checkbox
                checked={exportOptions.includeAnalytics}
                onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeAnalytics: !!checked })}
              />
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Analytics ({counts.analyticsEvents})</span>
            </label>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span>Version: {BACKUP_VERSION}</span>
              <span className="mx-2">•</span>
              <span>Schema: v{SCHEMA_VERSION}</span>
            </div>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Backup herunterladen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Backup wiederherstellen
          </CardTitle>
          <CardDescription>
            Importiere eine zuvor erstellte Backup-Datei
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import mode selection */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="w-4 h-4"
              />
              <span className="text-sm">Ersetzen (überschreibt alles)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
                className="w-4 h-4"
              />
              <span className="text-sm">Zusammenführen (behält bestehende)</span>
            </label>
          </div>

          {/* File input */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <FileJson className="h-4 w-4" />
              Backup-Datei auswählen
            </Button>
          </div>

          {/* Validation result */}
          {importValidation && (
            <div className="space-y-3">
              {importValidation.valid ? (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Backup ist gültig und kann importiert werden
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {importValidation.errors.join('; ')}
                  </AlertDescription>
                </Alert>
              )}

              {importValidation.warnings.length > 0 && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    {importValidation.warnings.join('; ')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Summary */}
              {importValidation.summary && (
                <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Info className="h-4 w-4" />
                    Backup-Inhalt:
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Badge variant="secondary" className="justify-center">
                      {importValidation.summary.categories} Kategorien
                    </Badge>
                    <Badge variant="secondary" className="justify-center">
                      {importValidation.summary.products} Produkte
                    </Badge>
                    <Badge variant="secondary" className="justify-center">
                      {importValidation.summary.projects} Projekte
                    </Badge>
                    <Badge variant="secondary" className="justify-center">
                      {importValidation.summary.posts} Posts
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {importValidation.summary.hasSettings && <span>✓ Einstellungen</span>}
                    {importValidation.summary.hasThemes && <span>✓ Themes</span>}
                    {importValidation.summary.hasAnalytics && <span>✓ Analytics</span>}
                  </div>
                  {importValidation.meta && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Erstellt: {new Date(importValidation.meta.exportedAt).toLocaleString('de-CH')}
                      {importValidation.meta.schemaVersion < SCHEMA_VERSION && (
                        <span className="ml-2 text-yellow-600">
                          (wird migriert: v{importValidation.meta.schemaVersion} → v{SCHEMA_VERSION})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Import button */}
              {importValidation.valid && (
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  className="w-full gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Backup importieren
                </Button>
              )}
            </div>
          )}

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erstelle vor dem Import ein Backup deiner aktuellen Daten!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Backup importieren?</AlertDialogTitle>
            <AlertDialogDescription>
              {importMode === 'replace' ? (
                <>
                  Alle bestehenden Daten werden <strong>überschrieben</strong>. 
                  Dieser Vorgang kann nicht rückgängig gemacht werden.
                </>
              ) : (
                <>
                  Die Backup-Daten werden mit den bestehenden Daten <strong>zusammengeführt</strong>.
                  Bestehende Einträge bleiben erhalten.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              Importieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
