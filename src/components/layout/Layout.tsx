import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { SEOHead } from "@/components/SEOHead";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useContent } from "@/contexts/ContentContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  pageTitle?: string;
  pageDescription?: string;
  children: ReactNode;
}

export function Layout({ children, pageTitle, pageDescription }: LayoutProps) {
  const location = useLocation();
  // Automatically track all pages
  usePageTracking();
  // Set document title based on company name
  useDocumentTitle(pageTitle);
  
  const { isLoading: isContentLoading } = useContent();
  const { isLoading: isThemeLoading } = useTheme();
  
  // Determine page type for structured data
  const getPageType = (): 'website' | 'article' | 'product' | 'profile' => {
    if (location.pathname.startsWith('/blog/')) return 'article';
    if (location.pathname === '/ueber-mich') return 'profile';
    if (location.pathname === '/leistungen') return 'product';
    return 'website';
  };
  
  // Show loading state until BOTH content AND theme are loaded to prevent flash
  if (isContentLoading || isThemeLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#f59e0b' }} />
            <p style={{ color: '#a1a1aa' }}>Laden...</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath={location.pathname}
        type={getPageType()}
      />
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
