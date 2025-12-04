import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Copy, Check, Percent, Zap, GraduationCap, Gift, Tag } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { Promotion, PROMOTION_TEMPLATES } from '@/types/promotion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Percent,
  Zap,
  GraduationCap,
  Gift,
  Tag
};

const BANNER_DISMISSED_KEY = 'promo_banner_dismissed';

export function PromoBanner() {
  const { settings } = useContent();
  const [dismissed, setDismissed] = useState(() => {
    // Check sessionStorage on initial render
    return sessionStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  
  // Get active promotions that should show in banner
  const promotions: Promotion[] = (settings.promotions || []).filter(
    (p: Promotion) => p.isActive && p.showInBanner && isPromotionValid(p)
  ).sort((a: Promotion, b: Promotion) => a.priority - b.priority);

  // Auto-rotate between promotions
  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  };

  if (dismissed || promotions.length === 0) return null;

  const currentPromo = promotions[currentIndex];
  const template = PROMOTION_TEMPLATES[currentPromo.template];
  
  const bgColor = currentPromo.backgroundColor || template.defaultBg;
  const textColor = currentPromo.textColor || template.defaultText;
  const accentColor = currentPromo.accentColor || template.defaultAccent;
  const iconName = currentPromo.icon || template.defaultIcon;
  const IconComponent = iconMap[iconName] || Tag;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentPromo.discountCode);
    setCopied(true);
    toast.success('Code kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + promotions.length) % promotions.length);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % promotions.length);
  };

  return (
    <div 
      className="relative w-full py-2.5 px-4 overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            ${accentColor} 10px,
            ${accentColor} 11px
          )`
        }}
      />

      <div className="container mx-auto relative flex items-center justify-center gap-4">
        {/* Navigation arrows for multiple promos */}
        {promotions.length > 1 && (
          <button
            onClick={goToPrev}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Vorherige Aktion"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Promo content */}
        <div className="flex items-center gap-3 text-sm md:text-base">
          <IconComponent className="h-5 w-5 flex-shrink-0" style={{ color: accentColor }} />
          
          <span className="font-medium">
            {currentPromo.name}:
          </span>
          
          <span className="hidden sm:inline opacity-90">
            {currentPromo.description}
          </span>
          
          {/* Discount code button */}
          <button
            onClick={handleCopyCode}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-sm transition-all",
              "hover:scale-105"
            )}
            style={{ 
              backgroundColor: accentColor,
              color: bgColor
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {currentPromo.discountCode}
          </button>
        </div>

        {/* Navigation arrows for multiple promos */}
        {promotions.length > 1 && (
          <button
            onClick={goToNext}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Nächste Aktion"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Dots indicator */}
        {promotions.length > 1 && (
          <div className="absolute right-16 flex gap-1">
            {promotions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === currentIndex ? "w-4" : "opacity-50"
                )}
                style={{ backgroundColor: accentColor }}
                aria-label={`Aktion ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Banner schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function isPromotionValid(promo: Promotion): boolean {
  const now = new Date();
  const from = new Date(promo.validFrom);
  const until = new Date(promo.validUntil);
  until.setHours(23, 59, 59, 999); // Include the entire last day
  return now >= from && now <= until;
}

// Helper to validate a discount code
export function validateDiscountCode(
  code: string, 
  promotions: Promotion[]
): Promotion | null {
  if (!code) return null;
  const normalizedCode = code.trim().toUpperCase();
  return promotions.find(
    p => p.discountCode.toUpperCase() === normalizedCode && 
         p.isActive && 
         isPromotionValid(p)
  ) || null;
}
