import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useContent } from "@/contexts/ContentContext";
import { 
  Video, 
  Cpu, 
  Code, 
  Wrench, 
  Users, 
  Gamepad2,
  Star
} from "lucide-react";

const skillIcons = [Video, Cpu, Code, Wrench, Users, Gamepad2, Star];

export default function UeberMich() {
  const { settings } = useContent();

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
              Die Person hinter {settings.companyName} – wer ich bin und warum ich das mache.
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
                    src={settings.aboutImage} 
                    alt="Profilbild"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">{settings.companyName}</h2>
                <p className="text-primary font-medium">Gründer & Solo-Unternehmer</p>
              </div>
            </div>

            {/* Bio */}
            <div className="lg:col-span-2">
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Willkommen
                </h2>
                <p className="text-muted-foreground mb-6 whitespace-pre-line">
                  {settings.aboutText}
                </p>
              </div>

              {/* Skills */}
              {settings.skills.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-display text-2xl font-bold mb-6">Meine Kompetenzen</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {settings.skills.map((skill, index) => {
                      const Icon = skillIcons[index % skillIcons.length];
                      return (
                        <Card key={index} className="hover:border-primary/50 transition-colors">
                          <CardContent className="p-4 flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{skill}</h4>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
