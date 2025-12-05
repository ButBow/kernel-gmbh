import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useContent } from "@/contexts/ContentContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  pageTitle?: string;
  children: ReactNode;
}

export function Layout({ children, pageTitle }: LayoutProps) {
  // Automatically track all pages
  usePageTracking();
  // Set document title based on company name
  useDocumentTitle(pageTitle);
  
  const { isLoading: isContentLoading } = useContent();
  const { isLoading: isThemeLoading } = useTheme();
  
  // Show loading state until BOTH content AND theme are loaded to prevent flash
  if (isContentLoading || isThemeLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Laden...</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="sticky top-16 z-40">
        <PromoBanner />
      </div>
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
