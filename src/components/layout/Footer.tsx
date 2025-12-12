import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Linkedin, Twitter, Youtube, Facebook } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { sanitizeUrl, isValidExternalUrl } from "@/lib/security";

export function Footer() {
  const { settings } = useContent();

  // Sanitize social URLs
  const socialUrls = {
    instagram: settings.socialInstagram && isValidExternalUrl(settings.socialInstagram) ? sanitizeUrl(settings.socialInstagram) : null,
    linkedin: settings.socialLinkedin && isValidExternalUrl(settings.socialLinkedin) ? sanitizeUrl(settings.socialLinkedin) : null,
    twitter: settings.socialTwitter && isValidExternalUrl(settings.socialTwitter) ? sanitizeUrl(settings.socialTwitter) : null,
    youtube: settings.socialYoutube && isValidExternalUrl(settings.socialYoutube) ? sanitizeUrl(settings.socialYoutube) : null,
    tiktok: settings.socialTiktok && isValidExternalUrl(settings.socialTiktok) ? sanitizeUrl(settings.socialTiktok) : null,
    facebook: settings.socialFacebook && isValidExternalUrl(settings.socialFacebook) ? sanitizeUrl(settings.socialFacebook) : null,
  };

  const hasSocialMedia = Object.values(socialUrls).some(url => url);

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <Link to="/" className="font-display text-lg sm:text-xl font-bold text-gradient">
              {settings.companyName}
            </Link>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              KI, Automatisierung & Content-Produktion für Unternehmen, Creators und Einzelunternehmer.
            </p>
          </div>

          {/* About Section */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Über mich</h4>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              {settings.aboutShort || settings.aboutText?.slice(0, 150) || 'Experte für KI, Automatisierung & Content-Produktion.'}
            </p>
            <Link 
              to="/ueber-mich" 
              className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
            >
              Mehr erfahren →
            </Link>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Kontakt</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-foreground transition-colors">
                  {settings.contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={16} className="text-primary" />
                <a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} className="hover:text-foreground transition-colors">
                  {settings.contactPhone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="text-primary" />
                <span>{settings.contactLocation}</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Rechtliches</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/impressum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Admin
                </Link>
              </li>
            </ul>

            {/* Social Media */}
            {hasSocialMedia && (
              <div className="mt-6">
                <h4 className="font-display font-semibold text-foreground mb-3">Social Media</h4>
                <div className="flex flex-wrap gap-3">
                  {socialUrls.instagram && (
                    <a
                      href={socialUrls.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                  {socialUrls.linkedin && (
                    <a
                      href={socialUrls.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Linkedin size={18} />
                    </a>
                  )}
                  {socialUrls.twitter && (
                    <a
                      href={socialUrls.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                  {socialUrls.youtube && (
                    <a
                      href={socialUrls.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Youtube size={18} />
                    </a>
                  )}
                  {socialUrls.tiktok && (
                    <a
                      href={socialUrls.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                      title="TikTok"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </a>
                  )}
                  {socialUrls.facebook && (
                    <a
                      href={socialUrls.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Facebook size={18} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            {settings.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
