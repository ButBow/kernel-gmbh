import { AdminLayout } from '@/components/admin/AdminLayout';
import { useContent } from '@/contexts/ContentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Package, Settings, ArrowRight, MessageSquare, Bell, BarChart3 } from 'lucide-react';
import { getStorageItem } from '@/lib/storage';
import { Inquiry } from '@/types/inquiry';

export default function AdminDashboard() {
  const { categories, products } = useContent();
  const inquiries = getStorageItem<Inquiry[]>('cms_inquiries', []);
  const unreadCount = inquiries.filter(i => !i.read).length;

  const stats = [
    {
      title: 'Kategorien',
      count: categories.length,
      href: '/admin/products',
      icon: Package,
      color: 'text-blue-500'
    },
    {
      title: 'Leistungen',
      count: products.length,
      published: products.filter(p => p.status === 'published').length,
      href: '/admin/products',
      icon: Package,
      color: 'text-green-500'
    },
    {
      title: 'Anfragen',
      count: inquiries.length,
      published: unreadCount,
      href: '/admin/inquiries',
      icon: MessageSquare,
      color: 'text-purple-500'
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Unread Inquiries Alert */}
      {unreadCount > 0 && (
        <Link to="/admin/inquiries">
          <Card className="mb-6 border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">
                  {unreadCount} neue {unreadCount === 1 ? 'Anfrage' : 'Anfragen'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Klicken um zu den Anfragen zu gelangen
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:bg-secondary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                {stat.published !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {stat.title === 'Anfragen' ? `${stat.published} ungelesen` : `${stat.published} veröffentlicht`}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Schnellzugriff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/admin/products"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span>Leistungen verwalten</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/inquiries"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <span>Anfragen ansehen</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <span>Analytics</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span>Einstellungen</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Letzte Änderungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Hier werden zukünftig die letzten Änderungen angezeigt.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
