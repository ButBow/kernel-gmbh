import jsPDF from 'jspdf';
import { Inquiry, INQUIRY_TYPES, BUDGET_RANGES } from '@/types/inquiry';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN * 2 - 30; // Leave space for footer

function addFooter(doc: jsPDF, inquiry: Inquiry, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = doc.internal.pageSize.getHeight() - 15;
  
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, footerY - 5, pageWidth - MARGIN, footerY - 5);
  
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text(`Generiert am ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr`, MARGIN, footerY);
  doc.text(`ID: ${inquiry.id.substring(0, 8)}`, pageWidth / 2 - 15, footerY);
  doc.text(`Seite ${pageNum} von ${totalPages}`, pageWidth - MARGIN - 25, footerY);
}

function addHeader(doc: jsPDF, inquiry: Inquiry, isFirstPage: boolean) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  if (isFirstPage) {
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Kontaktanfrage', MARGIN, 28);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Eingegangen am ${format(new Date(inquiry.createdAt), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr`, MARGIN, 38);
    return 60;
  } else {
    doc.setFillColor(241, 245, 249);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Kontaktanfrage - ${inquiry.name} (Fortsetzung)`, MARGIN, 16);
    return 35;
  }
}

export function exportInquiryToPDF(inquiry: Inquiry) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = addHeader(doc, inquiry, true);
  let currentPage = 1;
  const pages: number[] = [1];

  // Status Badge
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  if (inquiry.replied) {
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(MARGIN, y - 6, 30, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Beantwortet', MARGIN + 3, y);
  } else if (inquiry.read) {
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(MARGIN, y - 6, 25, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Gelesen', MARGIN + 3, y);
  } else {
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(MARGIN, y - 6, 15, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Neu', MARGIN + 3, y);
  }

  y += 15;

  // Contact Info Section
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('KONTAKTDATEN', MARGIN, y);
  y += 8;

  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += 10;

  const col1X = MARGIN;
  const col2X = pageWidth / 2 + 10;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  // Name
  doc.setFont('helvetica', 'bold');
  doc.text('Name:', col1X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(inquiry.name, col1X + 25, y);

  // Email
  doc.setFont('helvetica', 'bold');
  doc.text('E-Mail:', col2X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(inquiry.email, col2X + 25, y);

  y += 10;

  if (inquiry.phone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Telefon:', col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(inquiry.phone, col1X + 25, y);
  }

  if (inquiry.company) {
    doc.setFont('helvetica', 'bold');
    doc.text('Firma:', col2X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(inquiry.company, col2X + 25, y);
  }

  if (inquiry.phone || inquiry.company) {
    y += 10;
  }

  const inquiryTypeLabel = INQUIRY_TYPES.find(t => t.value === inquiry.inquiryType)?.label;
  const budgetLabel = BUDGET_RANGES.find(b => b.value === inquiry.budget)?.label;

  if (inquiryTypeLabel) {
    doc.setFont('helvetica', 'bold');
    doc.text('Anfrage-Art:', col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(inquiryTypeLabel, col1X + 35, y);
  }

  if (budgetLabel) {
    doc.setFont('helvetica', 'bold');
    doc.text('Budget:', col2X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(budgetLabel, col2X + 25, y);
  }

  if (inquiryTypeLabel || budgetLabel) {
    y += 10;
  }

  y += 10;

  // Subject Section
  if (inquiry.subject) {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BETREFF', MARGIN, y);
    y += 8;

    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    y += 10;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(inquiry.subject, MARGIN, y);
    y += 15;
  }

  // Message Section
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NACHRICHT', MARGIN, y);
  y += 8;

  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += 10;

  // Message with multi-page support
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const maxTextWidth = pageWidth - MARGIN * 2 - 10;
  const messageLines = doc.splitTextToSize(inquiry.message, maxTextWidth);
  const lineHeight = 6;

  for (let i = 0; i < messageLines.length; i++) {
    if (y > CONTENT_HEIGHT + 50) {
      currentPage++;
      pages.push(currentPage);
      doc.addPage();
      y = addHeader(doc, inquiry, false);
    }
    
    // Draw background for message
    if (i === 0 || y === addHeader(doc, inquiry, false)) {
      doc.setFillColor(248, 250, 252);
    }
    
    doc.text(messageLines[i], MARGIN + 5, y);
    y += lineHeight;
  }

  y += 10;

  // Attachments Section
  if (inquiry.attachments && inquiry.attachments.length > 0) {
    if (y > CONTENT_HEIGHT + 30) {
      currentPage++;
      pages.push(currentPage);
      doc.addPage();
      y = addHeader(doc, inquiry, false);
    }

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ANHÄNGE', MARGIN, y);
    y += 8;

    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    y += 10;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    for (const attachment of inquiry.attachments) {
      if (y > CONTENT_HEIGHT + 30) {
        currentPage++;
        pages.push(currentPage);
        doc.addPage();
        y = addHeader(doc, inquiry, false);
      }

      const sizeKB = Math.round(attachment.size / 1024);
      doc.text(`• ${attachment.name} (${sizeKB} KB)`, MARGIN + 5, y);
      y += 8;

      // Embed image attachments
      if (attachment.type.startsWith('image/')) {
        try {
          const imgHeight = 60;
          const imgWidth = 80;
          
          if (y + imgHeight > CONTENT_HEIGHT + 30) {
            currentPage++;
            pages.push(currentPage);
            doc.addPage();
            y = addHeader(doc, inquiry, false);
          }

          doc.addImage(attachment.data, 'JPEG', MARGIN + 5, y, imgWidth, imgHeight);
          y += imgHeight + 10;
        } catch (e) {
          console.error('Could not embed image:', e);
        }
      }
    }
  }

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, inquiry, i, totalPages);
  }

  const fileName = `Anfrage_${inquiry.name.replace(/\s+/g, '_')}_${format(new Date(inquiry.createdAt), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

export function exportAllInquiriesToPDF(inquiries: Inquiry[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Anfragen-Übersicht', MARGIN, 28);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inquiries.length} Anfragen | Stand: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}`, MARGIN, 38);

  let y = 60;

  const unread = inquiries.filter(i => !i.read).length;
  const replied = inquiries.filter(i => i.replied).length;
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(`Ungelesen: ${unread}  |  Beantwortet: ${replied}  |  Offen: ${inquiries.length - replied}`, MARGIN, y);
  
  y += 15;

  doc.setFillColor(241, 245, 249);
  doc.rect(MARGIN, y, pageWidth - MARGIN * 2, 10, 'F');
  
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Datum', MARGIN + 3, y + 7);
  doc.text('Name', MARGIN + 35, y + 7);
  doc.text('E-Mail', MARGIN + 75, y + 7);
  doc.text('Betreff', MARGIN + 120, y + 7);
  doc.text('Status', pageWidth - MARGIN - 20, y + 7);

  y += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  inquiries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .forEach((inquiry, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(MARGIN, y - 5, pageWidth - MARGIN * 2, 10, 'F');
      }

      doc.setTextColor(30, 41, 59);
      doc.text(format(new Date(inquiry.createdAt), 'dd.MM.yy', { locale: de }), MARGIN + 3, y + 2);
      doc.text(inquiry.name.substring(0, 15), MARGIN + 35, y + 2);
      doc.text(inquiry.email.substring(0, 20), MARGIN + 75, y + 2);
      doc.text((inquiry.subject || inquiry.message).substring(0, 18) + '...', MARGIN + 120, y + 2);
      
      const status = inquiry.replied ? 'Beantwortet' : (inquiry.read ? 'Gelesen' : 'Neu');
      doc.setTextColor(inquiry.replied ? 34 : (inquiry.read ? 59 : 245), inquiry.replied ? 197 : (inquiry.read ? 130 : 158), inquiry.replied ? 94 : (inquiry.read ? 246 : 11));
      doc.text(status, pageWidth - MARGIN - 20, y + 2);

      y += 10;
    });

  const fileName = `Anfragen_Uebersicht_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
