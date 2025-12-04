import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { LivePreview } from '@/components/admin/LivePreview';
import { ThemeManager } from '@/components/admin/ThemeManager';
import { BackupRestore } from '@/components/admin/BackupRestore';
import { Plus, Save, Check, Zap, Lightbulb, Shield, CheckCircle, Instagram, Linkedin, Twitter, Youtube, Facebook, Trash2, Star, Eye, EyeOff, Target, Heart, Rocket, Award, User, Handshake, ExternalLink, Database, AlertCircle, CheckCircle2, Loader2, Link2, HardDrive, Tag } from 'lucide-react';
import { PromotionManager } from '@/components/admin/PromotionManager';
import { Promotion } from '@/types/promotion';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { SiteSettings, Milestone, CoreValue, StatItem, Testimonial, Partner } from '@/data/initialData';

const benefitIcons = [Zap, Lightbulb, Shield, CheckCircle];
const valueIconOptions = ['Star', 'Lightbulb', 'Eye', 'Zap', 'Target', 'Heart', 'Shield', 'Rocket', 'Award'];

export default function AdminSettings() {
  const { settings, updateSettings } = useContent();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [whyInput, setWhyInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [notionTestResult, setNotionTestResult] = useState<{
    success?: boolean;
    error?: string;
    warning?: string;
    databaseTitle?: string;
    properties?: string[];
    configured?: boolean;
    hasToken?: boolean;
    hasDatabaseId?: boolean;
  } | null>(null);
  const [notionTesting, setNotionTesting] = useState(false);
  const [notionShowApiKey, setNotionShowApiKey] = useState(false);
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
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-6">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto">
            <TabsTrigger value="home" className="text-xs sm:text-sm">Startseite</TabsTrigger>
            <TabsTrigger value="partners" className="text-xs sm:text-sm">Partner</TabsTrigger>
            <TabsTrigger value="promotions" className="text-xs sm:text-sm">Aktionen</TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm">Über mich</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm">Kontakt</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs sm:text-sm">Integrationen</TabsTrigger>
            <TabsTrigger value="theme" className="text-xs sm:text-sm">Design</TabsTrigger>
            <TabsTrigger value="backup" className="text-xs sm:text-sm">Backup</TabsTrigger>
            <TabsTrigger value="general" className="text-xs sm:text-sm">Allgemein</TabsTrigger>
            <TabsTrigger value="legal" className="text-xs sm:text-sm">Rechtliches</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="home">
          <div className="mobile-stack">
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

        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  Partner & Kooperationen
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setForm({
                    ...form,
                    partners: [...(form.partners || []), {
                      name: '',
                      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80',
                      link: '',
                      quote: ''
                    }]
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Partner hinzufügen
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Partner-Logos werden auf der Startseite als scrollende Leiste angezeigt. Auch mit nur 1-2 Partnern funktioniert die Animation.
              </p>
              {(form.partners || []).map((partner, i) => (
                <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex gap-3 items-start">
                    {/* Logo Preview */}
                    <div className="w-16 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
                      <img 
                        src={partner.logo} 
                        alt={partner.name || 'Partner'} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          value={partner.name}
                          onChange={(e) => {
                            const newPartners = [...(form.partners || [])];
                            newPartners[i] = { ...newPartners[i], name: e.target.value };
                            setForm({ ...form, partners: newPartners });
                          }}
                          placeholder="Partner-Name"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={partner.link || ''}
                            onChange={(e) => {
                              const newPartners = [...(form.partners || [])];
                              newPartners[i] = { ...newPartners[i], link: e.target.value };
                              setForm({ ...form, partners: newPartners });
                            }}
                            placeholder="Website-Link (optional)"
                            className="flex-1"
                          />
                          {partner.link && (
                            <a href={partner.link} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-secondary rounded-lg">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <Input
                        value={partner.logo}
                        onChange={(e) => {
                          const newPartners = [...(form.partners || [])];
                          newPartners[i] = { ...newPartners[i], logo: e.target.value };
                          setForm({ ...form, partners: newPartners });
                        }}
                        placeholder="Logo-URL (https://...)"
                      />
                      <Input
                        value={partner.quote || ''}
                        onChange={(e) => {
                          const newPartners = [...(form.partners || [])];
                          newPartners[i] = { ...newPartners[i], quote: e.target.value };
                          setForm({ ...form, partners: newPartners });
                        }}
                        placeholder="Kurzes Zitat/Beschreibung (optional)"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newPartners = (form.partners || []).filter((_, idx) => idx !== i);
                        setForm({ ...form, partners: newPartners });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!form.partners || form.partners.length === 0) && (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <Handshake className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Keine Partner vorhanden
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Füge Partner hinzu, um sie auf der Startseite anzuzeigen
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <div className="space-y-6">
            {/* Persönliche Daten */}
            <Card>
              <CardHeader>
                <CardTitle>Persönliche Daten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Dein Name</label>
                    <Input
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      placeholder="Max Mustermann"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tagline / Motto</label>
                    <Input
                      value={form.aboutTagline || ''}
                      onChange={(e) => setForm({ ...form, aboutTagline: e.target.value })}
                      placeholder="Technologie trifft Kreativität"
                    />
                  </div>
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

            {/* Über mich Text & Mission */}
            <Card>
              <CardHeader>
                <CardTitle>Über mich & Mission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Über mich Text</label>
                  <Textarea
                    value={form.aboutText}
                    onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                    placeholder="Beschreibe dich und deine Arbeit..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mission Statement</label>
                  <Textarea
                    value={form.aboutMission || ''}
                    onChange={(e) => setForm({ ...form, aboutMission: e.target.value })}
                    placeholder="Deine Mission als Zitat..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Wird als Zitat dargestellt</p>
                </div>
              </CardContent>
            </Card>

            {/* Statistiken */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Statistiken
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({
                      ...form,
                      stats: [...(form.stats || []), { value: '', label: '' }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Hinzufügen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(form.stats || []).map((stat, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...(form.stats || [])];
                        newStats[i] = { ...newStats[i], value: e.target.value };
                        setForm({ ...form, stats: newStats });
                      }}
                      placeholder="50+"
                      className="w-24"
                    />
                    <Input
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...(form.stats || [])];
                        newStats[i] = { ...newStats[i], label: e.target.value };
                        setForm({ ...form, stats: newStats });
                      }}
                      placeholder="Projekte"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newStats = (form.stats || []).filter((_, idx) => idx !== i);
                        setForm({ ...form, stats: newStats });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!form.stats || form.stats.length === 0) && (
                  <p className="text-sm text-muted-foreground">Keine Statistiken. Füge welche hinzu!</p>
                )}
              </CardContent>
            </Card>

            {/* Werte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Werte
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({
                      ...form,
                      coreValues: [...(form.coreValues || []), { title: '', description: '', icon: 'Star' }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Hinzufügen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(form.coreValues || []).map((value, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg space-y-3">
                    <div className="flex gap-2">
                      <Select
                        value={value.icon}
                        onValueChange={(v) => {
                          const newValues = [...(form.coreValues || [])];
                          newValues[i] = { ...newValues[i], icon: v };
                          setForm({ ...form, coreValues: newValues });
                        }}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {valueIconOptions.map((icon) => (
                            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={value.title}
                        onChange={(e) => {
                          const newValues = [...(form.coreValues || [])];
                          newValues[i] = { ...newValues[i], title: e.target.value };
                          setForm({ ...form, coreValues: newValues });
                        }}
                        placeholder="Wert-Titel"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newValues = (form.coreValues || []).filter((_, idx) => idx !== i);
                          setForm({ ...form, coreValues: newValues });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={value.description}
                      onChange={(e) => {
                        const newValues = [...(form.coreValues || [])];
                        newValues[i] = { ...newValues[i], description: e.target.value };
                        setForm({ ...form, coreValues: newValues });
                      }}
                      placeholder="Beschreibung des Werts"
                    />
                  </div>
                ))}
                {(!form.coreValues || form.coreValues.length === 0) && (
                  <p className="text-sm text-muted-foreground">Keine Werte. Füge welche hinzu!</p>
                )}
              </CardContent>
            </Card>

            {/* Milestones / Werdegang */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Werdegang / Meilensteine
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({
                      ...form,
                      milestones: [...(form.milestones || []), { year: '', title: '', description: '' }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Hinzufügen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(form.milestones || []).map((milestone, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={milestone.year}
                        onChange={(e) => {
                          const newMilestones = [...(form.milestones || [])];
                          newMilestones[i] = { ...newMilestones[i], year: e.target.value };
                          setForm({ ...form, milestones: newMilestones });
                        }}
                        placeholder="2024"
                        className="w-24"
                      />
                      <Input
                        value={milestone.title}
                        onChange={(e) => {
                          const newMilestones = [...(form.milestones || [])];
                          newMilestones[i] = { ...newMilestones[i], title: e.target.value };
                          setForm({ ...form, milestones: newMilestones });
                        }}
                        placeholder="Titel"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newMilestones = (form.milestones || []).filter((_, idx) => idx !== i);
                          setForm({ ...form, milestones: newMilestones });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={milestone.description}
                      onChange={(e) => {
                        const newMilestones = [...(form.milestones || [])];
                        newMilestones[i] = { ...newMilestones[i], description: e.target.value };
                        setForm({ ...form, milestones: newMilestones });
                      }}
                      placeholder="Beschreibung"
                    />
                  </div>
                ))}
                {(!form.milestones || form.milestones.length === 0) && (
                  <p className="text-sm text-muted-foreground">Keine Meilensteine. Füge welche hinzu!</p>
                )}
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Kundenstimmen / Testimonials
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({
                      ...form,
                      testimonials: [...(form.testimonials || []), {
                        name: '',
                        position: '',
                        company: '',
                        image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80',
                        quote: '',
                        rating: 5
                      }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Hinzufügen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(form.testimonials || []).map((testimonial, i) => (
                  <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input
                            value={testimonial.name}
                            onChange={(e) => {
                              const newTestimonials = [...(form.testimonials || [])];
                              newTestimonials[i] = { ...newTestimonials[i], name: e.target.value };
                              setForm({ ...form, testimonials: newTestimonials });
                            }}
                            placeholder="Name"
                          />
                          <Input
                            value={testimonial.company}
                            onChange={(e) => {
                              const newTestimonials = [...(form.testimonials || [])];
                              newTestimonials[i] = { ...newTestimonials[i], company: e.target.value };
                              setForm({ ...form, testimonials: newTestimonials });
                            }}
                            placeholder="Firma"
                          />
                        </div>
                        <Input
                          value={testimonial.position}
                          onChange={(e) => {
                            const newTestimonials = [...(form.testimonials || [])];
                            newTestimonials[i] = { ...newTestimonials[i], position: e.target.value };
                            setForm({ ...form, testimonials: newTestimonials });
                          }}
                          placeholder="Position / Rolle"
                        />
                        <Textarea
                          value={testimonial.quote}
                          onChange={(e) => {
                            const newTestimonials = [...(form.testimonials || [])];
                            newTestimonials[i] = { ...newTestimonials[i], quote: e.target.value };
                            setForm({ ...form, testimonials: newTestimonials });
                          }}
                          placeholder="Zitat / Bewertung..."
                          rows={3}
                        />
                        <div className="flex gap-2 items-center">
                          <label className="text-sm font-medium">Bild-URL:</label>
                          <Input
                            value={testimonial.image}
                            onChange={(e) => {
                              const newTestimonials = [...(form.testimonials || [])];
                              newTestimonials[i] = { ...newTestimonials[i], image: e.target.value };
                              setForm({ ...form, testimonials: newTestimonials });
                            }}
                            placeholder="https://..."
                            className="flex-1"
                          />
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="text-sm font-medium">Bewertung:</label>
                          <Select
                            value={String(testimonial.rating || 5)}
                            onValueChange={(v) => {
                              const newTestimonials = [...(form.testimonials || [])];
                              newTestimonials[i] = { ...newTestimonials[i], rating: Number(v) };
                              setForm({ ...form, testimonials: newTestimonials });
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 4, 3, 2, 1].map(num => (
                                <SelectItem key={num} value={String(num)}>
                                  {num} {num === 1 ? 'Stern' : 'Sterne'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newTestimonials = (form.testimonials || []).filter((_, idx) => idx !== i);
                          setForm({ ...form, testimonials: newTestimonials });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!form.testimonials || form.testimonials.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Testimonials. Füge Kundenstimmen hinzu, um Vertrauen aufzubauen!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
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
        </TabsContent>

        <TabsContent value="contact">
          <div className="mobile-stack">
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

            <Card>
              <CardHeader>
                <CardTitle>Social Media (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Instagram className="h-4 w-4" /> Instagram
                  </label>
                  <Input
                    value={form.socialInstagram || ''}
                    onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </label>
                  <Input
                    value={form.socialLinkedin || ''}
                    onChange={(e) => setForm({ ...form, socialLinkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Twitter className="h-4 w-4" /> Twitter / X
                  </label>
                  <Input
                    value={form.socialTwitter || ''}
                    onChange={(e) => setForm({ ...form, socialTwitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Youtube className="h-4 w-4" /> YouTube
                  </label>
                  <Input
                    value={form.socialYoutube || ''}
                    onChange={(e) => setForm({ ...form, socialYoutube: e.target.value })}
                    placeholder="https://youtube.com/@channel"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                    TikTok
                  </label>
                  <Input
                    value={form.socialTiktok || ''}
                    onChange={(e) => setForm({ ...form, socialTiktok: e.target.value })}
                    placeholder="https://tiktok.com/@username"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Facebook className="h-4 w-4" /> Facebook
                  </label>
                  <Input
                    value={form.socialFacebook || ''}
                    onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })}
                    placeholder="https://facebook.com/pagename"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leer lassen, wenn du den Link nicht anzeigen möchtest.
                </p>
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
                {(form.socialInstagram || form.socialLinkedin || form.socialTwitter || form.socialYoutube || form.socialTiktok || form.socialFacebook) && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-2">Social Media</p>
                    <div className="flex flex-wrap gap-2">
                      {form.socialInstagram && (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Instagram className="h-4 w-4 text-amber-500" />
                        </div>
                      )}
                      {form.socialLinkedin && (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Linkedin className="h-4 w-4 text-amber-500" />
                        </div>
                      )}
                      {form.socialTwitter && (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Twitter className="h-4 w-4 text-amber-500" />
                        </div>
                      )}
                      {form.socialYoutube && (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Youtube className="h-4 w-4 text-amber-500" />
                        </div>
                      )}
                      {form.socialTiktok && (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                        </div>
                      )}
                      {form.socialFacebook && (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Facebook className="h-4 w-4 text-amber-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Firmenname, E-Mail, Telefon und Standort werden automatisch aus den Kontaktdaten übernommen. 
                Hier können Sie den vollständigen rechtlichen Text bearbeiten.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Impressum - Vollständiger Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={form.impressumText}
                  onChange={(e) => setForm({ ...form, impressumText: e.target.value })}
                  placeholder="Vollständiger Impressum-Text..."
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Tipp: Der Text wird nach den automatischen Kontaktdaten angezeigt. Verwenden Sie Absätze für bessere Lesbarkeit.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datenschutzerklärung - Vollständiger Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={form.datenschutzText}
                  onChange={(e) => setForm({ ...form, datenschutzText: e.target.value })}
                  placeholder="Vollständige Datenschutzerklärung..."
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Tipp: Fügen Sie hier Ihre vollständige Datenschutzerklärung ein. Der grundlegende Header wird automatisch generiert.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Notion Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Verbinde dein Kontaktformular mit Notion, um Anfragen automatisch in einer Datenbank zu speichern.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Server URL (für Self-Hosting)</label>
                  <Input
                    value={form.apiBaseUrl || ''}
                    onChange={(e) => setForm({ ...form, apiBaseUrl: e.target.value })}
                    placeholder="https://kernel_website.floriskern.ch"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gib deine Domain ein (z.B. https://kernel_website.floriskern.ch), wenn du die Website selbst hostest. Leer lassen für lokale Entwicklung.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Notion aktivieren</p>
                    <p className="text-sm text-muted-foreground">
                      Kontaktanfragen werden an Notion gesendet
                    </p>
                  </div>
                  <Switch
                    checked={form.notionEnabled || false}
                    onCheckedChange={(checked) => setForm({ ...form, notionEnabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notion API Key</label>
                  <div className="flex gap-2">
                    <Input
                      type={form.notionApiKey && !notionShowApiKey ? 'password' : 'text'}
                      value={form.notionApiKey || ''}
                      onChange={(e) => setForm({ ...form, notionApiKey: e.target.value })}
                      placeholder="secret_xxx..."
                      disabled={!form.notionEnabled}
                      className="font-mono"
                    />
                    {form.notionApiKey && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setNotionShowApiKey(!notionShowApiKey)}
                        disabled={!form.notionEnabled}
                      >
                        {notionShowApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Den API Key findest du unter <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">notion.so/my-integrations</a> (beginnt mit secret_)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notion Database ID</label>
                  <Input
                    value={form.notionDatabaseId || ''}
                    onChange={(e) => setForm({ ...form, notionDatabaseId: e.target.value })}
                    placeholder="abc123def456..."
                    disabled={!form.notionEnabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Die ID findest du in der URL deiner Notion-Datenbank zwischen dem letzten "/" und dem "?"
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    disabled={!form.notionDatabaseId || !form.notionApiKey || notionTesting}
                    onClick={async () => {
                      setNotionTesting(true);
                      setNotionTestResult(null);
                      try {
                        const baseUrl = form.apiBaseUrl?.replace(/\/$/, '') || '';
                        const response = await fetch(`${baseUrl}/api/notion/test`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            databaseId: form.notionDatabaseId,
                            apiKey: form.notionApiKey
                          })
                        });
                        const result = await response.json();
                        setNotionTestResult(result);
                        if (result.success) {
                          toast.success('Notion-Verbindung erfolgreich!');
                        } else {
                          toast.error(result.error || 'Verbindung fehlgeschlagen');
                        }
                      } catch (error) {
                        setNotionTestResult({ 
                          success: false, 
                          error: 'Server nicht erreichbar. Läuft der Server mit node server.js?' 
                        });
                        toast.error('Server nicht erreichbar');
                      }
                      setNotionTesting(false);
                    }}
                  >
                    {notionTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Teste...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Verbindung testen
                      </>
                    )}
                  </Button>
                </div>

                {notionTestResult && (
                  <div className={`p-4 rounded-lg border ${
                    notionTestResult.success 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-destructive/10 border-destructive/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      {notionTestResult.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      )}
                      <div className="space-y-1 flex-1">
                        <p className={`font-medium ${notionTestResult.success ? 'text-green-500' : 'text-destructive'}`}>
                          {notionTestResult.success ? 'Verbindung erfolgreich' : 'Verbindung fehlgeschlagen'}
                        </p>
                        {notionTestResult.error && (
                          <p className="text-sm text-muted-foreground">{notionTestResult.error}</p>
                        )}
                        {notionTestResult.warning && (
                          <p className="text-sm text-yellow-500">{notionTestResult.warning}</p>
                        )}
                        {notionTestResult.databaseTitle && (
                          <p className="text-sm text-muted-foreground">
                            Datenbank: <strong>{notionTestResult.databaseTitle}</strong>
                          </p>
                        )}
                        {notionTestResult.properties && notionTestResult.properties.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Gefundene Properties:</p>
                            <div className="flex flex-wrap gap-1">
                              {notionTestResult.properties.map((prop, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{prop}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Einrichtungs-Anleitung</h4>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Erstelle eine Integration unter <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">notion.so/my-integrations</a></li>
                    <li>Kopiere den "Internal Integration Token" (beginnt mit <code className="bg-muted px-1 rounded">secret_</code>) und trage ihn oben ein</li>
                    <li>Erstelle eine Notion-Datenbank mit den Properties: Name, E-Mail, Status, Eingegangen</li>
                    <li>Teile die Datenbank mit deiner Integration</li>
                    <li>Kopiere die Database ID aus der URL und trage sie oben ein</li>
                    <li>Klicke auf "Speichern" und teste die Verbindung</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-4">
                    Ausführliche Anleitung: Siehe <code className="bg-muted px-1 rounded">HOSTING.md</code> Abschnitt 9
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="promotions">
          <PromotionManager
            promotions={form.promotions || []}
            onChange={(promotions) => setForm({ ...form, promotions })}
          />
        </TabsContent>

        <TabsContent value="theme">
          <ThemeManager />
        </TabsContent>

        <TabsContent value="backup">
          <BackupRestore />
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
