import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Eye, MousePointer, Clock, ArrowDown, 
  Users, Trash2, TrendingUp, Layers
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAnalytics() {
  const { summary, events, clearAnalytics } = useAnalytics();

  const handleClear = () => {
    if (confirm('Möchten Sie wirklich alle Analytics-Daten löschen?')) {
      clearAnalytics();
      toast.success('Analytics-Daten gelöscht');
    }
  };

  const topPages = Object.entries(summary.pageViews)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topProducts = Object.entries(summary.productClicks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topCategories = Object.entries(summary.categoryClicks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const recentEvents = [...events].reverse().slice(0, 20);

  return (
    <AdminLayout title="Analytics">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-muted-foreground">
          Übersicht über Nutzerinteraktionen (lokal gespeichert)
        </p>
        <Button variant="outline" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Daten löschen
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalPageViews}</p>
                <p className="text-xs text-muted-foreground">Seitenaufrufe</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.sessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ArrowDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.avgScrollDepth}%</p>
                <p className="text-xs text-muted-foreground">Ø Scroll-Tiefe</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.avgTimeOnPage}s</p>
                <p className="text-xs text-muted-foreground">Ø Verweildauer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Top Seiten
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
            ) : (
              <div className="space-y-2">
                {topPages.map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[180px]">{page || '/'}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Beliebteste Produkte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map(([product, count]) => (
                  <div key={product} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[180px]">{product}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4" />
              Beliebteste Kategorien
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
            ) : (
              <div className="space-y-2">
                {topCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[180px]">{category}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MousePointer className="h-4 w-4" />
            Letzte Ereignisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Ereignisse aufgezeichnet. Stellen Sie sicher, dass Cookies akzeptiert wurden.
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {recentEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {event.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-muted-foreground">{event.page}</span>
                    {event.data && (
                      <span className="text-xs text-muted-foreground">
                        {Object.entries(event.data).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString('de-DE')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
