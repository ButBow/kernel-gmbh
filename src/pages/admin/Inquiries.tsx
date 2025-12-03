import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { Inquiry, INQUIRY_TYPES, BUDGET_RANGES } from '@/types/inquiry';
import { exportInquiryToPDF, exportAllInquiriesToPDF } from '@/lib/pdfExport';
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
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STORAGE_KEY = 'cms_inquiries';

export default function AdminInquiries() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    const stored = getStorageItem<Inquiry[]>(STORAGE_KEY, []);
    setInquiries(stored);
  }, []);

  const saveInquiries = (updated: Inquiry[]) => {
    setInquiries(updated);
    setStorageItem(STORAGE_KEY, updated);
  };

  const markAsRead = (id: string) => {
    const updated = inquiries.map(i => 
      i.id === id ? { ...i, read: true } : i
    );
    saveInquiries(updated);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry({ ...selectedInquiry, read: true });
    }
  };

  const toggleReplied = (id: string) => {
    const updated = inquiries.map(i => 
      i.id === id ? { ...i, replied: !i.replied } : i
    );
    saveInquiries(updated);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry({ ...selectedInquiry, replied: !selectedInquiry.replied });
    }
    toast({
      title: 'Status aktualisiert',
      description: 'Anfrage-Status wurde geändert.',
    });
  };

  const deleteInquiry = (id: string) => {
    const updated = inquiries.filter(i => i.id !== id);
    saveInquiries(updated);
    setSelectedInquiry(null);
    toast({
      title: 'Anfrage gelöscht',
      description: 'Die Anfrage wurde entfernt.',
    });
  };

  const openInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    if (!inquiry.read) {
      markAsRead(inquiry.id);
    }
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

  const getInquiryTypeLabel = (value?: string) => {
    return INQUIRY_TYPES.find(t => t.value === value)?.label;
  };

  const getBudgetLabel = (value?: string) => {
    return BUDGET_RANGES.find(b => b.value === value)?.label;
  };

  const unreadCount = inquiries.filter(i => !i.read).length;

  return (
    <AdminLayout title="Anfragen">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
              {unreadCount} ungelesen
            </Badge>
            <Badge variant="outline">{inquiries.length} gesamt</Badge>
          </div>
          <div className="flex items-center gap-2">
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
      </div>

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Anfrage Details
            </DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
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
