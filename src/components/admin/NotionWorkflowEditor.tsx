import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Database, 
  Plus, 
  Trash2, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  GripVertical,
  ArrowRight,
  Settings2,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NotionWorkflowConfig,
  NotionDatabase,
  FieldMapping,
  INQUIRY_FIELDS,
  defaultNotionWorkflowConfig,
  getDefaultNotionPropertyName,
  getNotionTypeForField,
} from '@/types/notionWorkflow';

interface NotionWorkflowEditorProps {
  config: NotionWorkflowConfig;
  onChange: (config: NotionWorkflowConfig) => void;
  apiBaseUrl?: string;
  // Legacy settings for migration
  legacyApiKey?: string;
  legacyDatabaseId?: string;
  legacyEnabled?: boolean;
}

export function NotionWorkflowEditor({ 
  config, 
  onChange, 
  apiBaseUrl = '',
  legacyApiKey,
  legacyDatabaseId,
  legacyEnabled
}: NotionWorkflowEditorProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; error?: string; databaseTitle?: string }>>({});
  const [editingDatabase, setEditingDatabase] = useState<NotionDatabase | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDatabase, setNewDatabase] = useState<Partial<NotionDatabase>>({
    name: '',
    databaseId: '',
    fieldMappings: [],
    enabled: true,
  });

  // Auto-migrate legacy settings if workflow is empty but legacy is configured
  useEffect(() => {
    if (
      legacyApiKey && 
      legacyDatabaseId && 
      !config.apiKey && 
      config.databases.length === 0
    ) {
      const migratedDatabase: NotionDatabase = {
        id: `db_${Date.now()}`,
        name: 'Hauptdatenbank',
        databaseId: legacyDatabaseId,
        fieldMappings: INQUIRY_FIELDS.map(field => ({
          inquiryField: field.id,
          notionProperty: field.label,
          notionType: field.notionType,
        })),
        enabled: true,
      };

      onChange({
        apiKey: legacyApiKey,
        databases: [migratedDatabase],
        enabled: legacyEnabled ?? true,
      });

      toast.success('Bestehende Notion-Konfiguration wurde migriert');
    }
  }, [legacyApiKey, legacyDatabaseId, legacyEnabled, config.apiKey, config.databases.length, onChange]);

  // Initialize with default mappings for new database
  const getDefaultMappings = (): FieldMapping[] => {
    return INQUIRY_FIELDS.map(field => ({
      inquiryField: field.id,
      notionProperty: field.label,
      notionType: field.notionType,
    }));
  };

  const handleAddDatabase = () => {
    if (!newDatabase.name || !newDatabase.databaseId) {
      toast.error('Name und Database ID sind erforderlich');
      return;
    }

    const database: NotionDatabase = {
      id: `db_${Date.now()}`,
      name: newDatabase.name,
      databaseId: newDatabase.databaseId,
      fieldMappings: getDefaultMappings(),
      enabled: true,
    };

    onChange({
      ...config,
      databases: [...config.databases, database],
    });

    setNewDatabase({ name: '', databaseId: '', fieldMappings: [], enabled: true });
    setShowAddDialog(false);
    toast.success('Datenbank hinzugefügt');
  };

  const handleRemoveDatabase = (dbId: string) => {
    onChange({
      ...config,
      databases: config.databases.filter(db => db.id !== dbId),
    });
    setTestResults(prev => {
      const { [dbId]: _, ...rest } = prev;
      return rest;
    });
    toast.success('Datenbank entfernt');
  };

  const handleUpdateDatabase = (dbId: string, updates: Partial<NotionDatabase>) => {
    onChange({
      ...config,
      databases: config.databases.map(db =>
        db.id === dbId ? { ...db, ...updates } : db
      ),
    });
  };

  const handleToggleField = (dbId: string, fieldId: string) => {
    const database = config.databases.find(db => db.id === dbId);
    if (!database) return;

    const existingMapping = database.fieldMappings.find(m => m.inquiryField === fieldId);
    
    let newMappings: FieldMapping[];
    if (existingMapping) {
      // Remove the field
      newMappings = database.fieldMappings.filter(m => m.inquiryField !== fieldId);
    } else {
      // Add the field with default mapping
      const field = INQUIRY_FIELDS.find(f => f.id === fieldId);
      if (!field) return;
      newMappings = [
        ...database.fieldMappings,
        {
          inquiryField: fieldId,
          notionProperty: field.label,
          notionType: field.notionType,
        },
      ];
    }

    handleUpdateDatabase(dbId, { fieldMappings: newMappings });
  };

  const handleUpdatePropertyName = (dbId: string, fieldId: string, notionProperty: string) => {
    const database = config.databases.find(db => db.id === dbId);
    if (!database) return;

    const newMappings = database.fieldMappings.map(m =>
      m.inquiryField === fieldId ? { ...m, notionProperty } : m
    );

    handleUpdateDatabase(dbId, { fieldMappings: newMappings });
  };

  const testConnection = async (database: NotionDatabase) => {
    if (!config.apiKey) {
      toast.error('API Key erforderlich');
      return;
    }

    setTesting(database.id);
    try {
      const baseUrl = apiBaseUrl?.replace(/\/$/, '') || '';
      const response = await fetch(`${baseUrl}/api/notion/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseId: database.databaseId,
          apiKey: config.apiKey,
        }),
      });
      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        [database.id]: result,
      }));
      if (result.success) {
        toast.success(`Verbindung zu "${database.name}" erfolgreich!`);
      } else {
        toast.error(result.error || 'Verbindung fehlgeschlagen');
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [database.id]: { success: false, error: 'Server nicht erreichbar' },
      }));
      toast.error('Server nicht erreichbar');
    }
    setTesting(null);
  };

  const isFieldEnabled = (database: NotionDatabase, fieldId: string): boolean => {
    return database.fieldMappings.some(m => m.inquiryField === fieldId);
  };

  const getFieldMapping = (database: NotionDatabase, fieldId: string): FieldMapping | undefined => {
    return database.fieldMappings.find(m => m.inquiryField === fieldId);
  };

  return (
    <div className="space-y-6">
      {/* Master Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Notion Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Verbinde dein Kontaktformular mit mehreren Notion-Datenbanken und wähle, welche Informationen wohin gesendet werden.
            </AlertDescription>
          </Alert>

          {/* Master Enable */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Notion-Workflow aktivieren</p>
              <p className="text-sm text-muted-foreground">
                Kontaktanfragen werden an konfigurierte Datenbanken gesendet
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => onChange({ ...config, enabled })}
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label>Notion API Key (für alle Datenbanken)</Label>
            <div className="flex gap-2">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
                placeholder="secret_xxx..."
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Den API Key findest du unter{' '}
              <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                notion.so/my-integrations
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Fields Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verfügbare Anfrage-Felder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INQUIRY_FIELDS.map(field => (
              <Badge key={field.id} variant="outline" className="text-xs">
                {field.label}
                <span className="ml-1 text-muted-foreground">({field.notionType})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Databases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Datenbanken</h3>
          <Button onClick={() => setShowAddDialog(true)} disabled={!config.apiKey}>
            <Plus className="h-4 w-4 mr-2" />
            Datenbank hinzufügen
          </Button>
        </div>

        {config.databases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium mb-2">Keine Datenbanken konfiguriert</p>
              <p className="text-sm text-muted-foreground mb-4">
                Füge Notion-Datenbanken hinzu, um Anfragen zu empfangen.
              </p>
              <Button onClick={() => setShowAddDialog(true)} disabled={!config.apiKey}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Datenbank hinzufügen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {config.databases.map(database => (
              <motion.div
                key={database.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <Card className={!database.enabled ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {database.name}
                            {testResults[database.id]?.success && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {database.databaseId.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={database.enabled}
                          onCheckedChange={(enabled) => handleUpdateDatabase(database.id, { enabled })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(database)}
                          disabled={testing === database.id}
                        >
                          {testing === database.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDatabase(database)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Datenbank entfernen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{database.name}" wird aus der Konfiguration entfernt. Die Notion-Datenbank selbst bleibt bestehen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveDatabase(database.id)}>
                                Entfernen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Field Mappings Preview */}
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {database.fieldMappings.length} von {INQUIRY_FIELDS.length} Feldern aktiv
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {INQUIRY_FIELDS.map(field => {
                          const isEnabled = isFieldEnabled(database, field.id);
                          const mapping = getFieldMapping(database, field.id);
                          return (
                            <Badge
                              key={field.id}
                              variant={isEnabled ? 'default' : 'outline'}
                              className={`cursor-pointer transition-all ${
                                isEnabled ? '' : 'opacity-50'
                              }`}
                              onClick={() => handleToggleField(database.id, field.id)}
                            >
                              {isEnabled ? (
                                <Check className="h-3 w-3 mr-1" />
                              ) : (
                                <X className="h-3 w-3 mr-1" />
                              )}
                              {field.label}
                              {mapping && mapping.notionProperty !== field.label && (
                                <span className="ml-1 text-xs opacity-70">
                                  → {mapping.notionProperty}
                                </span>
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Test Result */}
                    {testResults[database.id] && (
                      <div className={`mt-4 p-3 rounded-lg text-sm ${
                        testResults[database.id].success
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {testResults[database.id].success ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Verbunden: {testResults[database.id].databaseTitle}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {testResults[database.id].error}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Database Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Datenbank hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newDatabase.name || ''}
                onChange={(e) => setNewDatabase({ ...newDatabase, name: e.target.value })}
                placeholder="z.B. Kunden-CRM"
              />
            </div>
            <div className="space-y-2">
              <Label>Notion Database ID</Label>
              <Input
                value={newDatabase.databaseId || ''}
                onChange={(e) => setNewDatabase({ ...newDatabase, databaseId: e.target.value })}
                placeholder="abc123def456..."
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Die ID findest du in der URL deiner Notion-Datenbank
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddDatabase}>
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Database Dialog */}
      <Dialog open={!!editingDatabase} onOpenChange={(open) => !open && setEditingDatabase(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feld-Zuordnungen für "{editingDatabase?.name}"</DialogTitle>
          </DialogHeader>
          {editingDatabase && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Wähle, welche Felder an diese Datenbank gesendet werden und passe die Notion-Property-Namen an.
              </p>
              <div className="space-y-3">
                {INQUIRY_FIELDS.map(field => {
                  const isEnabled = isFieldEnabled(editingDatabase, field.id);
                  const mapping = getFieldMapping(editingDatabase, field.id);
                  
                  return (
                    <div
                      key={field.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isEnabled ? 'border-primary/50 bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handleToggleField(editingDatabase.id, field.id)}
                          />
                          <div>
                            <p className="font-medium text-sm">{field.label}</p>
                            <p className="text-xs text-muted-foreground">
                              Typ: {field.notionType}
                            </p>
                          </div>
                        </div>
                        {isEnabled && (
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <Input
                              value={mapping?.notionProperty || field.label}
                              onChange={(e) => handleUpdatePropertyName(editingDatabase.id, field.id, e.target.value)}
                              className="w-40 h-8 text-sm"
                              placeholder="Notion Property"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEditingDatabase(null)}>
              Fertig
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
