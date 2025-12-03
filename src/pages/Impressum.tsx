import { Layout } from "@/components/layout/Layout";
import { useContent } from "@/contexts/ContentContext";

export default function Impressum() {
  const { settings } = useContent();

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-8">Impressum</h1>
            
            <div className="prose prose-invert max-w-none">
              <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">
                Angaben gemäss Schweizer Recht
              </h2>
              
              <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
                Kontaktadresse
              </h3>
              <p className="text-muted-foreground mb-4">
                {settings.companyName}<br />
                {settings.contactLocation}
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
                Kontakt
              </h3>
              <p className="text-muted-foreground mb-4">
                E-Mail: {settings.contactEmail}<br />
                Telefon: {settings.contactPhone}
              </p>

              {settings.impressumText && (
                <div className="mt-8 whitespace-pre-line text-muted-foreground">
                  {settings.impressumText}
                </div>
              )}

              <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
                Haftungsausschluss
              </h3>
              <p className="text-muted-foreground mb-4">
                Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, 
                Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.
              </p>
              <p className="text-muted-foreground mb-4">
                Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, 
                welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten 
                Informationen, durch Missbrauch der Verbindung oder durch technische Störungen 
                entstanden sind, werden ausgeschlossen.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
                Urheberrechte
              </h3>
              <p className="text-muted-foreground mb-4">
                Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen 
                Dateien auf der Website gehören ausschliesslich {settings.companyName} oder den speziell 
                genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die 
                schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
