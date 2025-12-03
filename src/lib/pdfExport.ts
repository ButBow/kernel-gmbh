import jsPDF from 'jspdf';
import { Inquiry, INQUIRY_TYPES, BUDGET_RANGES } from '@/types/inquiry';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function exportInquiryToPDF(inquiry: Inquiry, companyName: string = 'Unternehmen') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Kontaktanfrage', margin, 28);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Eingegangen am ${format(new Date(inquiry.createdAt), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr`, margin, 38);

  y = 60;

  // Status Badge
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  if (inquiry.replied) {
    doc.setFillColor(34, 197, 94); // green
    doc.roundedRect(margin, y - 6, 30, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Beantwortet', margin + 3, y);
  } else if (inquiry.read) {
    doc.setFillColor(59, 130, 246); // blue
    doc.roundedRect(margin, y - 6, 25, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Gelesen', margin + 3, y);
  } else {
    doc.setFillColor(245, 158, 11); // amber
    doc.roundedRect(margin, y - 6, 15, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Neu', margin + 3, y);
  }

  y += 15;

  // Contact Info Section
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('KONTAKTDATEN', margin, y);
  y += 8;

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Two column layout for contact info
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const col1X = margin;
  const col2X = pageWidth / 2 + 10;

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

  // Phone (if exists)
  if (inquiry.phone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Telefon:', col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(inquiry.phone, col1X + 25, y);
  }

  // Company (if exists)
  if (inquiry.company) {
    doc.setFont('helvetica', 'bold');
    doc.text('Firma:', col2X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(inquiry.company, col2X + 25, y);
  }

  if (inquiry.phone || inquiry.company) {
    y += 10;
  }

  // Inquiry Type and Budget
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
    doc.text('BETREFF', margin, y);
    y += 8;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(inquiry.subject, margin, y);
    y += 15;
  }

  // Message Section
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NACHRICHT', margin, y);
  y += 8;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Message Box
  doc.setFillColor(248, 250, 252); // slate-50
  const messageLines = doc.splitTextToSize(inquiry.message, pageWidth - margin * 2 - 10);
  const messageHeight = messageLines.length * 6 + 15;
  doc.roundedRect(margin, y - 5, pageWidth - margin * 2, messageHeight, 3, 3, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(messageLines, margin + 5, y + 5);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(9);
  doc.text(`Generiert am ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr`, margin, footerY);
  doc.text(`ID: ${inquiry.id.substring(0, 8)}`, pageWidth - margin - 30, footerY);

  // Save
  const fileName = `Anfrage_${inquiry.name.replace(/\s+/g, '_')}_${format(new Date(inquiry.createdAt), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

export function exportAllInquiriesToPDF(inquiries: Inquiry[], companyName: string = 'Unternehmen') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Anfragen-Übersicht', margin, 28);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inquiries.length} Anfragen | Stand: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}`, margin, 38);

  let y = 60;

  // Statistics
  const unread = inquiries.filter(i => !i.read).length;
  const replied = inquiries.filter(i => i.replied).length;
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(`Ungelesen: ${unread}  |  Beantwortet: ${replied}  |  Offen: ${inquiries.length - replied}`, margin, y);
  
  y += 15;

  // Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');
  
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Datum', margin + 3, y + 7);
  doc.text('Name', margin + 35, y + 7);
  doc.text('E-Mail', margin + 75, y + 7);
  doc.text('Betreff', margin + 120, y + 7);
  doc.text('Status', pageWidth - margin - 20, y + 7);

  y += 15;

  // Table Rows
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
        doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
      }

      doc.setTextColor(30, 41, 59);
      doc.text(format(new Date(inquiry.createdAt), 'dd.MM.yy', { locale: de }), margin + 3, y + 2);
      doc.text(inquiry.name.substring(0, 15), margin + 35, y + 2);
      doc.text(inquiry.email.substring(0, 20), margin + 75, y + 2);
      doc.text((inquiry.subject || inquiry.message).substring(0, 18) + '...', margin + 120, y + 2);
      
      // Status
      const status = inquiry.replied ? 'Beantwortet' : (inquiry.read ? 'Gelesen' : 'Neu');
      doc.setTextColor(inquiry.replied ? 34 : (inquiry.read ? 59 : 245), inquiry.replied ? 197 : (inquiry.read ? 130 : 158), inquiry.replied ? 94 : (inquiry.read ? 246 : 11));
      doc.text(status, pageWidth - margin - 20, y + 2);

      y += 10;
    });

  // Save
  const fileName = `Anfragen_Uebersicht_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
