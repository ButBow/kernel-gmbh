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
              {settings.impressumText ? (
                <MarkdownRenderer content={settings.impressumText} />
              ) : (
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
