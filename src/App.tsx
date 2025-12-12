import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import { CookieSettingsSync } from "@/components/CookieSettingsSync";
import { ChatBot } from "@/components/chat/ChatBot";
import { Loader2 } from "lucide-react";

// Eagerly loaded public pages (critical path)
import Index from "./pages/Index";
import Leistungen from "./pages/Leistungen";
import Kontakt from "./pages/Kontakt";

// Lazy loaded public pages (less critical)
const UeberMich = lazy(() => import("./pages/UeberMich"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy loaded admin pages (heavy, rarely accessed)
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminInquiries = lazy(() => import("./pages/admin/Inquiries"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Laden...</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ContentProvider>
        <ThemeProvider>
          <AnalyticsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Critical public routes - eagerly loaded */}
                    <Route path="/" element={<Index />} />
                    <Route path="/leistungen" element={<Leistungen />} />
                    <Route path="/kontakt" element={<Kontakt />} />
                    
                    {/* Less critical public routes - lazy loaded */}
                    <Route path="/ueber-mich" element={<UeberMich />} />
                    <Route path="/impressum" element={<Impressum />} />
                    <Route path="/datenschutz" element={<Datenschutz />} />
                    
                    {/* Admin routes - lazy loaded */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/inquiries" element={<ProtectedRoute><AdminInquiries /></ProtectedRoute>} />
                    <Route path="/admin/inquiries/:id" element={<ProtectedRoute><AdminInquiries /></ProtectedRoute>} />
                    <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                    <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
                    <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <CookieConsent />
                <CookieSettingsSync />
                <ChatBot />
              </BrowserRouter>
            </TooltipProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </ContentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;