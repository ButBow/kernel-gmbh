import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, Shield, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function CookieConsent() {
  const { consentGiven, setConsent } = useAnalytics();
  const [showDetails, setShowDetails] = useState(false);

  // Don't show if consent was already given or denied
  if (consentGiven !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="max-w-2xl mx-auto p-4 sm:p-6 mx-3 sm:mx-auto bg-background/40 backdrop-blur-xl border-border/50 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10 shrink-0">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Cookie-Einstellungen</h3>
              <p className="text-sm text-muted-foreground">
                Wir verwenden Cookies und ähnliche Technologien, um Ihre Nutzungserfahrung zu analysieren 
                und unsere Website zu verbessern. Die Daten werden lokal in Ihrem Browser gespeichert 
                und nicht an Dritte weitergegeben.
              </p>
            </div>

            {showDetails && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Erfasste Daten:</p>
                    <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                      <li>Seitenaufrufe und Navigation</li>
                      <li>Klicks auf Produkte und Kategorien</li>
                      <li>Verweildauer auf Seiten</li>
                      <li>Scroll-Tiefe</li>
                    </ul>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Alle Daten werden ausschließlich lokal in Ihrem Browser (localStorage) gespeichert 
                  und dienen der Verbesserung unseres Angebots. Weitere Informationen finden Sie in 
                  unserer <Link to="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link>.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setConsent(true)} className="flex-1 sm:flex-none">
                Alle akzeptieren
              </Button>
              <Button variant="outline" onClick={() => setConsent(false)} className="flex-1 sm:flex-none">
                Nur notwendige
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-muted-foreground"
              >
                {showDetails ? 'Weniger' : 'Mehr erfahren'}
              </Button>
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
