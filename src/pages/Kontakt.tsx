import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/contexts/ContentContext";
import { PackageSelector } from "@/components/PackageSelector";
import { Mail, Phone, MapPin, Send, CheckCircle, Instagram, Linkedin, Twitter, Youtube, Facebook, Paperclip, X, FileText, Image as ImageIcon, Package, Tag, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { Inquiry, InquiryAttachment, INQUIRY_TYPES, BUDGET_RANGES } from "@/types/inquiry";
import { Promotion } from "@/types/promotion";
import { validateDiscountCode } from "@/components/PromoBanner";
import { 
  MAX_FILE_SIZE, 
  MAX_FILES, 
  ALLOWED_TYPES, 
  fileToBase64, 
  formatFileSize,
  getFileTypeLabel 
} from "@/lib/attachmentUtils";
import { sanitizeText, INPUT_LIMITS } from "@/lib/security";

const contactSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben").max(100, "Name darf maximal 100 Zeichen haben"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  phone: z.string().optional(),
  company: z.string().optional(),
  inquiryType: z.string().optional(),
  budget: z.string().optional(),
  selectedPackage: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Nachricht muss mindestens 10 Zeichen haben").max(5000, "Nachricht darf maximal 5000 Zeichen haben"),
  discountCode: z.string().optional()
});

/**
 * ============================================================================
 * AI NOTES: PACKAGE SELECTION IN CONTACT FORM
 * ============================================================================
 * 
 * This form supports pre-filling from URL parameters when coming from Leistungen:
 * - ?product=ProductName - Pre-selects the product
 * - ?productPrice=CHF 120-350 - Product price range
 * - ?package=Basic - Pre-selects specific package/tier
 * - ?packagePrice=CHF 120-180 - Package price
 * - ?packageDescription=Description - Package description
 * 
 * The selectedPackage is sent to Notion as a multi-select field.
 * Format: "ProductName - PackageName (Price)"
 * 
 * To add new form fields:
 * 1. Add field to formData state
 * 2. Add to contactSchema validation
 * 3. Add UI element in form
 * 4. Update handleSubmit to include in Notion payload
 * ============================================================================
 */

export default function Kontakt() {
  const { toast } = useToast();
  const { settings, products, categories } = useContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<InquiryAttachment[]>([]);
  
  // Pre-filled product/package from URL params
  const prefilledProduct = searchParams.get('product');
  const prefilledProductPrice = searchParams.get('productPrice');
  const prefilledPackage = searchParams.get('package');
  const prefilledPackagePrice = searchParams.get('packagePrice');
  const prefilledPackageDescription = searchParams.get('packageDescription');
  
  // Build package selection string if pre-filled
  const getPrefilledPackageString = () => {
    if (prefilledProduct && prefilledPackage && prefilledPackagePrice) {
      return `${prefilledProduct} - ${prefilledPackage} (${prefilledPackagePrice})`;
    }
    if (prefilledProduct && prefilledProductPrice) {
      return `${prefilledProduct} (${prefilledProductPrice})`;
    }
    return "";
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: prefilledProduct ? "project" : "",
    budget: "",
    selectedPackage: getPrefilledPackageString(),
    subject: prefilledProduct ? `Anfrage: ${prefilledProduct}${prefilledPackage ? ` - ${prefilledPackage}` : ''}` : "",
    message: "",
    discountCode: "",
    honeypot: ""
  });

  // Discount code validation
  const [validatedPromo, setValidatedPromo] = useState<Promotion | null>(null);
  const promotions: Promotion[] = settings.promotions || [];

  // Published products for PackageSelector
  const publishedProducts = products.filter(p => p.status === 'published');

  // Auto-set budget based on selected package price
  useEffect(() => {
    if (formData.selectedPackage) {
      // Extract price from package string, e.g. "Product - Package (CHF 120-180)"
      const priceMatch = formData.selectedPackage.match(/\(([^)]+)\)$/);
      if (priceMatch) {
        const priceStr = priceMatch[1];
        // Try to determine budget range from price
        const numMatch = priceStr.match(/(\d+)/);
        if (numMatch) {
          const price = parseInt(numMatch[1]);
          let budgetValue = "";
          if (price < 1000) budgetValue = "under-1k";
          else if (price < 5000) budgetValue = "1k-5k";
          else if (price < 10000) budgetValue = "5k-10k";
          else budgetValue = "10k-plus";
          
          // Only auto-set if budget is not manually selected
          if (!formData.budget || formData.budget === "") {
            setFormData(prev => ({ ...prev, budget: budgetValue }));
          }
        }
      }
    }
  }, [formData.selectedPackage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearPackageSelection = () => {
    setFormData(prev => ({ ...prev, selectedPackage: "", subject: "" }));
    // Clear URL params
    setSearchParams({});
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: InquiryAttachment[] = [];
    
    for (const file of Array.from(files)) {
      if (attachments.length + newAttachments.length >= MAX_FILES) {
        toast({
          title: "Maximum erreicht",
          description: `Maximal ${MAX_FILES} Dateien erlaubt.`,
          variant: "destructive",
        });
        break;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Datei zu groß",
          description: `${file.name} ist größer als 10 MB.`,
          variant: "destructive",
        });
        continue;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Dateityp nicht erlaubt",
          description: `${file.name} hat einen nicht unterstützten Dateityp.`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newAttachments.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
        });
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.honeypot) {
      return;
    }

    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Sanitize all text inputs before storing to prevent XSS
    const newInquiry: Inquiry = {
      id: crypto.randomUUID(),
      name: sanitizeText(formData.name.slice(0, INPUT_LIMITS.name)),
      email: formData.email.toLowerCase().trim().slice(0, INPUT_LIMITS.email),
      phone: formData.phone ? sanitizeText(formData.phone.slice(0, INPUT_LIMITS.phone)) : undefined,
      company: formData.company ? sanitizeText(formData.company.slice(0, INPUT_LIMITS.shortText)) : undefined,
      inquiryType: formData.inquiryType || undefined,
      budget: formData.budget || undefined,
      subject: formData.subject ? sanitizeText(formData.subject.slice(0, INPUT_LIMITS.shortText)) : undefined,
      message: sanitizeText(formData.message.slice(0, INPUT_LIMITS.longText)),
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: new Date().toISOString(),
      read: false,
      replied: false,
      // Discount code info
      discountCode: validatedPromo?.discountCode,
      discountCodeValid: !!validatedPromo,
      discountPercent: validatedPromo?.discountPercent,
      discountConfirmed: false, // Admin confirms later
    };

    // Save locally first
    const existingInquiries = getStorageItem<Inquiry[]>('cms_inquiries', []);
    setStorageItem('cms_inquiries', [...existingInquiries, newInquiry]);

    // Try to send to Notion if enabled
    if (settings.notionEnabled && settings.notionDatabaseId && settings.notionApiKey) {
      try {
        // Generate the admin inquiry link - use configured base URL or current origin
        const siteBaseUrl = settings.apiBaseUrl?.replace(/\/$/, '') || window.location.origin;
        const inquiryLink = `${siteBaseUrl}/admin/inquiries/${newInquiry.id}`;
        
        console.log('📧 Sending to Notion with inquiry link:', inquiryLink);
        
        const apiBaseUrl = settings.apiBaseUrl?.replace(/\/$/, '') || '';
        const notionPayload = {
          name: newInquiry.name,
          email: newInquiry.email,
          phone: newInquiry.phone,
          company: newInquiry.company,
          inquiryType: formData.inquiryType ? 
            INQUIRY_TYPES.find(t => t.value === formData.inquiryType)?.label || formData.inquiryType : undefined,
          budget: formData.budget ?
            BUDGET_RANGES.find(b => b.value === formData.budget)?.label || formData.budget : undefined,
          selectedPackage: formData.selectedPackage || undefined,
          subject: newInquiry.subject,
          message: newInquiry.message,
          hasAttachments: attachments.length > 0,
          inquiryLink: inquiryLink,
          notionDatabaseId: settings.notionDatabaseId,
          notionApiKey: settings.notionApiKey,
        };
        
        console.log('📤 Notion payload:', JSON.stringify(notionPayload, null, 2));
        
        const response = await fetch(`${apiBaseUrl}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notionPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn('Notion sync failed:', errorText);
        } else {
          console.log('✅ Notion sync successful');
        }
      } catch (error) {
        console.warn('Notion API not reachable, but local save succeeded:', error);
      }
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    toast({
      title: "Nachricht gesendet!",
      description: "Vielen Dank für Ihre Anfrage. Ich melde mich schnellstmöglich bei Ihnen.",
    });
  };

  const getAttachmentIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (isSuccess) {
    return (
      <Layout pageTitle="Kontakt" pageDescription="Kontaktieren Sie uns für eine unverbindliche Beratung zu Ihrem Projekt.">
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">
                Vielen Dank!
              </h1>
              <p className="text-muted-foreground mb-8">
                Ihre Nachricht wurde erfolgreich gesendet. Ich melde mich 
                schnellstmöglich bei Ihnen – in der Regel innerhalb von 24 Stunden.
              </p>
              <Button onClick={() => {
                setIsSuccess(false);
                setAttachments([]);
                setSearchParams({});
                setValidatedPromo(null);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  company: "",
                  inquiryType: "",
                  budget: "",
                  selectedPackage: "",
                  subject: "",
                  message: "",
                  discountCode: "",
                  honeypot: ""
                });
              }}>
                Weitere Nachricht senden
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Kontakt" pageDescription="Kontaktieren Sie uns für eine unverbindliche Beratung zu Ihrem Projekt.">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Kontakt</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Sie haben ein Projekt im Kopf oder eine Frage? Schreiben Sie mir – 
              ich freue mich auf Ihre Nachricht.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-display text-xl font-bold mb-6">Kontaktdaten</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">E-Mail</p>
                    <a 
                      href={`mailto:${settings.contactEmail}`} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Telefon</p>
                    <a 
                      href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {settings.contactPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Standort</p>
                    <p className="text-muted-foreground">{settings.contactLocation}</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              {(settings.socialInstagram || settings.socialLinkedin || settings.socialTwitter || settings.socialYoutube || settings.socialTiktok || settings.socialFacebook) && (
                <div className="mt-8">
                  <h3 className="font-display text-lg font-semibold mb-4">Social Media</h3>
                  <div className="flex flex-wrap gap-3">
                    {settings.socialInstagram && (
                      <a
                        href={settings.socialInstagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {settings.socialLinkedin && (
                      <a
                        href={settings.socialLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {settings.socialTwitter && (
                      <a
                        href={settings.socialTwitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {settings.socialYoutube && (
                      <a
                        href={settings.socialYoutube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {settings.socialTiktok && (
                      <a
                        href={settings.socialTiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                        title="TikTok"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                      </a>
                    )}
                    {settings.socialFacebook && (
                      <a
                        href={settings.socialFacebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Reaktionszeit</h3>
                  <p className="text-sm text-muted-foreground">
                    Ich antworte in der Regel innerhalb von 24 Stunden. 
                    Bei dringenden Anfragen erreichen Sie mich auch telefonisch.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-display text-xl font-bold mb-6">Nachricht senden</h2>
                  
                  {/* Pre-filled Package Banner */}
                  {formData.selectedPackage && (
                    <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Package className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Ausgewähltes Paket</p>
                            <p className="text-primary font-semibold">{formData.selectedPackage}</p>
                            {prefilledPackageDescription && (
                              <p className="text-sm text-muted-foreground mt-1">{prefilledPackageDescription}</p>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={clearPackageSelection}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                      type="text"
                      name="honeypot"
                      value={formData.honeypot}
                      onChange={handleChange}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ihr Name"
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="ihre@email.ch"
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone & Company */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon (optional)</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+41 79 123 45 67"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Firma (optional)</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Ihre Firma"
                        />
                      </div>
                    </div>

                    {/* Package Selection */}
                    <div className="space-y-2">
                      <Label>Produkt / Paket (optional)</Label>
                      <PackageSelector
                        products={publishedProducts}
                        categories={categories}
                        value={formData.selectedPackage}
                        onChange={(value) => handleSelectChange('selectedPackage', value)}
                        defaultCollapsed={!!prefilledProduct}
                      />
                    </div>

                    {/* Inquiry Type */}
                    <div className="space-y-2">
                      <Label>Art der Anfrage (optional)</Label>
                      <Select 
                        value={formData.inquiryType} 
                        onValueChange={(value) => handleSelectChange('inquiryType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bitte wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {INQUIRY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Budget (shown if no package selected, or always visible) */}
                    <div className="space-y-2">
                      <Label>
                        Budget (optional)
                        {formData.selectedPackage && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (automatisch vom Paket übernommen)
                          </span>
                        )}
                      </Label>
                      <Select 
                        value={formData.budget} 
                        onValueChange={(value) => handleSelectChange('budget', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bitte wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUDGET_RANGES.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Betreff (optional)</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Worum geht es?"
                      />
                    </div>

                    {/* Discount Code */}
                    <div className="space-y-2">
                      <Label htmlFor="discountCode" className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Rabattcode (optional)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="discountCode"
                          name="discountCode"
                          value={formData.discountCode}
                          onChange={(e) => {
                            handleChange(e);
                            // Validate on change
                            const promo = validateDiscountCode(e.target.value, promotions);
                            setValidatedPromo(promo);
                          }}
                          placeholder="z.B. STUDENT40"
                          className={validatedPromo ? "border-green-500" : ""}
                        />
                        {validatedPromo && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-md text-green-500 text-sm font-medium whitespace-nowrap">
                            <CheckCircle2 className="h-4 w-4" />
                            -{validatedPromo.discountPercent}%
                          </div>
                        )}
                      </div>
                      {validatedPromo && (
                        <p className="text-sm text-green-500 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {validatedPromo.name}: {validatedPromo.description}
                        </p>
                      )}
                      {formData.discountCode && !validatedPromo && (
                        <p className="text-sm text-muted-foreground">
                          Code nicht gefunden oder abgelaufen
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Nachricht *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Beschreiben Sie Ihr Anliegen..."
                        rows={6}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>

                    {/* File Attachments */}
                    <div className="space-y-3">
                      <Label>Anhänge (optional)</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={attachments.length >= MAX_FILES}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Dateien hinzufügen
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {attachments.length}/{MAX_FILES} Dateien (max. 10 MB pro Datei)
                        </span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        Erlaubte Formate: Bilder, PDF, Word, Excel, PowerPoint, Text
                      </p>

                      {/* Attachment List */}
                      {attachments.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {getAttachmentIcon(attachment.type)}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {getFileTypeLabel(attachment.type)} • {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(attachment.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Nachricht senden
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
