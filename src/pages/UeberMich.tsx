import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Video, 
  Cpu, 
  Code, 
  Wrench, 
  Users, 
  Gamepad2,
  GraduationCap
} from "lucide-react";

const skills = [
  {
    icon: Video,
    name: "Video & Content",
    description: "Professionelle Videoproduktion, Editing und Content-Erstellung für Social Media"
  },
  {
    icon: Cpu,
    name: "AI & Automation",
    description: "Entwicklung von KI-gestützten Workflows und Automatisierungslösungen"
  },
  {
    icon: Code,
    name: "Programmierung",
    description: "Python, JavaScript/TypeScript, Web-Entwicklung und Tool-Building"
  },
  {
    icon: Wrench,
    name: "IT-Support",
    description: "Technische Beratung, Systemeinrichtung und Troubleshooting"
  },
  {
    icon: Users,
    name: "Management",
    description: "Projektmanagement, Account-Betreuung und Kundenberatung"
  },
  {
    icon: Gamepad2,
    name: "Kreativ-Nerd",
    description: "D&D, VR-Enthusiast und Tech-Geek mit Leidenschaft für Innovation"
  }
];

export default function UeberMich() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Über mich</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Die Person hinter dem Business – wer ich bin und warum ich das mache.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Profile */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="aspect-square rounded-2xl overflow-hidden bg-secondary mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" 
                    alt="Profilbild"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Max Mustermann</h2>
                <p className="text-primary font-medium">Gründer & Solo-Unternehmer</p>
              </div>
            </div>

            {/* Bio */}
            <div className="lg:col-span-2">
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Hallo, ich bin Max
                </h2>
                <p className="text-muted-foreground mb-6">
                  Seit über 5 Jahren bewege ich mich an der Schnittstelle von Technologie und Kreativität. 
                  Was als Hobby mit Videoschnitt und ersten Programmierversuchen begann, ist heute mein 
                  Vollzeit-Business: Ich helfe Unternehmen, Creators und Einzelunternehmern dabei, 
                  ihre Arbeit mit modernen Tools effizienter und kreativer zu gestalten.
                </p>

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  Mein Weg
                </h3>
                <p className="text-muted-foreground mb-6">
                  Meine Reise begann mit der Faszination für Technologie – vom ersten selbst gebauten PC 
                  über Videospiel-Modding bis hin zu professioneller Videoproduktion. Diese Neugier 
                  hat mich nie verlassen: Heute experimentiere ich ständig mit neuen AI-Tools, 
                  Automatisierungslösungen und kreativen Workflows.
                </p>
                <p className="text-muted-foreground mb-6">
                  Nach Jahren in verschiedenen Rollen – von der Agentur über Freelance-Projekte bis 
                  hin zu Tech-Startups – habe ich mein eigenes Solo-Unternehmen gegründet. Hier kann 
                  ich all meine Fähigkeiten vereinen und Kunden ganzheitlich unterstützen.
                </p>

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  Was mich antreibt
                </h3>
                <p className="text-muted-foreground mb-6">
                  Ich glaube daran, dass Technologie Menschen befähigen sollte, nicht ersetzen. 
                  Mein Ziel ist es, komplexe Dinge einfach zu machen – sei es durch ein gut 
                  geschnittenes Video, eine clevere Automation oder ein massgeschneidertes Tool. 
                  Effizienz ist für mich kein Selbstzweck, sondern schafft Raum für das, was wirklich zählt.
                </p>

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  Abseits der Arbeit
                </h3>
                <p className="text-muted-foreground mb-8">
                  Wenn ich nicht gerade an Projekten arbeite, findet man mich am D&D-Tisch als 
                  Dungeon Master, in VR-Welten oder beim Testen neuer Tech-Gadgets. Diese "Nerd-Seite" 
                  fliesst oft in meine Arbeit ein – Kreativität und technisches Denken gehen bei mir 
                  Hand in Hand.
                </p>
              </div>

              {/* Skills */}
              <div className="mt-12">
                <h3 className="font-display text-2xl font-bold mb-6">Meine Kompetenzen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <Card key={skill.name} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <skill.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{skill.name}</h4>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
