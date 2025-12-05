import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, Shield, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { defaultCookieSettings } from '@/types/cookieSettings';
import { cn } from '@/lib/utils';

export function CookieConsent() {
  const { consentGiven, setConsent } = useAnalytics();
  const { settings, isLoading } = useContent();
  const [showDetails, setShowDetails] = useState(false);

  const cookieConfig = settings.cookieSettings || defaultCookieSettings;

  // Don't render while loading or if disabled or consent was already given/denied
  if (isLoading || !cookieConfig.enabled || consentGiven !== null) return null;

  const positionClasses = {
    bottom: 'bottom-0 left-0 right-0',
    top: 'top-0 left-0 right-0',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <div className={cn(
      "fixed z-50 p-3 sm:p-4 animate-in duration-500",
      positionClasses[cookieConfig.position],
      cookieConfig.position === 'bottom' && 'slide-in-from-bottom-4',
      cookieConfig.position === 'top' && 'slide-in-from-top-4',
      cookieConfig.position === 'center' && 'fade-in'
    )}>
      <Card className={cn(
        "max-w-2xl mx-auto p-4 sm:p-6 bg-background/40 backdrop-blur-xl border-border/50 shadow-2xl",
        cookieConfig.style === 'minimal' && 'p-3 sm:p-4',
        cookieConfig.style === 'floating' && 'rounded-2xl'
      )}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10 shrink-0">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{cookieConfig.title}</h3>
              <p className="text-sm text-muted-foreground">
                {cookieConfig.description}
              </p>
            </div>

            {cookieConfig.showDetailedInfo && showDetails && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Erfasste Daten:</p>
                    <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                      {cookieConfig.trackingOptions.filter(opt => opt.enabled).map((opt) => (
                        <li key={opt.id}>{opt.label}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Alle Daten werden ausschließlich lokal in Ihrem Browser (localStorage) gespeichert 
                  und dienen der Verbesserung unseres Angebots. Weitere Informationen finden Sie in 
                  unserer <Link to="/datenschutz" className="text-primary hover:underline">{cookieConfig.privacyLinkText}</Link>.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setConsent(true)} className="flex-1 sm:flex-none">
                {cookieConfig.acceptAllText}
              </Button>
              <Button variant="outline" onClick={() => setConsent(false)} className="flex-1 sm:flex-none">
                {cookieConfig.rejectText}
              </Button>
              {cookieConfig.showDetailedInfo && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-muted-foreground"
                >
                  {showDetails ? 'Weniger' : cookieConfig.moreInfoText}
                </Button>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -mt-2 -mr-2"
            onClick={() => setConsent(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
