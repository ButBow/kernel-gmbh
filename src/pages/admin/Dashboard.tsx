import { AdminLayout } from '@/components/admin/AdminLayout';
import { useContent } from '@/contexts/ContentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Package, FolderKanban, FileText, Settings, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { categories, products, projects, posts } = useContent();

  const stats = [
    {
      title: 'Kategorien',
      count: categories.length,
      href: '/admin/products',
      icon: Package,
      color: 'text-blue-500'
    },
    {
      title: 'Produkte',
      count: products.length,
      published: products.filter(p => p.status === 'published').length,
      href: '/admin/products',
      icon: Package,
      color: 'text-green-500'
    },
    {
      title: 'Portfolio-Projekte',
      count: projects.length,
      published: projects.filter(p => p.status === 'published').length,
      href: '/admin/portfolio',
      icon: FolderKanban,
      color: 'text-purple-500'
    },
    {
      title: 'Blog-Beiträge',
      count: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      href: '/admin/blog',
      icon: FileText,
      color: 'text-amber-500'
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
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
                  {stat.published} veröffentlicht
                </p>
              )}
            </CardContent>
          </Card>
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
                <span>Produkte verwalten</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/portfolio"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="h-5 w-5 text-muted-foreground" />
                <span>Portfolio bearbeiten</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/blog"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span>Neuen Beitrag schreiben</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span>Website-Einstellungen</span>
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
