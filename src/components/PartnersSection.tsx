import { useContent } from '@/contexts/ContentContext';
import { ExternalLink } from 'lucide-react';
import { sanitizeUrl, isValidExternalUrl } from '@/lib/security';

export function PartnersSection() {
  const { settings } = useContent();
  const partners = (settings.partners || []).map(p => ({
    ...p,
    // Sanitize URLs on render
    link: p.link && isValidExternalUrl(p.link) ? sanitizeUrl(p.link) : undefined
  }));

  if (partners.length === 0) return null;

  // Duplicate partners for seamless loop (at least 8 items for smooth animation)
  const minItems = 8;
  const duplicatedPartners = partners.length < minItems 
    ? Array.from({ length: Math.ceil(minItems / partners.length) }, () => partners).flat()
    : partners;
  
  // Double for seamless infinite scroll
  const scrollItems = [...duplicatedPartners, ...duplicatedPartners];

  return (
    <section className="py-12 md:py-16 border-t border-border overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Vertrauen von <span className="text-gradient">Partnern</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Unternehmen, mit denen ich erfolgreich zusammenarbeite
          </p>
        </div>
      </div>

      {/* Scrolling Logo Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="flex animate-scroll">
          {scrollItems.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 px-6 md:px-10"
            >
              {partner.link ? (
                <a
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <PartnerCard partner={partner} />
                </a>
              ) : (
                <PartnerCard partner={partner} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Partner Quotes (if any have quotes) */}
      {partners.some(p => p.quote) && (
        <div className="container mx-auto px-4 mt-8">
          <div className="flex flex-wrap justify-center gap-4">
            {partners.filter(p => p.quote).slice(0, 4).map((partner, index) => (
              <div 
                key={index}
                className="px-4 py-2 bg-card/50 border border-border rounded-full text-xs text-muted-foreground"
              >
                <span className="text-primary font-medium">{partner.name}:</span> "{partner.quote}"
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface PartnerCardProps {
  partner: {
    name: string;
    logo: string;
    link?: string;
    quote?: string;
  };
}

function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <div className="relative w-32 h-20 md:w-40 md:h-24 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
      <img
        src={partner.logo}
        alt={partner.name}
        className="max-w-full max-h-full object-contain"
      />
      {partner.link && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}
