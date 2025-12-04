import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Tag, Copy, Eye, EyeOff, Calendar, Percent, Gift, Zap, GraduationCap } from 'lucide-react';
import { Promotion, PROMOTION_TEMPLATES } from '@/types/promotion';
import { toast } from 'sonner';

interface PromotionManagerProps {
  promotions: Promotion[];
  onChange: (promotions: Promotion[]) => void;
}

const iconOptions = [
  { value: 'Percent', label: 'Prozent', icon: Percent },
  { value: 'Zap', label: 'Blitz', icon: Zap },
  { value: 'GraduationCap', label: 'Student', icon: GraduationCap },
  { value: 'Gift', label: 'Geschenk', icon: Gift },
  { value: 'Tag', label: 'Tag', icon: Tag },
];

export function PromotionManager({ promotions, onChange }: PromotionManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addPromotion = () => {
    const newPromo: Promotion = {
      id: `promo_${Date.now()}`,
      name: 'Neue Aktion',
      description: 'Beschreibung der Aktion',
      discountCode: `CODE${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      discountPercent: 10,
      discountType: 'percent',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: false,
      showInBanner: true,
      template: 'custom',
      priority: promotions.length + 1
    };
    onChange([...promotions, newPromo]);
    setExpandedId(newPromo.id);
    toast.success('Neue Aktion erstellt');
  };

  const updatePromotion = (id: string, updates: Partial<Promotion>) => {
    onChange(promotions.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePromotion = (id: string) => {
    onChange(promotions.filter(p => p.id !== id));
    toast.success('Aktion gelöscht');
  };

  const duplicatePromotion = (promo: Promotion) => {
    const newPromo: Promotion = {
      ...promo,
      id: `promo_${Date.now()}`,
      name: `${promo.name} (Kopie)`,
      discountCode: `${promo.discountCode}_COPY`,
      isActive: false,
      priority: promotions.length + 1
    };
    onChange([...promotions, newPromo]);
    toast.success('Aktion dupliziert');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code kopiert!');
  };

  const isPromotionValid = (promo: Promotion): boolean => {
    const now = new Date();
    const from = new Date(promo.validFrom);
    const until = new Date(promo.validUntil);
    until.setHours(23, 59, 59, 999);
    return now >= from && now <= until;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Aktionen & Rabattcodes
            </span>
            <Button variant="outline" size="sm" onClick={addPromotion}>
              <Plus className="h-4 w-4 mr-1" /> Neue Aktion
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Aktionen wie Black Friday, Studentenrabatte oder saisonale Angebote. 
            Aktive Banner werden oben auf der Seite angezeigt und die Codes können im Kontaktformular eingegeben werden.
          </p>

          {promotions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <Tag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Keine Aktionen vorhanden</p>
              <Button variant="outline" size="sm" onClick={addPromotion}>
                <Plus className="h-4 w-4 mr-1" /> Erste Aktion erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {promotions.map((promo) => {
                const isExpanded = expandedId === promo.id;
                const isValid = isPromotionValid(promo);
                const template = PROMOTION_TEMPLATES[promo.template];
                
                return (
                  <div 
                    key={promo.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    {/* Header */}
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : promo.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: promo.isActive && isValid ? '#22c55e' : '#6b7280' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{promo.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {template.label}
                            </Badge>
                            {!isValid && promo.isActive && (
                              <Badge variant="destructive" className="text-xs">
                                Abgelaufen
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">
                              {promo.discountCode}
                            </code>
                            <span>-{promo.discountPercent}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyCode(promo.discountCode);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={promo.isActive}
                          onCheckedChange={(checked) => {
                            updatePromotion(promo.id, { isActive: checked });
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-border bg-secondary/30 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={promo.name}
                              onChange={(e) => updatePromotion(promo.id, { name: e.target.value })}
                              placeholder="z.B. Black Friday Deal"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Input
                              value={promo.description}
                              onChange={(e) => updatePromotion(promo.id, { description: e.target.value })}
                              placeholder="z.B. 30% auf alle Pakete"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Rabattcode</Label>
                            <Input
                              value={promo.discountCode}
                              onChange={(e) => updatePromotion(promo.id, { discountCode: e.target.value.toUpperCase() })}
                              placeholder="z.B. BLACKFRIDAY30"
                              className="font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rabatt (%)</Label>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              value={promo.discountPercent}
                              onChange={(e) => updatePromotion(promo.id, { discountPercent: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Vorlage</Label>
                            <Select 
                              value={promo.template}
                              onValueChange={(value: Promotion['template']) => updatePromotion(promo.id, { template: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(PROMOTION_TEMPLATES).map(([key, t]) => (
                                  <SelectItem key={key} value={key}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Gültig von
                            </Label>
                            <Input
                              type="date"
                              value={promo.validFrom}
                              onChange={(e) => updatePromotion(promo.id, { validFrom: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Gültig bis
                            </Label>
                            <Input
                              type="date"
                              value={promo.validUntil}
                              onChange={(e) => updatePromotion(promo.id, { validUntil: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`banner-${promo.id}`}
                                checked={promo.showInBanner}
                                onCheckedChange={(checked) => updatePromotion(promo.id, { showInBanner: checked })}
                              />
                              <Label htmlFor={`banner-${promo.id}`} className="flex items-center gap-1 cursor-pointer">
                                {promo.showInBanner ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                Im Banner anzeigen
                              </Label>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => duplicatePromotion(promo)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Duplizieren
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deletePromotion(promo.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Löschen
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {promotions.some(p => p.isActive && p.showInBanner) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Banner-Vorschau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden">
              {promotions
                .filter(p => p.isActive && p.showInBanner)
                .slice(0, 1)
                .map(promo => {
                  const template = PROMOTION_TEMPLATES[promo.template];
                  return (
                    <div 
                      key={promo.id}
                      className="relative py-2.5 px-4 text-center"
                      style={{ 
                        backgroundColor: promo.backgroundColor || template.defaultBg,
                        color: promo.textColor || template.defaultText
                      }}
                    >
                      <span className="font-medium">{promo.name}: </span>
                      <span className="opacity-90">{promo.description}</span>
                      <code 
                        className="ml-2 px-2 py-0.5 rounded-full font-mono font-bold text-sm"
                        style={{ 
                          backgroundColor: promo.accentColor || template.defaultAccent,
                          color: promo.backgroundColor || template.defaultBg
                        }}
                      >
                        {promo.discountCode}
                      </code>
                    </div>
                  );
                })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {promotions.filter(p => p.isActive && p.showInBanner).length > 1 && 
                `${promotions.filter(p => p.isActive && p.showInBanner).length} aktive Banner werden automatisch durchgewechselt`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
