import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  FolderKanban,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/inquiries', icon: MessageSquare, label: 'Anfragen' },
  { href: '/admin/products', icon: Package, label: 'Leistungen' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Einstellungen' },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background text-sm lg:text-base">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 hover:bg-secondary rounded-lg"
        >
          <Menu size={20} />
        </button>
        <span className="font-display font-bold text-sm">Admin</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
          <LogOut size={18} />
        </Button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-56 lg:w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-14 lg:h-16 px-3 lg:px-4 border-b border-border">
          <Link to="/" className="font-display font-bold text-sm lg:text-lg">
            Admin Panel
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-secondary rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 lg:p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-2 lg:gap-3 px-2.5 lg:px-3 py-2 rounded-lg transition-colors text-xs lg:text-sm
                ${location.pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
                }
              `}
            >
              <item.icon size={18} className="lg:w-5 lg:h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-2 px-2.5 lg:px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-xs lg:text-sm text-muted-foreground"
          >
            <ChevronLeft size={14} className="lg:w-4 lg:h-4" />
            Zur Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 lg:gap-3 px-2.5 lg:px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors mt-2 text-xs lg:text-sm"
          >
            <LogOut size={18} className="lg:w-5 lg:h-5" />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-3 lg:p-8">
          <h1 className="font-display text-lg sm:text-xl lg:text-3xl font-bold mb-4 lg:mb-6">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
