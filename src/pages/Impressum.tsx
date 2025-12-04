import { Layout } from "@/components/layout/Layout";
import { useContent } from "@/contexts/ContentContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
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
                {settings.contactPhone && <>Telefon: {settings.contactPhone}</>}
              </p>

              {settings.impressumText && (
                <div className="mt-8">
                  <MarkdownRenderer content={settings.impressumText} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
