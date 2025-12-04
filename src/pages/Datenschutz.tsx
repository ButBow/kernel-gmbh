import { Layout } from "@/components/layout/Layout";
import { useContent } from "@/contexts/ContentContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function Datenschutz() {
  const { settings } = useContent();

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-8">Datenschutzerklärung</h1>
            
            <div className="prose prose-invert max-w-none">
              <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">
                Verantwortliche Stelle
              </h2>
              <p className="text-muted-foreground mb-4">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="text-muted-foreground mb-4">
                {settings.companyName}<br />
                {settings.contactLocation}<br />
                E-Mail: {settings.contactEmail}
              </p>

              {settings.datenschutzText && (
                <div className="mt-8">
                  <MarkdownRenderer content={settings.datenschutzText} />
                </div>
              )}

              <p className="text-muted-foreground mt-8">
                <em>Stand: {new Date().toLocaleDateString('de-CH', { month: 'long', year: 'numeric' })}</em>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
