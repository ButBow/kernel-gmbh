import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Check, Plus, Copy, Trash2, Pencil, Palette } from 'lucide-react';
import { toast } from 'sonner';
import type { Theme, ThemeColors } from '@/data/themes';
import { defaultThemeColors } from '@/data/themes';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  colorKey: keyof ThemeColors;
}

function ColorInput({ label, value, onChange, colorKey }: ColorInputProps) {
  // Convert HSL string to hex for color picker
  const hslToHex = (hsl: string): string => {
    const parts = hsl.split(' ');
    if (parts.length < 3) return '#ffffff';
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert hex to HSL string
  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return value;
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-8 h-8 rounded border border-border flex-shrink-0"
        style={{ backgroundColor: `hsl(${value})` }}
      />
      <input
        type="color"
        value={hslToHex(value)}
        onChange={(e) => onChange(hexToHsl(e.target.value))}
        className="w-8 h-8 cursor-pointer rounded border-0 p-0"
      />
      <span className="text-xs text-muted-foreground flex-1 truncate">{label}</span>
    </div>
  );
}

interface ThemeEditorProps {
  theme?: Theme;
  onSave: (name: string, description: string, colors: ThemeColors) => void;
  onCancel: () => void;
}

function ThemeEditor({ theme, onSave, onCancel }: ThemeEditorProps) {
  const [name, setName] = useState(theme?.name || 'Mein Theme');
  const [description, setDescription] = useState(theme?.description || 'Benutzerdefiniertes Theme');
  const [colors, setColors] = useState<ThemeColors>(theme?.colors || { ...defaultThemeColors });

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors({ ...colors, [key]: value });
  };

  const colorGroups = [
    {
      title: 'Hintergrund',
      colors: [
        { key: 'background' as const, label: 'Hintergrund' },
        { key: 'foreground' as const, label: 'Text' },
        { key: 'card' as const, label: 'Karten' },
        { key: 'cardForeground' as const, label: 'Karten-Text' },
      ]
    },
    {
      title: 'Primärfarben',
      colors: [
        { key: 'primary' as const, label: 'Primär (Akzent)' },
        { key: 'primaryForeground' as const, label: 'Primär-Text' },
        { key: 'ring' as const, label: 'Fokus-Ring' },
      ]
    },
    {
      title: 'Sekundärfarben',
      colors: [
        { key: 'secondary' as const, label: 'Sekundär' },
        { key: 'secondaryForeground' as const, label: 'Sekundär-Text' },
        { key: 'muted' as const, label: 'Gedämpft' },
        { key: 'mutedForeground' as const, label: 'Gedämpfter Text' },
      ]
    },
    {
      title: 'UI-Elemente',
      colors: [
        { key: 'border' as const, label: 'Rahmen' },
        { key: 'input' as const, label: 'Eingabefelder' },
        { key: 'accent' as const, label: 'Akzent' },
        { key: 'accentForeground' as const, label: 'Akzent-Text' },
      ]
    },
    {
      title: 'Status',
      colors: [
        { key: 'destructive' as const, label: 'Fehler/Löschen' },
        { key: 'destructiveForeground' as const, label: 'Fehler-Text' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Theme-Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mein Theme"
          />
        </div>
        <div>
          <Label>Beschreibung</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung des Themes"
          />
        </div>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {colorGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-medium mb-2">{group.title}</h4>
            <div className="grid grid-cols-2 gap-2">
              {group.colors.map((color) => (
                <ColorInput
                  key={color.key}
                  label={color.label}
                  value={colors[color.key]}
                  onChange={(value) => updateColor(color.key, value)}
                  colorKey={color.key}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="p-4 rounded-lg border border-border" style={{
        backgroundColor: `hsl(${colors.background})`,
        color: `hsl(${colors.foreground})`,
      }}>
        <p className="text-xs mb-2">Vorschau:</p>
        <div className="flex gap-2">
          <div 
            className="px-3 py-1 rounded text-sm font-medium"
            style={{ 
              backgroundColor: `hsl(${colors.primary})`,
              color: `hsl(${colors.primaryForeground})`,
            }}
          >
            Button
          </div>
          <div 
            className="px-3 py-1 rounded text-sm"
            style={{ 
              backgroundColor: `hsl(${colors.secondary})`,
              color: `hsl(${colors.secondaryForeground})`,
            }}
          >
            Sekundär
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={() => onSave(name, description, colors)}>
          Speichern
        </Button>
      </div>
    </div>
  );
}

export function ThemeManager() {
  const { 
    themeConfig, activeTheme, allThemes,
    setActiveTheme, addCustomTheme, updateCustomTheme, deleteCustomTheme, duplicateTheme 
  } = useTheme();
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  const handleCreateTheme = () => {
    setEditingTheme(null);
    setEditorOpen(true);
  };

  const handleEditTheme = (theme: Theme) => {
    setEditingTheme(theme);
    setEditorOpen(true);
  };

  const handleSaveTheme = (name: string, description: string, colors: ThemeColors) => {
    if (editingTheme && !editingTheme.isPreset) {
      updateCustomTheme(editingTheme.id, { name, description, colors });
      toast.success('Theme aktualisiert');
    } else {
      addCustomTheme({ name, description, colors });
      toast.success('Neues Theme erstellt');
    }
    setEditorOpen(false);
    setEditingTheme(null);
  };

  const handleDeleteTheme = (themeId: string) => {
    deleteCustomTheme(themeId);
    toast.success('Theme gelöscht');
  };

  const handleDuplicateTheme = (themeId: string) => {
    duplicateTheme(themeId);
    toast.success('Theme dupliziert');
  };

  const presets = allThemes.filter(t => t.isPreset);
  const customThemes = allThemes.filter(t => !t.isPreset);

  return (
    <div className="space-y-6">
      {/* Active Theme Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Aktives Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{activeTheme.name}</p>
              <p className="text-sm text-muted-foreground">{activeTheme.description}</p>
            </div>
            <div className="flex gap-1">
              {['primary', 'secondary', 'background', 'accent'].map((colorKey) => (
                <div
                  key={colorKey}
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: `hsl(${activeTheme.colors[colorKey as keyof ThemeColors]})` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preset Themes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Vorlagen</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((theme) => (
            <Card 
              key={theme.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                activeTheme.id === theme.id ? 'border-primary ring-1 ring-primary' : ''
              }`}
              onClick={() => setActiveTheme(theme.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{theme.name}</p>
                      {activeTheme.id === theme.id && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{theme.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {['primary', 'secondary', 'background'].map((colorKey) => (
                    <div
                      key={colorKey}
                      className="flex-1 h-4 rounded"
                      style={{ backgroundColor: `hsl(${theme.colors[colorKey as keyof ThemeColors]})` }}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateTheme(theme.id);
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Kopieren
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Themes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Eigene Themes</h3>
          <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleCreateTheme}>
                <Plus className="h-4 w-4 mr-2" />
                Neues Theme
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTheme ? 'Theme bearbeiten' : 'Neues Theme erstellen'}
                </DialogTitle>
              </DialogHeader>
              <ThemeEditor
                theme={editingTheme || undefined}
                onSave={handleSaveTheme}
                onCancel={() => {
                  setEditorOpen(false);
                  setEditingTheme(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {customThemes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Palette className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                Keine eigenen Themes vorhanden
              </p>
              <p className="text-xs text-muted-foreground">
                Erstelle ein neues Theme oder kopiere eine Vorlage
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customThemes.map((theme) => (
              <Card 
                key={theme.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  activeTheme.id === theme.id ? 'border-primary ring-1 ring-primary' : ''
                }`}
                onClick={() => setActiveTheme(theme.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{theme.name}</p>
                        {activeTheme.id === theme.id && (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{theme.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      Eigenes
                    </Badge>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {['primary', 'secondary', 'background'].map((colorKey) => (
                      <div
                        key={colorKey}
                        className="flex-1 h-4 rounded"
                        style={{ backgroundColor: `hsl(${theme.colors[colorKey as keyof ThemeColors]})` }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTheme(theme);
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Bearbeiten
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Theme löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Das Theme "{theme.name}" wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTheme(theme.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
