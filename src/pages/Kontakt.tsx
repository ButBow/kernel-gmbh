import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/contexts/ContentContext";
import { Mail, Phone, MapPin, Send, CheckCircle, Instagram, Linkedin, Twitter, Youtube, Facebook } from "lucide-react";
import { z } from "zod";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { Inquiry, INQUIRY_TYPES, BUDGET_RANGES } from "@/types/inquiry";

const contactSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben").max(100, "Name darf maximal 100 Zeichen haben"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  phone: z.string().optional(),
  company: z.string().optional(),
  inquiryType: z.string().optional(),
  budget: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Nachricht muss mindestens 10 Zeichen haben").max(2000, "Nachricht darf maximal 2000 Zeichen haben")
});

export default function Kontakt() {
  const { toast } = useToast();
  const { settings } = useContent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "",
    budget: "",
    subject: "",
    message: "",
    honeypot: ""
  });

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

    const newInquiry: Inquiry = {
      id: crypto.randomUUID(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      inquiryType: formData.inquiryType || undefined,
      budget: formData.budget || undefined,
      subject: formData.subject,
      message: formData.message,
      createdAt: new Date().toISOString(),
      read: false,
      replied: false,
    };

    const existingInquiries = getStorageItem<Inquiry[]>('cms_inquiries', []);
    setStorageItem('cms_inquiries', [...existingInquiries, newInquiry]);

    await new Promise(resolve => setTimeout(resolve, 500));

    setIsSubmitting(false);
    setIsSuccess(true);
    toast({
      title: "Nachricht gesendet!",
      description: "Vielen Dank für Ihre Anfrage. Ich melde mich schnellstmöglich bei Ihnen.",
    });
  };

  if (isSuccess) {
    return (
      <Layout>
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
              <Button onClick={() => setIsSuccess(false)}>
                Weitere Nachricht senden
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
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

                    {/* Inquiry Type & Budget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                      <div className="space-y-2">
                        <Label>Budget (optional)</Label>
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

                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Wird gesendet..."
                      ) : (
                        <>
                          Nachricht senden
                          <Send className="ml-2 h-4 w-4" />
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
