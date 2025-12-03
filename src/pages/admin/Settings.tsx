import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { LivePreview } from '@/components/admin/LivePreview';
import { Plus, Save, Check, Zap, Lightbulb, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteSettings } from '@/data/initialData';

const benefitIcons = [Zap, Lightbulb, Shield, CheckCircle];

export default function AdminSettings() {
  const { settings, updateSettings } = useContent();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [whyInput, setWhyInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    toast.success('Einstellungen gespeichert');
    setTimeout(() => setSaved(false), 2000);
  };

  const addWhyItem = () => {
    if (!whyInput.trim()) return;
    setForm({ ...form, whyWorkWithMe: [...form.whyWorkWithMe, whyInput.trim()] });
    setWhyInput('');
  };

  const removeWhyItem = (index: number) => {
    setForm({ ...form, whyWorkWithMe: form.whyWorkWithMe.filter((_, i) => i !== index) });
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
    setSkillInput('');
  };

  const removeSkill = (index: number) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== index) });
  };

  return (
    <AdminLayout title="Einstellungen">
      <Tabs defaultValue="home">
        <TabsList className="mb-6">
          <TabsTrigger value="home">Startseite</TabsTrigger>
          <TabsTrigger value="about">Über mich</TabsTrigger>
          <TabsTrigger value="contact">Kontakt</TabsTrigger>
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="legal">Rechtliches</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hero-Bereich</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Hero Titel</label>
                    <Input
                      value={form.heroTitle}
                      onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                      placeholder="Effizienz durch Technologie & Kreativität"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hero Beschreibung</label>
                    <Textarea
                      value={form.heroSubtitle}
                      onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                      placeholder="Beschreibung..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Call-to-Action Button</label>
                    <Input
                      value={form.heroCta}
                      onChange={(e) => setForm({ ...form, heroCta: e.target.value })}
                      placeholder="Projekt anfragen"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Warum mit mir arbeiten?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={whyInput}
                      onChange={(e) => setWhyInput(e.target.value)}
                      placeholder="Neuen Punkt hinzufügen"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWhyItem())}
                    />
                    <Button type="button" variant="outline" onClick={addWhyItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {form.whyWorkWithMe.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                        <span className="flex-1">{item}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeWhyItem(i)}>×</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview */}
            <LivePreview title="Hero-Vorschau">
              <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="text-center">
                  <h1 className="font-bold text-xl md:text-2xl mb-3 text-amber-400">
                    {form.heroTitle || 'Hero Titel'}
                  </h1>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                    {form.heroSubtitle || 'Hero Beschreibung...'}
                  </p>
                  <button className="px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-medium">
                    {form.heroCta || 'CTA Button'}
                  </button>
                </div>
                
                {form.whyWorkWithMe.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-2">Warum mit mir arbeiten?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {form.whyWorkWithMe.slice(0, 4).map((item, i) => {
                        const Icon = benefitIcons[i % benefitIcons.length];
                        return (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <Icon className="h-3 w-3 text-amber-500" />
                            <span className="truncate">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </LivePreview>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Persönliche Daten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Dein Name</label>
                    <Input
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      placeholder="Max Mustermann"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Dein persönlicher Name (nicht der Firmenname)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Profilbild</label>
                    <ImageUpload
                      value={form.aboutImage}
                      onChange={(value) => setForm({ ...form, aboutImage: value })}
                      aspectRatio="square"
                      placeholder="Profilbild hochladen"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Über mich Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={form.aboutText}
                    onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                    placeholder="Beschreibung..."
                    rows={8}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills / Kompetenzen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Skill hinzufügen"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(i)}>
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview */}
            <LivePreview title="Über mich Vorschau">
              <div className="p-6 bg-slate-950">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                    {form.aboutImage ? (
                      <img src={form.aboutImage} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        Bild
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white mb-1">{form.ownerName || 'Dein Name'}</h3>
                    <p className="text-xs text-amber-500 mb-2">Gründer von {form.companyName}</p>
                    <p className="text-xs text-slate-400 line-clamp-3">
                      {form.aboutText || 'Über mich Text...'}
                    </p>
                  </div>
                </div>
                
                {form.skills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {form.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </LivePreview>
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">E-Mail</label>
                  <Input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="kontakt@firma.ch"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefon</label>
                  <Input
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="+41 79 123 45 67"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Standort</label>
                  <Input
                    value={form.contactLocation}
                    onChange={(e) => setForm({ ...form, contactLocation: e.target.value })}
                    placeholder="Zürich, Schweiz"
                  />
                </div>
              </CardContent>
            </Card>

            <LivePreview title="Kontakt-Vorschau">
              <div className="p-6 bg-slate-950 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <span className="text-amber-500 text-xs">@</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">E-Mail</p>
                    <p className="text-sm text-white">{form.contactEmail || 'email@beispiel.ch'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <span className="text-amber-500 text-xs">📞</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Telefon</p>
                    <p className="text-sm text-white">{form.contactPhone || '+41 79 123 45 67'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <span className="text-amber-500 text-xs">📍</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Standort</p>
                    <p className="text-sm text-white">{form.contactLocation || 'Standort'}</p>
                  </div>
                </div>
              </div>
            </LivePreview>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Allgemeine Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Firmenname</label>
                  <Input
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Mein Firmenname"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Wird überall auf der Website angezeigt (Header, Footer, Impressum, etc.)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Footer-Text</label>
                  <Input
                    value={form.footerText}
                    onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                    placeholder="© 2024 Mein Firmenname"
                  />
                </div>
              </CardContent>
            </Card>

            <LivePreview title="Header/Footer Vorschau">
              <div className="bg-slate-950">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-sm">{form.companyName || 'Firmenname'}</span>
                  <div className="flex gap-2 text-xs text-slate-400">
                    <span>Home</span>
                    <span>Leistungen</span>
                    <span>Kontakt</span>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-500">{form.footerText || '© Footer Text'}</p>
                </div>
              </div>
            </LivePreview>
          </div>
        </TabsContent>

        <TabsContent value="legal">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Impressum (zusätzlicher Text)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.impressumText}
                  onChange={(e) => setForm({ ...form, impressumText: e.target.value })}
                  placeholder="Zusätzliche Angaben fürs Impressum..."
                  rows={8}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Firmenname, E-Mail, Telefon und Standort werden automatisch aus den Kontaktdaten übernommen.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datenschutzerklärung (zusätzlicher Text)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.datenschutzText}
                  onChange={(e) => setForm({ ...form, datenschutzText: e.target.value })}
                  placeholder="Zusätzliche Angaben für den Datenschutz..."
                  rows={8}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={handleSave} size="lg" className="shadow-lg">
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Gespeichert
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
}
