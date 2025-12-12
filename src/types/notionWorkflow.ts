/**
 * Notion Workflow Configuration Types
 * 
 * Defines the structure for multi-database Notion integration
 * where different inquiry fields can be routed to different databases.
 */

// All possible inquiry fields that can be mapped
export const INQUIRY_FIELDS = [
  { id: 'name', label: 'Name', notionType: 'title' as const },
  { id: 'email', label: 'E-Mail', notionType: 'email' as const },
  { id: 'phone', label: 'Telefon', notionType: 'phone_number' as const },
  { id: 'company', label: 'Firma', notionType: 'rich_text' as const },
  { id: 'inquiryType', label: 'Anfrage-Art', notionType: 'select' as const },
  { id: 'budget', label: 'Budget', notionType: 'select' as const },
  { id: 'subject', label: 'Betreff', notionType: 'rich_text' as const },
  { id: 'message', label: 'Nachricht', notionType: 'rich_text' as const },
  { id: 'selectedPackage', label: 'Produkt/Paket', notionType: 'multi_select' as const },
  { id: 'projectId', label: 'Projekt ID', notionType: 'rich_text' as const },
  { id: 'hasAttachments', label: 'Hat Anhänge', notionType: 'checkbox' as const },
  { id: 'inquiryLink', label: 'Anfragen-Link', notionType: 'url' as const },
  { id: 'createdAt', label: 'Eingegangen', notionType: 'date' as const },
  { id: 'status', label: 'Status', notionType: 'select' as const },
] as const;

export type NotionPropertyType = 
  | 'title' 
  | 'email' 
  | 'phone_number' 
  | 'rich_text' 
  | 'select' 
  | 'multi_select' 
  | 'date' 
  | 'checkbox' 
  | 'number' 
  | 'url';

export interface FieldMapping {
  inquiryField: string;        // e.g., "name", "email"
  notionProperty: string;       // e.g., "Name", "E-Mail"
  notionType: NotionPropertyType;
}

export interface NotionDatabase {
  id: string;                   // Unique ID for this config entry
  name: string;                 // Display name, e.g., "Kunden-CRM"
  databaseId: string;           // Notion Database ID
  fieldMappings: FieldMapping[];
  enabled: boolean;
}

export interface NotionWorkflowConfig {
  apiKey: string;               // Shared API key for all databases
  databases: NotionDatabase[];
  enabled: boolean;             // Master switch
}

export const defaultNotionWorkflowConfig: NotionWorkflowConfig = {
  apiKey: '',
  databases: [],
  enabled: false,
};

// Helper to get default Notion property name for an inquiry field
export function getDefaultNotionPropertyName(fieldId: string): string {
  const field = INQUIRY_FIELDS.find(f => f.id === fieldId);
  return field?.label || fieldId;
}

// Helper to get the Notion type for an inquiry field
export function getNotionTypeForField(fieldId: string): NotionPropertyType {
  const field = INQUIRY_FIELDS.find(f => f.id === fieldId);
  return field?.notionType || 'rich_text';
}
