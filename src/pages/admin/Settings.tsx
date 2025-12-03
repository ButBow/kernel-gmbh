import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteSettings } from '@/data/initialData';

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
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="home">Startseite</TabsTrigger>
          <TabsTrigger value="about">Über mich</TabsTrigger>
          <TabsTrigger value="contact">Kontakt</TabsTrigger>
          <TabsTrigger value="legal">Rechtliches</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
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
        </TabsContent>

        <TabsContent value="home">
          <Card>
            <CardHeader>
              <CardTitle>Startseite / Hero</CardTitle>
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
                <label className="text-sm font-medium">Hero Untertitel / Beschreibung</label>
                <Textarea
                  value={form.heroSubtitle}
                  onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                  placeholder="Beschreibung..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Call-to-Action Text</label>
                <Input
                  value={form.heroCta}
                  onChange={(e) => setForm({ ...form, heroCta: e.target.value })}
                  placeholder="Projekt anfragen"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Warum mit mir arbeiten?</label>
                <div className="flex gap-2 mb-2">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>Über mich</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Profilbild URL</label>
                <Input
                  value={form.aboutImage}
                  onChange={(e) => setForm({ ...form, aboutImage: e.target.value })}
                  placeholder="https://..."
                />
                {form.aboutImage && (
                  <div className="mt-2">
                    <img src={form.aboutImage} alt="Preview" className="w-32 h-32 rounded-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Über mich Text</label>
                <Textarea
                  value={form.aboutText}
                  onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                  placeholder="Beschreibung..."
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Skills / Kompetenzen</label>
                <div className="flex gap-2 mb-2">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
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
        </TabsContent>

        <TabsContent value="legal">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Impressum</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.impressumText}
                  onChange={(e) => setForm({ ...form, impressumText: e.target.value })}
                  placeholder="Impressum-Text..."
                  rows={10}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datenschutzerklärung</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.datenschutzText}
                  onChange={(e) => setForm({ ...form, datenschutzText: e.target.value })}
                  placeholder="Datenschutz-Text..."
                  rows={10}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-6 right-6">
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
