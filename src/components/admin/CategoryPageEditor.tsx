import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, Eye, Layout, Type, Search, HelpCircle } from 'lucide-react';
import type { Category, CategoryPageSettings } from '@/data/initialData';
import { ImageUpload } from './ImageUpload';

interface CategoryPageEditorProps {
  category: Category;
  onSave: (settings: CategoryPageSettings) => void;
  onClose: () => void;
}

export function CategoryPageEditor({ category, onSave, onClose }: CategoryPageEditorProps) {
  const [settings, setSettings] = useState<CategoryPageSettings>(category.pageSettings || {
    heroTitle: category.name,
    heroSubtitle: category.description,
    layout: 'grid',
    columnsDesktop: 3,
    showPrices: true,
    showPackages: true,
    faqItems: []
  });

  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const addFaqItem = () => {
    if (!newFaq.question || !newFaq.answer) return;
    setSettings({
      ...settings,
      faqItems: [...(settings.faqItems || []), { ...newFaq }]
    });
    setNewFaq({ question: '', answer: '' });
  };

  const removeFaqItem = (index: number) => {
    setSettings({
      ...settings,
      faqItems: (settings.faqItems || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Seiteneinstellungen: {category.name}</h2>
          <p className="text-sm text-muted-foreground">
            Passe die Unterseite für diese Kategorie an
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Inhalt
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero-Bereich</CardTitle>
              <CardDescription>Der obere Bereich der Kategorieseite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Überschrift</Label>
                <Input
                  value={settings.heroTitle || ''}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  placeholder={category.name}
                />
              </div>
              <div>
                <Label>Untertitel</Label>
                <Textarea
                  value={settings.heroSubtitle || ''}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  placeholder={category.description}
                  rows={3}
                />
              </div>
              <div>
                <Label>Hintergrundbild (optional)</Label>
                <ImageUpload
                  value={settings.heroImage || ''}
                  onChange={(url) => setSettings({ ...settings, heroImage: url })}
                  placeholder="Hero-Bild hochladen"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call-to-Action</CardTitle>
              <CardDescription>Optionaler CTA-Bereich am Ende der Seite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>CTA Text</Label>
                <Input
                  value={settings.ctaText || ''}
                  onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
                  placeholder="z.B. Bereit für Ihr Projekt?"
                />
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input
                  value={settings.ctaLink || ''}
                  onChange={(e) => setSettings({ ...settings, ctaLink: e.target.value })}
                  placeholder="/kontakt"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Produktanzeige</CardTitle>
              <CardDescription>Wie sollen die Produkte dargestellt werden?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Layout</Label>
                <Select
                  value={settings.layout || 'grid'}
                  onValueChange={(value: 'grid' | 'list' | 'cards') => setSettings({ ...settings, layout: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Raster (Grid)</SelectItem>
                    <SelectItem value="list">Liste</SelectItem>
                    <SelectItem value="cards">Karten (gross)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Spalten (Desktop)</Label>
                <Select
                  value={String(settings.columnsDesktop || 3)}
                  onValueChange={(value) => setSettings({ ...settings, columnsDesktop: Number(value) as 2 | 3 | 4 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Spalten</SelectItem>
                    <SelectItem value="3">3 Spalten</SelectItem>
                    <SelectItem value="4">4 Spalten</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Preise anzeigen</Label>
                  <p className="text-sm text-muted-foreground">Preise in der Übersicht zeigen</p>
                </div>
                <Switch
                  checked={settings.showPrices !== false}
                  onCheckedChange={(checked) => setSettings({ ...settings, showPrices: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pakete anzeigen</Label>
                  <p className="text-sm text-muted-foreground">Showcase-Pakete im Detail zeigen</p>
                </div>
                <Switch
                  checked={settings.showPackages !== false}
                  onCheckedChange={(checked) => setSettings({ ...settings, showPackages: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Suchmaschinenoptimierung</CardTitle>
              <CardDescription>Meta-Tags für bessere Auffindbarkeit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>SEO Titel</Label>
                <Input
                  value={settings.seoTitle || ''}
                  onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                  placeholder={category.name}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(settings.seoTitle || category.name).length}/60 Zeichen
                </p>
              </div>
              <div>
                <Label>SEO Beschreibung</Label>
                <Textarea
                  value={settings.seoDescription || ''}
                  onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                  placeholder={category.description}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(settings.seoDescription || category.description).length}/160 Zeichen
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>FAQ-Bereich</CardTitle>
              <CardDescription>Häufig gestellte Fragen zu dieser Kategorie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing FAQs */}
              {settings.faqItems && settings.faqItems.length > 0 && (
                <div className="space-y-3">
                  {settings.faqItems.map((faq, index) => (
                    <div key={index} className="p-3 bg-secondary rounded-lg">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{faq.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFaqItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new FAQ */}
              <div className="border border-dashed rounded-lg p-4 space-y-3">
                <div>
                  <Label>Frage</Label>
                  <Input
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                    placeholder="z.B. Wie lange dauert ein Projekt?"
                  />
                </div>
                <div>
                  <Label>Antwort</Label>
                  <Textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    placeholder="Die Antwort auf die Frage..."
                    rows={2}
                  />
                </div>
                <Button variant="outline" onClick={addFaqItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  FAQ hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
