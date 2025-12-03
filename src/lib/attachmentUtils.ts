import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Inquiry, InquiryAttachment } from '@/types/inquiry';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES = 5;
export const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

export function getFileTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'Bild (JPEG)',
    'image/png': 'Bild (PNG)',
    'image/gif': 'Bild (GIF)',
    'image/webp': 'Bild (WebP)',
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'text/plain': 'Text',
    'text/csv': 'CSV',
  };
  return typeMap[type] || 'Datei';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(base64: string, type: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type });
}

export function downloadAttachment(attachment: InquiryAttachment) {
  const blob = base64ToBlob(attachment.data, attachment.type);
  saveAs(blob, attachment.name);
}

export async function downloadAllAttachments(inquiry: Inquiry) {
  if (!inquiry.attachments || inquiry.attachments.length === 0) return;

  const zip = new JSZip();
  
  for (const attachment of inquiry.attachments) {
    const blob = base64ToBlob(attachment.data, attachment.type);
    zip.file(attachment.name, blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const fileName = `Anhaenge_${inquiry.name.replace(/\s+/g, '_')}_${inquiry.id.substring(0, 8)}.zip`;
  saveAs(content, fileName);
}

export async function downloadAllInquiryAttachments(inquiries: Inquiry[]) {
  const zip = new JSZip();
  let hasFiles = false;

  for (const inquiry of inquiries) {
    if (inquiry.attachments && inquiry.attachments.length > 0) {
      const folderName = `${inquiry.name.replace(/\s+/g, '_')}_${inquiry.id.substring(0, 8)}`;
      const folder = zip.folder(folderName);
      
      for (const attachment of inquiry.attachments) {
        const blob = base64ToBlob(attachment.data, attachment.type);
        folder?.file(attachment.name, blob);
        hasFiles = true;
      }
    }
  }

  if (!hasFiles) return false;

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `Alle_Anhaenge_${new Date().toISOString().split('T')[0]}.zip`);
  return true;
}
