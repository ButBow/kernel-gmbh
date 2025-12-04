import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { usePageTracking } from "@/hooks/usePageTracking";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Automatically track all pages
  usePageTracking();
  
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
