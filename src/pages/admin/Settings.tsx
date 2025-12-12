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
import { Plus, Save, Check, Zap, Lightbulb, Shield, CheckCircle, Instagram, Linkedin, Twitter, Youtube, Facebook, Trash2, Star, Eye, EyeOff, Target, Heart, Rocket, Award, User, Handshake, ExternalLink, Database, AlertCircle, CheckCircle2, Loader2, Link2, HardDrive, Tag, FileText, ChevronUp, ChevronDown, Cookie, MessageCircle, Bot } from 'lucide-react';

import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { SiteSettings, Milestone, CoreValue, StatItem, Testimonial, Partner, Executive, ChatbotSettings } from '@/data/initialData';
import { defaultCookieSettings, CookieSettings, ALL_TRACKING_OPTIONS, TrackingConfig } from '@/types/cookieSettings';
import { defaultChatbotSettings } from '@/data/initialData';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Label } from '@/components/ui/label';

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

  // Generic move function for arrays
  const moveItem = <T,>(array: T[], index: number, direction: 'up' | 'down'): T[] => {
    const newArray = [...array];
    if (direction === 'up' && index > 0) {
      [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
    } else if (direction === 'down' && index < array.length - 1) {
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
    }
    return newArray;
  };

  return (
    <AdminLayout title="Einstellungen">
      <Tabs defaultValue="home">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-6">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto">
            <TabsTrigger value="home" className="text-xs sm:text-sm">Website</TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm">Über mich</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm">Kontakt</TabsTrigger>
            <TabsTrigger value="theme" className="text-xs sm:text-sm">Design</TabsTrigger>
            <TabsTrigger value="backup" className="text-xs sm:text-sm">Backup</TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm">System</TabsTrigger>
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
                        <div className="flex flex-col">
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, whyWorkWithMe: moveItem(form.whyWorkWithMe, i, 'up') })} disabled={i === 0}>
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, whyWorkWithMe: moveItem(form.whyWorkWithMe, i, 'down') })} disabled={i === form.whyWorkWithMe.length - 1}>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
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
              <div className="p-6 bg-background">
                <div className="text-center">
                  <h1 className="font-bold text-xl md:text-2xl mb-3 text-primary">
                    {form.heroTitle || 'Hero Titel'}
                  </h1>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {form.heroSubtitle || 'Hero Beschreibung...'}
                  </p>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                    {form.heroCta || 'CTA Button'}
                  </button>
                </div>
                
                {form.whyWorkWithMe.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Warum mit mir arbeiten?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {form.whyWorkWithMe.slice(0, 4).map((item, i) => {
                        const Icon = benefitIcons[i % benefitIcons.length];
                        return (
                          <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                            <Icon className="h-3 w-3 text-primary" />
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
          <div className="mobile-stack">
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
                    {/* Reorder buttons */}
                    <div className="flex flex-col">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, partners: moveItem(form.partners || [], i, 'up') })} disabled={i === 0}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, partners: moveItem(form.partners || [], i, 'down') })} disabled={i === (form.partners || []).length - 1}>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
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

          <LivePreview title="Partner-Vorschau">
            <div className="p-4 bg-background">
              <p className="text-xs text-muted-foreground mb-3 text-center">Partner-Leiste (scrollend)</p>
              <div className="flex gap-4 overflow-hidden">
                {(form.partners || []).length > 0 ? (
                  (form.partners || []).map((partner, i) => (
                    <div key={i} className="flex-shrink-0 w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                      <img src={partner.logo} alt={partner.name || 'Partner'} className="w-full h-full object-contain p-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center w-full">Keine Partner</p>
                )}
              </div>
            </div>
          </LivePreview>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Form Section - spans 2 columns */}
            <div className="xl:col-span-2 space-y-6">
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
                    <div className="flex flex-col">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, stats: moveItem(form.stats || [], i, 'up') })} disabled={i === 0}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, stats: moveItem(form.stats || [], i, 'down') })} disabled={i === (form.stats || []).length - 1}>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
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
                    <div className="flex gap-2 items-start">
                      <div className="flex flex-col">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, coreValues: moveItem(form.coreValues || [], i, 'up') })} disabled={i === 0}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, coreValues: moveItem(form.coreValues || [], i, 'down') })} disabled={i === (form.coreValues || []).length - 1}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
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
                    <div className="flex gap-2 items-center">
                      <div className="flex flex-col">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, milestones: moveItem(form.milestones || [], i, 'up') })} disabled={i === 0}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, milestones: moveItem(form.milestones || [], i, 'down') })} disabled={i === (form.milestones || []).length - 1}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
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
                      <div className="flex flex-col">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, testimonials: moveItem(form.testimonials || [], i, 'up') })} disabled={i === 0}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, testimonials: moveItem(form.testimonials || [], i, 'down') })} disabled={i === (form.testimonials || []).length - 1}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
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
                <div className="space-y-2">
                  {form.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                      <div className="flex flex-col">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, skills: moveItem(form.skills, i, 'up') })} disabled={i === 0}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setForm({ ...form, skills: moveItem(form.skills, i, 'down') })} disabled={i === form.skills.length - 1}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="flex-1">{skill}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeSkill(i)}>×</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Preview Section */}
            <div className="xl:col-span-1">
              <LivePreview title="Über mich-Vorschau">
                <div className="p-4 bg-background space-y-4">
                  {/* Profile Header */}
                  <div className="flex items-center gap-3">
                    {form.aboutImage ? (
                      <img src={form.aboutImage} alt={form.ownerName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{form.ownerName || 'Name'}</h3>
                      <p className="text-xs text-muted-foreground">{form.aboutTagline || 'Tagline'}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  {(form.stats || []).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-border">
                      {(form.stats || []).slice(0, 3).map((stat, i) => (
                        <div key={i} className="text-center">
                          <p className="text-sm font-bold text-primary">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Values */}
                  {(form.coreValues || []).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Werte:</p>
                      <div className="flex flex-wrap gap-1">
                        {(form.coreValues || []).slice(0, 3).map((val, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">{val.title}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {form.skills.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {form.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </LivePreview>
            </div>
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
              <div className="p-6 bg-background space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-xs">@</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">E-Mail</p>
                    <p className="text-sm text-foreground">{form.contactEmail || 'email@beispiel.ch'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-xs">📞</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefon</p>
                    <p className="text-sm text-foreground">{form.contactPhone || '+41 79 123 45 67'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-xs">📍</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Standort</p>
                    <p className="text-sm text-foreground">{form.contactLocation || 'Standort'}</p>
                  </div>
                </div>
                {(form.socialInstagram || form.socialLinkedin || form.socialTwitter || form.socialYoutube || form.socialTiktok || form.socialFacebook) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Social Media</p>
                    <div className="flex flex-wrap gap-2">
                      {form.socialInstagram && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Instagram className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      {form.socialLinkedin && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Linkedin className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      {form.socialTwitter && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Twitter className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      {form.socialYoutube && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Youtube className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      {form.socialTiktok && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-primary">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                        </div>
                      )}
                      {form.socialFacebook && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Facebook className="h-4 w-4 text-primary" />
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
              <div className="bg-background">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="font-bold text-primary text-sm">{form.companyName || 'Firmenname'}</span>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Home</span>
                    <span>Leistungen</span>
                    <span>Kontakt</span>
                  </div>
                </div>
                <div className="p-3 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground">{form.footerText || '© Footer Text'}</p>
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
                Sie können Markdown-Formatierung verwenden: **fett**, *kursiv*, ## Überschriften, - Listen
              </AlertDescription>
            </Alert>

            {/* Impressum Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Impressum-Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Firmensitz</label>
                    <Input
                      value={form.companyHeadquarters || ''}
                      onChange={(e) => setForm({ ...form, companyHeadquarters: e.target.value })}
                      placeholder="z.B. Les Acacias, Genf, Schweiz"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Handelsregister</label>
                    <Input
                      value={form.tradeRegistry || ''}
                      onChange={(e) => setForm({ ...form, tradeRegistry: e.target.value })}
                      placeholder="z.B. Handelsregister des Kantons Genf CH-660.0.059.996-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">UID- / MWSt-Nummer</label>
                  <Input
                    value={form.uidNumber || ''}
                    onChange={(e) => setForm({ ...form, uidNumber: e.target.value })}
                    placeholder="z.B. CHE-103.167.648"
                  />
                </div>

                {/* Führungskräfte */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Führungskräfte</label>
                  <div className="space-y-2">
                    {(form.executives || []).map((exec, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={exec.name}
                          onChange={(e) => {
                            const newExecs = [...(form.executives || [])];
                            newExecs[index] = { ...newExecs[index], name: e.target.value };
                            setForm({ ...form, executives: newExecs });
                          }}
                          placeholder="Name"
                          className="flex-1"
                        />
                        <Input
                          value={exec.position}
                          onChange={(e) => {
                            const newExecs = [...(form.executives || [])];
                            newExecs[index] = { ...newExecs[index], position: e.target.value };
                            setForm({ ...form, executives: newExecs });
                          }}
                          placeholder="Position (z.B. CEO)"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newExecs = (form.executives || []).filter((_, i) => i !== index);
                            setForm({ ...form, executives: newExecs });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newExecs = [...(form.executives || []), { name: '', position: '' }];
                      setForm({ ...form, executives: newExecs });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Führungskraft hinzufügen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Rechtliche Hinweise (Markdown)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="edit">Bearbeiten</TabsTrigger>
                    <TabsTrigger value="preview">Vorschau</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    <Textarea
                      value={form.impressumText}
                      onChange={(e) => setForm({ ...form, impressumText: e.target.value })}
                      placeholder="## Haftungsausschluss&#10;&#10;Der Autor übernimmt keinerlei Gewähr...&#10;&#10;## Urheberrechte&#10;&#10;Die Urheber- und alle anderen Rechte..."
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Markdown-Syntax: ## Überschrift, **fett**, *kursiv*, - Aufzählung, [Link](url)
                    </p>
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="border border-border rounded-lg p-4 min-h-[300px] bg-background">
                      {form.impressumText ? (
                        <MarkdownRenderer content={form.impressumText} />
                      ) : (
                        <p className="text-muted-foreground italic">Noch kein Text vorhanden...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Datenschutzerklärung - Vollständiger Text
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="edit">Bearbeiten</TabsTrigger>
                    <TabsTrigger value="preview">Vorschau</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    <Textarea
                      value={form.datenschutzText}
                      onChange={(e) => setForm({ ...form, datenschutzText: e.target.value })}
                      placeholder="## Datenerhebung&#10;&#10;Wir erheben folgende Daten:&#10;- Name&#10;- E-Mail-Adresse&#10;&#10;## Zweck der Verarbeitung&#10;&#10;**Wichtig:** Diese Daten werden..."
                      rows={20}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Markdown-Syntax: ## Überschrift, **fett**, *kursiv*, - Aufzählung, [Link](url)
                    </p>
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="border border-border rounded-lg p-4 min-h-[400px] bg-background">
                      {form.datenschutzText ? (
                        <MarkdownRenderer content={form.datenschutzText} />
                      ) : (
                        <p className="text-muted-foreground italic">Noch kein Text vorhanden...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="chatbot">
          <div className="mobile-stack">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI-Chatbot Einstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enable/Disable */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Chatbot aktivieren</Label>
                      <p className="text-sm text-muted-foreground">
                        Zeigt den Chat-Button unten rechts auf der Webseite an
                      </p>
                    </div>
                    <Switch
                      checked={form.chatbotSettings?.enabled ?? defaultChatbotSettings.enabled}
                      onCheckedChange={(checked) => setForm({
                        ...form,
                        chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, enabled: checked }
                      })}
                    />
                  </div>

                  {/* Appearance Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Erscheinung</h4>
                    
                    <div>
                      <Label>Begrüßungsnachricht</Label>
                      <Textarea
                        value={form.chatbotSettings?.welcomeMessage ?? defaultChatbotSettings.welcomeMessage}
                        onChange={(e) => setForm({
                          ...form,
                          chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, welcomeMessage: e.target.value }
                        })}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Platzhalter-Text im Eingabefeld</Label>
                      <Input
                        value={form.chatbotSettings?.placeholderText ?? defaultChatbotSettings.placeholderText}
                        onChange={(e) => setForm({
                          ...form,
                          chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, placeholderText: e.target.value }
                        })}
                      />
                    </div>

                    <div>
                      <Label>Vorgeschlagene Fragen (kommagetrennt)</Label>
                      <Input
                        value={(form.chatbotSettings?.suggestedQuestions ?? defaultChatbotSettings.suggestedQuestions).join(', ')}
                        onChange={(e) => setForm({
                          ...form,
                          chatbotSettings: { 
                            ...defaultChatbotSettings, 
                            ...form.chatbotSettings, 
                            suggestedQuestions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }
                        })}
                        placeholder="Frage 1, Frage 2, Frage 3"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Diese werden als Schnell-Buttons im Chat angezeigt
                      </p>
                    </div>
                  </div>

                  {/* Python Backend & Ollama Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Python Backend Konfiguration</h4>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="space-y-3">
                        <p><strong>Setup-Anleitung für den Chatbot:</strong></p>
                        <ol className="list-decimal list-inside text-xs space-y-2">
                          <li><strong>Python 3.8+</strong> installieren (falls nicht vorhanden)</li>
                          <li><strong>Ollama installieren:</strong>
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>Windows: <a href="https://ollama.com/download" target="_blank" rel="noopener" className="text-primary hover:underline">ollama.com/download</a></li>
                              <li>Linux/Mac: <code className="bg-secondary px-1 rounded">curl -fsSL https://ollama.com/install.sh | sh</code></li>
                            </ul>
                          </li>
                          <li><strong>Modell herunterladen (WICHTIG!):</strong>
                            <div className="mt-1 p-2 bg-destructive/10 rounded border border-destructive/20">
                              <code className="text-xs">ollama pull llama3.2:latest</code>
                              <p className="text-[10px] mt-1 text-destructive">⚠️ Ohne diesen Schritt erscheint: "model not found"</p>
                            </div>
                          </li>
                          <li><strong>Ollama starten:</strong> <code className="bg-secondary px-1 rounded">ollama serve</code></li>
                          <li><strong>Python-Server starten:</strong> <code className="bg-secondary px-1 rounded">python scripts/chatbot_server.py</code></li>
                        </ol>
                      </AlertDescription>
                    </Alert>

                    <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="space-y-2">
                        <p><strong>Häufige Fehler & Lösungen:</strong></p>
                        <ul className="text-xs space-y-2">
                          <li>
                            <strong>❌ "model not found" (404):</strong><br/>
                            → Modell wurde noch nicht heruntergeladen. Führe aus:<br/>
                            <code className="bg-background px-1 rounded">ollama pull {form.chatbotSettings?.ollamaModel || 'llama3.2:latest'}</code>
                          </li>
                          <li>
                            <strong>❌ "Connection refused" / "Failed to fetch":</strong><br/>
                            → Ollama läuft nicht. Starte mit: <code className="bg-background px-1 rounded">ollama serve</code>
                          </li>
                          <li>
                            <strong>❌ Langsame Antworten:</strong><br/>
                            → Wähle ein kleineres Modell wie <code className="bg-background px-1 rounded">llama3.2:1b</code> oder <code className="bg-background px-1 rounded">gemma2:2b</code>
                          </li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <p className="text-xs font-medium mb-2">📋 Verfügbare Modelle anzeigen:</p>
                      <code className="text-xs bg-background px-2 py-1 rounded block">ollama list</code>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Beliebte Modelle: llama3.2:latest, mistral:latest, gemma2:7b, phi3:latest, codellama:latest
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs font-medium mb-2">📁 Chatbot-Konfigurationsdateien:</p>
                      <ul className="text-xs space-y-1.5 text-muted-foreground">
                        <li>
                          <strong className="text-foreground">System-Prompt:</strong>{' '}
                          <code className="bg-secondary px-1 rounded">data/chatbot-system-prompt.md</code>
                          <br/>
                          <span className="text-[10px]">Enthält Verhaltensregeln, Tonalität und Antwortstruktur</span>
                        </li>
                        <li>
                          <strong className="text-foreground">Wissensbasis:</strong>{' '}
                          <code className="bg-secondary px-1 rounded">data/chatbot-wissensbasis.md</code>
                          <br/>
                          <span className="text-[10px]">Enthält alle Services, Preise, FAQs und Firmendaten</span>
                        </li>
                      </ul>
                      <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                        💡 Bearbeite diese Dateien direkt, um das Wissen und Verhalten des Chatbots anzupassen.
                      </p>
                    </div>

                    <div>
                      <Label>Python Chatbot-Server URL</Label>
                      <Input
                        value={form.chatbotSettings?.pythonServerUrl ?? defaultChatbotSettings.pythonServerUrl}
                        onChange={(e) => setForm({
                          ...form,
                          chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, pythonServerUrl: e.target.value }
                        })}
                        placeholder="http://localhost:8001"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        URL des Python-Backend-Servers. Standard: http://localhost:8001
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Ollama Server URL</Label>
                        <Input
                          value={form.chatbotSettings?.ollamaUrl ?? defaultChatbotSettings.ollamaUrl}
                          onChange={(e) => setForm({
                            ...form,
                            chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, ollamaUrl: e.target.value }
                          })}
                          placeholder="http://localhost:11434"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Wird vom Python-Server verwendet
                        </p>
                      </div>

                      <div>
                        <Label>Modell</Label>
                        <Input
                          value={form.chatbotSettings?.ollamaModel ?? defaultChatbotSettings.ollamaModel}
                          onChange={(e) => setForm({
                            ...form,
                            chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, ollamaModel: e.target.value }
                          })}
                          placeholder="llama3.2:latest"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          z.B. llama3.2:latest, mistral:latest, gemma2:7b
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Max. Tokens (Antwortlänge)</Label>
                        <Input
                          type="number"
                          min={100}
                          max={4096}
                          value={form.chatbotSettings?.maxTokens ?? defaultChatbotSettings.maxTokens}
                          onChange={(e) => setForm({
                            ...form,
                            chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, maxTokens: parseInt(e.target.value) || 1024 }
                          })}
                        />
                      </div>

                      <div>
                        <Label>Temperature (Kreativität)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={2}
                          step={0.1}
                          value={form.chatbotSettings?.temperature ?? defaultChatbotSettings.temperature}
                          onChange={(e) => setForm({
                            ...form,
                            chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, temperature: parseFloat(e.target.value) || 0.7 }
                          })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          0 = sehr präzise, 1 = kreativ, 2 = sehr kreativ
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Session-Verwaltung
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        <strong>Kontext-Beibehaltung:</strong> Der Chatbot behält den Konversationskontext während einer Chat-Sitzung bei. 
                        Bei einem Seiten-Reload wird eine neue Sitzung gestartet und der Kontext zurückgesetzt.
                        Sessions laufen nach 30 Minuten Inaktivität automatisch ab.
                      </p>
                    </div>
                  </div>

                  {/* System Prompt Addition */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">System-Prompt Konfiguration</h4>
                    
                    {/* Markdown File Upload */}
                    <div className="space-y-2">
                      <Label>System-Prompt aus Markdown-Datei</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept=".md,.txt,.markdown"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const content = event.target?.result as string;
                                setForm({
                                  ...form,
                                  chatbotSettings: { 
                                    ...defaultChatbotSettings, 
                                    ...form.chatbotSettings, 
                                    systemPromptMarkdown: content,
                                    systemPromptFileName: file.name
                                  }
                                });
                                toast.success(`Datei "${file.name}" geladen`);
                              };
                              reader.readAsText(file);
                            }
                          }}
                          className="flex-1"
                        />
                        {form.chatbotSettings?.systemPromptFileName && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setForm({
                              ...form,
                              chatbotSettings: { 
                                ...defaultChatbotSettings, 
                                ...form.chatbotSettings, 
                                systemPromptMarkdown: '',
                                systemPromptFileName: ''
                              }
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {form.chatbotSettings?.systemPromptFileName && (
                        <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{form.chatbotSettings.systemPromptFileName}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {form.chatbotSettings?.systemPromptMarkdown?.length || 0} Zeichen
                          </Badge>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Lade eine .md oder .txt Datei hoch, die als vollständiger System-Prompt verwendet wird. Dies ersetzt den Standard-Prompt vollständig.
                      </p>
                    </div>

                    {/* Preview of uploaded markdown */}
                    {form.chatbotSettings?.systemPromptMarkdown && (
                      <div className="space-y-2">
                        <Label>Vorschau des geladenen Prompts</Label>
                        <div className="max-h-40 overflow-y-auto p-3 bg-secondary/30 rounded-lg border text-xs font-mono whitespace-pre-wrap">
                          {form.chatbotSettings.systemPromptMarkdown.substring(0, 500)}
                          {(form.chatbotSettings.systemPromptMarkdown.length || 0) > 500 && '...'}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Zusätzlicher System-Prompt</Label>
                      <Textarea
                        value={form.chatbotSettings?.systemPromptAddition ?? defaultChatbotSettings.systemPromptAddition}
                        onChange={(e) => setForm({
                          ...form,
                          chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, systemPromptAddition: e.target.value }
                        })}
                        rows={4}
                        placeholder="Zusätzliche Anweisungen für den Chatbot, z.B. spezielle Verhaltensregeln oder Informationen..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {form.chatbotSettings?.systemPromptMarkdown 
                          ? 'Diese Anweisungen werden am Ende des hochgeladenen Prompts hinzugefügt'
                          : 'Diese Anweisungen werden zum Standard-Prompt hinzugefügt'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <LivePreview title="Chat-Vorschau">
              <div className="p-4 bg-background rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{form.companyName} Assistent</p>
                      <p className="text-xs text-muted-foreground">
                        {form.chatbotSettings?.enabled ?? defaultChatbotSettings.enabled ? 'Aktiv' : 'Deaktiviert'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={form.chatbotSettings?.enabled ?? defaultChatbotSettings.enabled ? 'default' : 'secondary'}>
                    {form.chatbotSettings?.enabled ?? defaultChatbotSettings.enabled ? 'An' : 'Aus'}
                  </Badge>
                </div>
                
                <div className="text-center py-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {form.chatbotSettings?.welcomeMessage ?? defaultChatbotSettings.welcomeMessage}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {(form.chatbotSettings?.suggestedQuestions ?? defaultChatbotSettings.suggestedQuestions).map((q, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-full bg-secondary">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-2 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">
                    {form.chatbotSettings?.placeholderText ?? defaultChatbotSettings.placeholderText}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Python-Server:</span> {form.chatbotSettings?.pythonServerUrl ?? defaultChatbotSettings.pythonServerUrl}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Ollama:</span> {form.chatbotSettings?.ollamaUrl ?? defaultChatbotSettings.ollamaUrl}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Modell:</span> {form.chatbotSettings?.ollamaModel ?? defaultChatbotSettings.ollamaModel}
                  </p>
                </div>
              </div>
            </LivePreview>
          </div>
        </TabsContent>

        <TabsContent value="theme">
          <ThemeManager />
        </TabsContent>

        <TabsContent value="backup">
          <BackupRestore />
        </TabsContent>

        <TabsContent value="cookies">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5" />
                  Cookie-Banner Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cookie-Banner aktiviert</Label>
                    <p className="text-sm text-muted-foreground">
                      Zeigt den Cookie-Consent-Banner für neue Besucher
                    </p>
                  </div>
                  <Switch
                    checked={form.cookieSettings?.enabled ?? defaultCookieSettings.enabled}
                    onCheckedChange={(checked) => setForm({
                      ...form,
                      cookieSettings: {
                        ...defaultCookieSettings,
                        ...form.cookieSettings,
                        enabled: checked
                      }
                    })}
                  />
                </div>

                {/* Texts */}
                <div className="space-y-4">
                  <div>
                    <Label>Titel</Label>
                    <Input
                      value={form.cookieSettings?.title ?? defaultCookieSettings.title}
                      onChange={(e) => setForm({
                        ...form,
                        cookieSettings: {
                          ...defaultCookieSettings,
                          ...form.cookieSettings,
                          title: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={form.cookieSettings?.description ?? defaultCookieSettings.description}
                      onChange={(e) => setForm({
                        ...form,
                        cookieSettings: {
                          ...defaultCookieSettings,
                          ...form.cookieSettings,
                          description: e.target.value
                        }
                      })}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Button Texts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Akzeptieren-Button</Label>
                    <Input
                      value={form.cookieSettings?.acceptAllText ?? defaultCookieSettings.acceptAllText}
                      onChange={(e) => setForm({
                        ...form,
                        cookieSettings: {
                          ...defaultCookieSettings,
                          ...form.cookieSettings,
                          acceptAllText: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Ablehnen-Button</Label>
                    <Input
                      value={form.cookieSettings?.rejectText ?? defaultCookieSettings.rejectText}
                      onChange={(e) => setForm({
                        ...form,
                        cookieSettings: {
                          ...defaultCookieSettings,
                          ...form.cookieSettings,
                          rejectText: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Mehr erfahren-Button</Label>
                    <Input
                      value={form.cookieSettings?.moreInfoText ?? defaultCookieSettings.moreInfoText}
                      onChange={(e) => setForm({
                        ...form,
                        cookieSettings: {
                          ...defaultCookieSettings,
                          ...form.cookieSettings,
                          moreInfoText: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>

                {/* Position & Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Position</Label>
                    <Select
                      value={form.cookieSettings?.position ?? defaultCookieSettings.position}
                      onValueChange={(value: 'bottom' | 'top' | 'center') => setForm({
                        ...form,
                        cookieSettings: {
                          ...defaultCookieSettings,
                          ...form.cookieSettings,
                          position: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom">Unten</SelectItem>
                        <SelectItem value="top">Oben</SelectItem>
                        <SelectItem value="center">Mitte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Stil</Label>
                    <Select
                      value={form.cookieSettings?.style ?? defaultCookieSettings.style}
                      onValueChange={(value: 'minimal' | 'detailed' | 'floating') => setForm({
                        ...form,
                        cookieSettings: {
                          ...defaultCookieSettings,
                          ...form.cookieSettings,
                          style: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="detailed">Detailliert</SelectItem>
                        <SelectItem value="floating">Schwebend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Detailed Info Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Details anzeigen</Label>
                    <p className="text-sm text-muted-foreground">
                      Ermöglicht Besuchern, Details zu erfassten Daten anzusehen
                    </p>
                  </div>
                  <Switch
                    checked={form.cookieSettings?.showDetailedInfo ?? defaultCookieSettings.showDetailedInfo}
                    onCheckedChange={(checked) => setForm({
                      ...form,
                      cookieSettings: {
                        ...defaultCookieSettings,
                        ...form.cookieSettings,
                        showDetailedInfo: checked
                      }
                    })}
                  />
                </div>

                {/* Tracking Options - Linked to Analytics */}
                <div>
                  <Label className="mb-2 block">Tracking-Optionen (direkt mit Analytics verknüpft)</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Aktivierte Optionen werden getrackt und in Analytics angezeigt. Deaktivierte werden weder erfasst noch angezeigt.
                  </p>
                  <div className="space-y-3">
                    {ALL_TRACKING_OPTIONS.map((option) => {
                      const currentOptions = form.cookieSettings?.trackingOptions ?? defaultCookieSettings.trackingOptions;
                      const isEnabled = currentOptions.find(opt => opt.id === option.id)?.enabled ?? option.enabled;
                      
                      return (
                        <div key={option.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => {
                              const existingOptions = form.cookieSettings?.trackingOptions ?? defaultCookieSettings.trackingOptions;
                              const existingOption = existingOptions.find(opt => opt.id === option.id);
                              
                              let newOptions: TrackingConfig[];
                              if (existingOption) {
                                newOptions = existingOptions.map(opt =>
                                  opt.id === option.id ? { ...opt, enabled: checked } : opt
                                );
                              } else {
                                newOptions = [...existingOptions, { ...option, enabled: checked }];
                              }
                              
                              setForm({
                                ...form,
                                cookieSettings: {
                                  ...defaultCookieSettings,
                                  ...form.cookieSettings,
                                  trackingOptions: newOptions
                                }
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-muted/30 rounded-lg p-4 min-h-[200px] flex items-end justify-center">
                  <div className="w-full max-w-lg bg-background/95 backdrop-blur border rounded-lg p-4 shadow-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Cookie className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm">{form.cookieSettings?.title ?? defaultCookieSettings.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {form.cookieSettings?.description ?? defaultCookieSettings.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="h-7 text-xs">
                            {form.cookieSettings?.acceptAllText ?? defaultCookieSettings.acceptAllText}
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            {form.cookieSettings?.rejectText ?? defaultCookieSettings.rejectText}
                          </Button>
                          {(form.cookieSettings?.showDetailedInfo ?? defaultCookieSettings.showDetailedInfo) && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              {form.cookieSettings?.moreInfoText ?? defaultCookieSettings.moreInfoText}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab - consolidated from: general, legal, integrations, chatbot, cookies, promotions, partners */}
        <TabsContent value="system">
          <div className="space-y-6">
            {/* General Section */}
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

            {/* Partner Section */}
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
                {(form.partners || []).map((partner, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg flex gap-3 items-center">
                    <img src={partner.logo} alt={partner.name || 'Partner'} className="w-12 h-12 rounded-lg object-contain bg-secondary" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={partner.name}
                        onChange={(e) => {
                          const newPartners = [...(form.partners || [])];
                          newPartners[i] = { ...newPartners[i], name: e.target.value };
                          setForm({ ...form, partners: newPartners });
                        }}
                        placeholder="Partner-Name"
                      />
                      <Input
                        value={partner.link || ''}
                        onChange={(e) => {
                          const newPartners = [...(form.partners || [])];
                          newPartners[i] = { ...newPartners[i], link: e.target.value };
                          setForm({ ...form, partners: newPartners });
                        }}
                        placeholder="Website-Link (optional)"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setForm({ ...form, partners: (form.partners || []).filter((_, idx) => idx !== i) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!form.partners || form.partners.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Keine Partner vorhanden</p>
                )}
              </CardContent>
            </Card>

            {/* Legal Section - Simplified */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Rechtliches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Firmensitz</label>
                    <Input
                      value={form.companyHeadquarters || ''}
                      onChange={(e) => setForm({ ...form, companyHeadquarters: e.target.value })}
                      placeholder="z.B. Zürich, Schweiz"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">UID- / MWSt-Nummer</label>
                    <Input
                      value={form.uidNumber || ''}
                      onChange={(e) => setForm({ ...form, uidNumber: e.target.value })}
                      placeholder="z.B. CHE-103.167.648"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Impressum-Text (Markdown)</label>
                  <Textarea
                    value={form.impressumText}
                    onChange={(e) => setForm({ ...form, impressumText: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                    placeholder="## Haftungsausschluss..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Datenschutztext (Markdown)</label>
                  <Textarea
                    value={form.datenschutzText}
                    onChange={(e) => setForm({ ...form, datenschutzText: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                    placeholder="## Datenerhebung..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Chatbot Section - Simplified */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Chatbot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Chatbot aktiviert</Label>
                    <p className="text-sm text-muted-foreground">Zeigt den Chat-Assistenten auf der Website</p>
                  </div>
                  <Switch
                    checked={form.chatbotSettings?.enabled ?? defaultChatbotSettings.enabled}
                    onCheckedChange={(checked) => setForm({
                      ...form,
                      chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, enabled: checked }
                    })}
                  />
                </div>
                <div>
                  <Label>Willkommensnachricht</Label>
                  <Input
                    value={form.chatbotSettings?.welcomeMessage ?? defaultChatbotSettings.welcomeMessage}
                    onChange={(e) => setForm({
                      ...form,
                      chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, welcomeMessage: e.target.value }
                    })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Python-Server URL</Label>
                    <Input
                      value={form.chatbotSettings?.pythonServerUrl ?? defaultChatbotSettings.pythonServerUrl}
                      onChange={(e) => setForm({
                        ...form,
                        chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, pythonServerUrl: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Ollama Modell</Label>
                    <Input
                      value={form.chatbotSettings?.ollamaModel ?? defaultChatbotSettings.ollamaModel}
                      onChange={(e) => setForm({
                        ...form,
                        chatbotSettings: { ...defaultChatbotSettings, ...form.chatbotSettings, ollamaModel: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Settings - Simplified */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5" />
                  Cookie-Banner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cookie-Banner aktiviert</Label>
                    <p className="text-sm text-muted-foreground">Zeigt den Cookie-Consent-Banner für neue Besucher</p>
                  </div>
                  <Switch
                    checked={form.cookieSettings?.enabled ?? defaultCookieSettings.enabled}
                    onCheckedChange={(checked) => setForm({
                      ...form,
                      cookieSettings: { ...defaultCookieSettings, ...form.cookieSettings, enabled: checked }
                    })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Titel</Label>
                    <Input
                      value={form.cookieSettings?.title ?? defaultCookieSettings.title}
                      onChange={(e) => setForm({
                        ...form,
                        cookieSettings: { ...defaultCookieSettings, ...form.cookieSettings, title: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Select
                      value={form.cookieSettings?.position ?? defaultCookieSettings.position}
                      onValueChange={(value: 'bottom' | 'top' | 'center') => setForm({
                        ...form,
                        cookieSettings: { ...defaultCookieSettings, ...form.cookieSettings, position: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom">Unten</SelectItem>
                        <SelectItem value="top">Oben</SelectItem>
                        <SelectItem value="center">Mitte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Server/API Configuration - for self-hosting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Server-Konfiguration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Server URL (für Self-Hosting)</Label>
                  <Input
                    value={form.apiBaseUrl || ''}
                    onChange={(e) => setForm({ ...form, apiBaseUrl: e.target.value })}
                    placeholder="https://kernel_website.floriskern.ch"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Gib deine Domain ein, wenn du die Website selbst hostest. Leer lassen für lokale Entwicklung.
                  </p>
                </div>
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
