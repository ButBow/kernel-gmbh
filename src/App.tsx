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
import Index from "./pages/Index";
import Leistungen from "./pages/Leistungen";
import Portfolio from "./pages/Portfolio";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import UeberMich from "./pages/UeberMich";
import Kontakt from "./pages/Kontakt";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminInquiries from "./pages/admin/Inquiries";
import AdminProducts from "./pages/admin/Products";
import AdminPortfolio from "./pages/admin/Portfolio";
import AdminBlog from "./pages/admin/Blog";
import AdminSettings from "./pages/admin/Settings";
import AdminAnalytics from "./pages/admin/Analytics";

const queryClient = new QueryClient();

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
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/leistungen" element={<Leistungen />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/ueber-mich" element={<UeberMich />} />
                  <Route path="/kontakt" element={<Kontakt />} />
                  <Route path="/impressum" element={<Impressum />} />
                  <Route path="/datenschutz" element={<Datenschutz />} />
                  
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/inquiries" element={<ProtectedRoute><AdminInquiries /></ProtectedRoute>} />
                  <Route path="/admin/inquiries/:id" element={<ProtectedRoute><AdminInquiries /></ProtectedRoute>} />
                  <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                  <Route path="/admin/portfolio" element={<ProtectedRoute><AdminPortfolio /></ProtectedRoute>} />
                  <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
                  <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <CookieConsent />
              </BrowserRouter>
            </TooltipProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </ContentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
