import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useContent } from '@/contexts/ContentContext';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { Inquiry, INQUIRY_TYPES, BUDGET_RANGES } from '@/types/inquiry';
import { NotionWorkflowConfig, defaultNotionWorkflowConfig } from '@/types/notionWorkflow';
import { NotionWorkflowEditor } from '@/components/admin/NotionWorkflowEditor';
import { exportInquiryToPDF, exportAllInquiriesToPDF } from '@/lib/pdfExport';
import { 
  downloadAttachment, 
  downloadAllAttachments,
  downloadAllInquiryAttachments,
  formatFileSize,
  getFileTypeLabel 
} from '@/lib/attachmentUtils';
import { 
  Mail, 
  Trash2, 
  CheckCircle, 
  Clock,
  MessageSquare,
  Inbox,
  FileDown,
  Phone,
  Building2,
  Tag,
  Wallet,
  Paperclip,
  Download,
  FileArchive,
  FileText,
  Image as ImageIcon,
  Link2,
  Copy,
  Settings2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STORAGE_KEY = 'cms_inquiries';

export default function AdminInquiries() {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings, updateSettings } = useContent();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'list');
  const [isSyncing, setIsSyncing] = useState(false);

  // Get Notion workflow config from settings
  const notionWorkflow: NotionWorkflowConfig = settings.notionWorkflow || defaultNotionWorkflowConfig;

  const handleNotionWorkflowChange = (config: NotionWorkflowConfig) => {
    updateSettings({ notionWorkflow: config });
  };

  useEffect(() => {
    const stored = getStorageItem<Inquiry[]>(STORAGE_KEY, []);
    setInquiries(stored);
    
    // If URL has an ID, open that inquiry
    if (id) {
      const inquiry = stored.find(i => i.id === id);
      if (inquiry) {
        setSelectedInquiry(inquiry);
        if (!inquiry.read) {
          markAsReadById(inquiry.id, stored);
        }
      }
    }
  }, [id]);

  const saveInquiries = (updated: Inquiry[]) => {
    setInquiries(updated);
    setStorageItem(STORAGE_KEY, updated);
  };

  const markAsReadById = (inquiryId: string, currentInquiries: Inquiry[]) => {
    const updated = currentInquiries.map(i => 
      i.id === inquiryId ? { ...i, read: true } : i
    );
    saveInquiries(updated);
  };

  const markAsRead = (inquiryId: string) => {
    markAsReadById(inquiryId, inquiries);
    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry({ ...selectedInquiry, read: true });
    }
  };

  const toggleReplied = (inquiryId: string) => {
    const updated = inquiries.map(i => 
      i.id === inquiryId ? { ...i, replied: !i.replied } : i
    );
    saveInquiries(updated);
    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry({ ...selectedInquiry, replied: !selectedInquiry.replied });
    }
    toast({
      title: 'Status aktualisiert',
      description: 'Anfrage-Status wurde geändert.',
    });
  };

  const deleteInquiry = (inquiryId: string) => {
    const updated = inquiries.filter(i => i.id !== inquiryId);
    saveInquiries(updated);
    setSelectedInquiry(null);
    navigate('/admin/inquiries');
    toast({
      title: 'Anfrage gelöscht',
      description: 'Die Anfrage wurde entfernt.',
    });
  };

  const openInquiry = (inquiry: Inquiry) => {
    // Update URL to include inquiry ID
    navigate(`/admin/inquiries/${inquiry.id}`);
    setSelectedInquiry(inquiry);
    if (!inquiry.read) {
      markAsRead(inquiry.id);
    }
  };

  const closeInquiry = () => {
    setSelectedInquiry(null);
    navigate('/admin/inquiries');
  };

  const getInquiryLink = (inquiryId: string) => {
    return `${window.location.origin}/admin/inquiries/${inquiryId}`;
  };

  const copyInquiryLink = (inquiryId: string) => {
    const link = getInquiryLink(inquiryId);
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link kopiert',
      description: 'Der Anfrage-Link wurde in die Zwischenablage kopiert.',
    });
  };

  const handleExportSingle = (inquiry: Inquiry) => {
    exportInquiryToPDF(inquiry);
    toast({
      title: 'PDF exportiert',
      description: 'Die Anfrage wurde als PDF heruntergeladen.',
    });
  };

  const handleExportAll = () => {
    exportAllInquiriesToPDF(inquiries);
    toast({
      title: 'PDF exportiert',
      description: 'Alle Anfragen wurden als PDF heruntergeladen.',
    });
  };

  const handleDownloadAllAttachments = async () => {
    const success = await downloadAllInquiryAttachments(inquiries);
    if (success) {
      toast({
        title: 'ZIP erstellt',
        description: 'Alle Anhänge wurden als ZIP heruntergeladen.',
      });
    } else {
      toast({
        title: 'Keine Anhänge',
        description: 'Es gibt keine Anhänge zum Herunterladen.',
        variant: 'destructive',
      });
    }
  };

  const getInquiryTypeLabel = (value?: string) => {
    return INQUIRY_TYPES.find(t => t.value === value)?.label;
  };

  const getBudgetLabel = (value?: string) => {
    return BUDGET_RANGES.find(b => b.value === value)?.label;
  };

  const getAttachmentIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const unreadCount = inquiries.filter(i => !i.read).length;
  const totalAttachments = inquiries.reduce((acc, i) => acc + (i.attachments?.length || 0), 0);

  return (
    <AdminLayout title="Anfragen">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-6">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto">
            <TabsTrigger value="list" className="text-xs sm:text-sm flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Anfragen
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Notion-Workflow
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
                {unreadCount} ungelesen
              </Badge>
              <Badge variant="outline">{inquiries.length} gesamt</Badge>
              {totalAttachments > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {totalAttachments} Anhänge
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notionWorkflow.enabled && notionWorkflow.databases.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    setIsSyncing(true);
                    // Simulate sync delay - real implementation would call Notion API
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    setIsSyncing(false);
                    toast({
                      title: 'Synchronisation',
                      description: 'Notion-Synchronisation erfordert eine Server-Implementierung. Anfragen werden aktuell nur lokal gespeichert.',
                    });
                  }}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Synchronisiere...' : 'Mit Notion synchronisieren'}
                </Button>
              )}
              {totalAttachments > 0 && (
                <Button variant="outline" onClick={handleDownloadAllAttachments}>
                  <FileArchive className="h-4 w-4 mr-2" />
                  Alle Anhänge (ZIP)
                </Button>
              )}
              {inquiries.length > 0 && (
                <Button variant="outline" onClick={handleExportAll}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Alle als PDF
                </Button>
              )}
            </div>
          </div>

        {/* Inquiries List */}
        {inquiries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Keine Anfragen</h3>
              <p className="text-muted-foreground text-sm">
                Sobald jemand das Kontaktformular ausfüllt, erscheinen die Anfragen hier.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((inquiry) => (
              <Card 
                key={inquiry.id}
                className={`cursor-pointer transition-colors hover:bg-secondary/50 ${!inquiry.read ? 'border-primary/50 bg-primary/5' : ''}`}
                onClick={() => openInquiry(inquiry)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {!inquiry.read && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">{inquiry.name}</span>
                        {inquiry.company && (
                          <span className="text-xs text-muted-foreground">({inquiry.company})</span>
                        )}
                        {inquiry.replied && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Beantwortet
                          </Badge>
                        )}
                        {inquiry.inquiryType && (
                          <Badge variant="secondary" className="text-xs">
                            {getInquiryTypeLabel(inquiry.inquiryType)}
                          </Badge>
                        )}
                        {inquiry.attachments && inquiry.attachments.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Paperclip className="h-3 w-3 mr-1" />
                            {inquiry.attachments.length}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{inquiry.email}</p>
                      <p className="text-sm mt-1 truncate">
                        {inquiry.subject || inquiry.message.substring(0, 60)}...
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {format(new Date(inquiry.createdAt), 'dd.MM.yy HH:mm', { locale: de })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </TabsContent>

        <TabsContent value="settings">
          <NotionWorkflowEditor
            config={notionWorkflow}
            onChange={handleNotionWorkflowChange}
            apiBaseUrl={settings.apiBaseUrl}
            legacyApiKey={settings.notionApiKey}
            legacyDatabaseId={settings.notionDatabaseId}
            legacyEnabled={settings.notionEnabled}
          />
        </TabsContent>
      </Tabs>

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && closeInquiry()}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Anfrage Details
            </DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              {/* Inquiry Link */}
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <code className="text-xs flex-1 truncate text-muted-foreground">
                  {getInquiryLink(selectedInquiry.id)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyInquiryLink(selectedInquiry.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">E-Mail</Label>
                  <a 
                    href={`mailto:${selectedInquiry.email}`}
                    className="font-medium text-primary hover:underline block"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>
                
                {selectedInquiry.phone && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Telefon
                    </Label>
                    <a 
                      href={`tel:${selectedInquiry.phone}`}
                      className="font-medium text-primary hover:underline block"
                    >
                      {selectedInquiry.phone}
                    </a>
                  </div>
                )}
                
                {selectedInquiry.company && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Firma
                    </Label>
                    <p className="font-medium">{selectedInquiry.company}</p>
                  </div>
                )}

                {selectedInquiry.inquiryType && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Anfrage-Art
                    </Label>
                    <p className="font-medium">{getInquiryTypeLabel(selectedInquiry.inquiryType)}</p>
                  </div>
                )}

                {selectedInquiry.budget && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Wallet className="h-3 w-3" /> Budget
                    </Label>
                    <p className="font-medium">{getBudgetLabel(selectedInquiry.budget)}</p>
                  </div>
                )}

                <div className="col-span-2">
                  <Label className="text-muted-foreground">Betreff</Label>
                  <p className="font-medium">{selectedInquiry.subject || '(kein Betreff)'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Datum</Label>
                  <p>{format(new Date(selectedInquiry.createdAt), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr</p>
                </div>
              </div>
              
              {/* Message */}
              <div>
                <Label className="text-muted-foreground">Nachricht</Label>
                <div className="mt-2 p-4 bg-secondary rounded-lg whitespace-pre-wrap text-sm">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Attachments */}
              {selectedInquiry.attachments && selectedInquiry.attachments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Paperclip className="h-3 w-3" /> Anhänge ({selectedInquiry.attachments.length})
                    </Label>
                    {selectedInquiry.attachments.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadAllAttachments(selectedInquiry)}
                      >
                        <FileArchive className="h-4 w-4 mr-1" />
                        Alle als ZIP
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {selectedInquiry.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getAttachmentIcon(attachment.type)}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {getFileTypeLabel(attachment.type)} • {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadAttachment(attachment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = `mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject || 'Ihre Anfrage'}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Antworten
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportSingle(selectedInquiry)}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Als PDF
                </Button>
                <Button
                  variant={selectedInquiry.replied ? "secondary" : "default"}
                  onClick={() => toggleReplied(selectedInquiry.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {selectedInquiry.replied ? 'Als offen markieren' : 'Als beantwortet markieren'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anfrage löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Diese Aktion kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteInquiry(selectedInquiry.id)}>
                        Löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
