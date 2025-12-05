import { Layout } from "@/components/layout/Layout";
import { useContent } from "@/contexts/ContentContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function Impressum() {
  const { settings } = useContent();

  return (
    <Layout pageTitle="Impressum">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-8">Impressum</h1>
            
            <div className="space-y-8">
              {/* Firmensitz */}
              {settings.companyHeadquarters && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Firmensitz
                  </h2>
                  <p className="text-muted-foreground">{settings.companyHeadquarters}</p>
                </div>
              )}

              {/* Handelsregister */}
              {settings.tradeRegistry && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Handelsregister
                  </h2>
                  <p className="text-muted-foreground">{settings.tradeRegistry}</p>
                </div>
              )}

              {/* UID / MWSt-Nummer */}
              {settings.uidNumber && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    UID- / MWSt-Nummer
                  </h2>
                  <p className="text-muted-foreground">{settings.uidNumber}</p>
                </div>
              )}

              {/* Führungskräfte */}
              {settings.executives && settings.executives.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Führungskräfte
                  </h2>
                  <ul className="text-muted-foreground space-y-1">
                    {settings.executives.map((exec, index) => (
                      <li key={index}>
                        {exec.name} - {exec.position}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rechtliche Hinweise (Markdown) */}
              {settings.impressumText && (
                <div className="pt-4 border-t border-border">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Rechtliche Hinweise
                  </h2>
                  <MarkdownRenderer content={settings.impressumText} />
                </div>
              )}

              {!settings.companyHeadquarters && !settings.tradeRegistry && !settings.uidNumber && 
               (!settings.executives || settings.executives.length === 0) && !settings.impressumText && (
                <p className="text-muted-foreground">
                  Noch kein Impressum hinterlegt. Bitte im Admin-Bereich unter Einstellungen → Rechtliches hinzufügen.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
