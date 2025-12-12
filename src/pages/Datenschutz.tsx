import { Layout } from "@/components/layout/Layout";
import { useContent } from "@/contexts/ContentContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function Datenschutz() {
  const { settings } = useContent();

  return (
    <Layout pageTitle="Datenschutz">
      {/* Hero */}
      <section className="relative py-12 md:py-16 bg-gradient-dark overflow-hidden">
        <div className="absolute inset-0 glow-bg" aria-hidden="true" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Datenschutz</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" aria-hidden="true" />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-invert max-w-none">
              {settings.datenschutzText ? (
                <MarkdownRenderer content={settings.datenschutzText} />
              ) : (
                <p className="text-muted-foreground">
                  Noch keine Datenschutzerklärung hinterlegt. Bitte im Admin-Bereich unter Einstellungen → Rechtliches hinzufügen.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
