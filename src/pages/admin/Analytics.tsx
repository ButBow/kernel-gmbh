import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useContent } from '@/contexts/ContentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, Eye, MousePointer, Clock, ArrowDown, 
  Users, Trash2, TrendingUp, Layers, Search, Download,
  ExternalLink, FormInput, Play, Phone, Settings, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ALL_TRACKING_OPTIONS } from '@/types/cookieSettings';

export default function AdminAnalytics() {
  const { summary, events, clearAnalytics, isTrackingTypeEnabled, cookieSettings } = useAnalytics();
  const { settings } = useContent();

  // Get the actual cookie settings from content (for persistence)
  const activeCookieSettings = settings.cookieSettings || cookieSettings;

  const handleClear = () => {
    if (confirm('Möchten Sie wirklich alle Analytics-Daten löschen?')) {
      clearAnalytics();
      toast.success('Analytics-Daten gelöscht');
    }
  };

  // Helper to check if a tracking type is enabled
  const isEnabled = (type: string) => {
    const option = activeCookieSettings.trackingOptions?.find(opt => opt.id === type);
    return option?.enabled ?? false;
  };

  // Get the label for a tracking type
  const getLabel = (type: string) => {
    return ALL_TRACKING_OPTIONS.find(opt => opt.id === type)?.label || type;
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

  const topSearches = Object.entries(summary.searches)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topDownloads = Object.entries(summary.downloads)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topOutboundLinks = Object.entries(summary.outboundLinks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topFormInteractions = Object.entries(summary.formInteractions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topVideoPlays = Object.entries(summary.videoPlays)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Filter events to only show enabled types
  const recentEvents = [...events]
    .filter(e => isEnabled(e.type))
    .reverse()
    .slice(0, 20);

  // Count enabled tracking options
  const enabledCount = activeCookieSettings.trackingOptions?.filter(opt => opt.enabled).length || 0;
  const totalCount = ALL_TRACKING_OPTIONS.length;

  return (
    <AdminLayout title="Analytics">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-muted-foreground">
            Übersicht über Nutzerinteraktionen (lokal gespeichert)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {enabledCount} von {totalCount} Tracking-Optionen aktiviert
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Tracking konfigurieren
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Daten löschen
          </Button>
        </div>
      </div>

      {enabledCount === 0 && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Alle Tracking-Optionen sind deaktiviert. Aktivieren Sie Optionen in den{' '}
            <Link to="/admin/settings" className="text-primary hover:underline">
              Cookie-Einstellungen
            </Link>
            , um Daten zu erfassen.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards - Only show enabled metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isEnabled('page_view') && (
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
        )}

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

        {isEnabled('scroll_depth') && (
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
        )}

        {isEnabled('time_on_page') && (
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
        )}

        {isEnabled('contact_click') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.contactClicks}</p>
                  <p className="text-xs text-muted-foreground">Kontakt-Klicks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isEnabled('product_inquiry') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FormInput className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.productInquiries}</p>
                  <p className="text-xs text-muted-foreground">Anfragen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Pages */}
        {isEnabled('page_view') && (
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
        )}

        {/* Top Products */}
        {isEnabled('product_click') && (
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
        )}

        {/* Top Categories */}
        {isEnabled('category_click') && (
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
        )}

        {/* Searches */}
        {isEnabled('search') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4" />
                Top Suchbegriffe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
              ) : (
                <div className="space-y-2">
                  {topSearches.map(([term, count]) => (
                    <div key={term} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[180px]">{term}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Downloads */}
        {isEnabled('download') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-4 w-4" />
                Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topDownloads.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
              ) : (
                <div className="space-y-2">
                  {topDownloads.map(([file, count]) => (
                    <div key={file} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[180px]">{file}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Outbound Links */}
        {isEnabled('outbound_link') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ExternalLink className="h-4 w-4" />
                Externe Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topOutboundLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
              ) : (
                <div className="space-y-2">
                  {topOutboundLinks.map(([url, count]) => (
                    <div key={url} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[180px]">{url}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Form Interactions */}
        {isEnabled('form_interaction') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FormInput className="h-4 w-4" />
                Formular-Interaktionen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topFormInteractions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
              ) : (
                <div className="space-y-2">
                  {topFormInteractions.map(([form, count]) => (
                    <div key={form} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[180px]">{form}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Video Plays */}
        {isEnabled('video_play') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Play className="h-4 w-4" />
                Video-Wiedergaben
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topVideoPlays.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
              ) : (
                <div className="space-y-2">
                  {topVideoPlays.map(([video, count]) => (
                    <div key={video} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[180px]">{video}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MousePointer className="h-4 w-4" />
            Letzte Ereignisse
            <span className="text-xs font-normal text-muted-foreground ml-2">
              (nur aktivierte Tracking-Typen)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Ereignisse aufgezeichnet. Stellen Sie sicher, dass Cookies akzeptiert wurden und Tracking-Optionen aktiviert sind.
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
                      {getLabel(event.type)}
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
