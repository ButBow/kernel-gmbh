import { Layout } from "@/components/layout/Layout";

export default function Datenschutz() {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-8">Datenschutzerklärung</h1>
            
            <div className="prose prose-invert max-w-none">
              <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">
                1. Datenschutz auf einen Blick
              </h2>
              
              <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
                Allgemeine Hinweise
              </h3>
              <p className="text-muted-foreground mb-4">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
                personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
                Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
              </p>

              <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">
                2. Verantwortliche Stelle
              </h2>
              <p className="text-muted-foreground mb-4">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="text-muted-foreground mb-4">
                Mein Firmenname<br />
                Max Mustermann<br />
                Musterstrasse 123<br />
                8000 Zürich<br />
                Schweiz<br />
                E-Mail: info@beispiel.ch
              </p>

              <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">
                3. Datenerfassung auf dieser Website
              </h2>

              <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
                Kontaktformular
              </h3>
              <p className="text-muted-foreground mb-4">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben 
                aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten 
                zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns 
                gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
                Server-Log-Dateien
              </h3>
              <p className="text-muted-foreground mb-4">
                Der Provider der Seiten erhebt und speichert automatisch Informationen in 
                so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. 
                Dies sind:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                <li>Browsertyp und Browserversion</li>
                <li>Verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
              </p>

              <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">
                4. Ihre Rechte
              </h2>
              <p className="text-muted-foreground mb-4">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger 
                und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben 
                ausserdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. 
                Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit 
                an uns wenden.
              </p>

              <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">
                5. Cookies
              </h2>
              <p className="text-muted-foreground mb-4">
                Diese Website verwendet keine Tracking-Cookies. Es werden lediglich technisch 
                notwendige Cookies verwendet, die für den Betrieb der Website erforderlich sind.
              </p>

              <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">
                6. Änderungen
              </h2>
              <p className="text-muted-foreground mb-4">
                Wir können diese Datenschutzerklärung jederzeit ohne Vorankündigung anpassen. 
                Es gilt die jeweils aktuelle, auf unserer Website publizierte Fassung.
              </p>

              <p className="text-muted-foreground mt-8">
                <em>Stand: Januar 2024</em>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
