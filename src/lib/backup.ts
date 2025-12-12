/**
 * ============================================================================
 * AI NOTES: BACKUP & RESTORE SYSTEM
 * ============================================================================
 * 
 * This module handles full backup/restore functionality for the CMS.
 * 
 * KEY CONCEPTS:
 * - BACKUP_VERSION: Human-readable version string
 * - SCHEMA_VERSION: Numeric version for migration logic
 * - All data is stored with metadata for future compatibility
 * 
 * TO ADD NEW DATA TYPES TO BACKUP:
 * 1. Add the type to BackupData interface
 * 2. Add default value in createEmptyBackup()
 * 3. Add extraction logic in createFullBackup()
 * 4. Add import logic in the component that uses this backup
 * 5. If needed, add migration in MIGRATIONS object
 * 
 * TO ADD A NEW MIGRATION (when schema changes):
 * 1. Increment SCHEMA_VERSION
 * 2. Add migration function to MIGRATIONS object
 * 3. The migration function receives the old data and returns updated data
 * 
 * MIGRATION EXAMPLE:
 * If you add a new field "socialTiktok" to settings in schema v2:
 * ```
 * const MIGRATIONS: Record<number, MigrationFn> = {
 *   2: (data) => ({
 *     ...data,
 *     settings: {
 *       ...data.settings,
 *       socialTiktok: data.settings.socialTiktok || ''
 *     }
 *   })
 * };
 * ```
 * ============================================================================
 */

import { Category, Product, Project, Post, SiteSettings, initialSettings } from '@/data/initialData';
import { Theme, ThemeConfig, initialThemeConfig } from '@/data/themes';
import { AnalyticsEvent } from '@/contexts/AnalyticsContext';
import { Inquiry } from '@/types/inquiry';

// Version constants
export const BACKUP_VERSION = '2.0.0';
export const SCHEMA_VERSION = 2;

// Backup metadata
export interface BackupMeta {
  version: string;
  schemaVersion: number;
  exportedAt: string;
  appName: string;
  source?: string;
  features?: string[]; // What features are included in this backup
  migrationNotes?: string[]; // Notes about data that was skipped during migration
}

// Complete backup data structure
export interface BackupData {
  _meta: BackupMeta;
  categories?: Category[];
  products?: Product[];
  projects?: Project[];
  posts?: Post[];
  settings?: SiteSettings;
  themes?: {
    activeThemeId: string;
    customThemes: Theme[];
  };
  analytics?: {
    events: AnalyticsEvent[];
    includeAnalytics: boolean;
  };
  inquiries?: Inquiry[];
}

// Options for creating backup
export interface BackupOptions {
  includeCategories?: boolean;
  includeProducts?: boolean;
  includeProjects?: boolean;
  includePosts?: boolean;
  includeSettings?: boolean;
  includeThemes?: boolean;
  includeAnalytics?: boolean;
  includeInquiries?: boolean;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  meta?: BackupMeta;
  summary?: {
    categories: number;
    products: number;
    projects: number;
    posts: number;
    inquiries: number;
    hasSettings: boolean;
    hasThemes: boolean;
    hasAnalytics: boolean;
  };
}

// Import result
export interface ImportResult {
  success: boolean;
  error?: string;
  migrated: boolean;
  fromVersion?: number;
  toVersion?: number;
  data?: BackupData;
}

// Migration function type
type MigrationFn = (data: BackupData) => BackupData;

/**
 * ============================================================================
 * MIGRATIONS - Add new migrations here when schema changes
 * ============================================================================
 * 
 * Each key is the TARGET schema version.
 * The function receives data from the PREVIOUS version and returns updated data.
 * 
 * Example: If current SCHEMA_VERSION is 3, and importing v1 data:
 * - First runs MIGRATIONS[2](v1_data) -> v2_data
 * - Then runs MIGRATIONS[3](v2_data) -> v3_data
 * ============================================================================
 */
const MIGRATIONS: Record<number, MigrationFn> = {
  // Migration from v1 to v2: Remove portfolio and blog, keep data for backward compatibility
  2: (data) => {
    const migrationNotes: string[] = [];
    
    // Note removed features but don't delete them (for backward compat)
    if (data.projects && data.projects.length > 0) {
      migrationNotes.push(`Portfolio: ${data.projects.length} Projekte übersprungen (Feature entfernt)`);
    }
    if (data.posts && data.posts.length > 0) {
      migrationNotes.push(`Blog: ${data.posts.length} Posts übersprungen (Feature entfernt)`);
    }
    
    return {
      ...data,
      _meta: {
        ...data._meta,
        migrationNotes,
        features: ['categories', 'products', 'settings', 'themes', 'analytics', 'inquiries'],
      },
      // Keep projects and posts in backup for compatibility, but they won't be imported
    };
  },
};

/**
 * Create an empty backup structure with defaults
 */
function createEmptyBackup(): BackupData {
  return {
    _meta: {
      version: BACKUP_VERSION,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appName: 'Kernel CMS',
    },
    categories: [],
    products: [],
    projects: [],
    posts: [],
    settings: initialSettings,
    themes: initialThemeConfig,
    analytics: {
      events: [],
      includeAnalytics: false,
    },
    inquiries: [],
  };
}

/**
 * Create a full backup with selected data
 */
export function createFullBackup(
  data: {
    categories: Category[];
    products: Product[];
    projects: Project[];
    posts: Post[];
    settings: SiteSettings;
    themeConfig: ThemeConfig;
    analyticsEvents: AnalyticsEvent[];
    inquiries: Inquiry[];
  },
  options: BackupOptions = {}
): BackupData {
  const {
    includeCategories = true,
    includeProducts = true,
    includeProjects = true,
    includePosts = true,
    includeSettings = true,
    includeThemes = true,
    includeAnalytics = false,
    includeInquiries = true,
  } = options;

  const backup: BackupData = {
    _meta: {
      version: BACKUP_VERSION,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appName: 'Kernel CMS',
      source: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    },
  };

  if (includeCategories) backup.categories = data.categories;
  if (includeProducts) backup.products = data.products;
  if (includeProjects) backup.projects = data.projects;
  if (includePosts) backup.posts = data.posts;
  if (includeSettings) backup.settings = data.settings;
  if (includeThemes) {
    backup.themes = {
      activeThemeId: data.themeConfig.activeThemeId,
      customThemes: data.themeConfig.customThemes,
    };
  }
  if (includeAnalytics) {
    backup.analytics = {
      events: data.analyticsEvents,
      includeAnalytics: true,
    };
  }
  if (includeInquiries) backup.inquiries = data.inquiries;

  return backup;
}

/**
 * Validate backup data before import
 */
export function validateBackup(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data is object
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Ungültiges Backup-Format: Keine gültigen Daten gefunden'], warnings };
  }

  const backupData = data as BackupData;

  // Check for _meta
  if (!backupData._meta) {
    errors.push('Fehlende Metadaten (_meta) - möglicherweise kein gültiges Backup');
  } else {
    // Check schema version
    if (typeof backupData._meta.schemaVersion !== 'number') {
      warnings.push('Schema-Version fehlt - wird als v1 behandelt');
    } else if (backupData._meta.schemaVersion > SCHEMA_VERSION) {
      errors.push(`Backup-Version (v${backupData._meta.schemaVersion}) ist neuer als unterstützte Version (v${SCHEMA_VERSION})`);
    }
  }

  // Validate arrays
  if (backupData.categories && !Array.isArray(backupData.categories)) {
    errors.push('Kategorien müssen ein Array sein');
  }
  if (backupData.products && !Array.isArray(backupData.products)) {
    errors.push('Produkte müssen ein Array sein');
  }
  if (backupData.projects && !Array.isArray(backupData.projects)) {
    errors.push('Projekte müssen ein Array sein');
  }
  if (backupData.posts && !Array.isArray(backupData.posts)) {
    errors.push('Blog-Posts müssen ein Array sein');
  }

  // Validate inquiries
  if (backupData.inquiries && !Array.isArray(backupData.inquiries)) {
    errors.push('Anfragen müssen ein Array sein');
  }

  // Create summary
  const summary = {
    categories: Array.isArray(backupData.categories) ? backupData.categories.length : 0,
    products: Array.isArray(backupData.products) ? backupData.products.length : 0,
    projects: Array.isArray(backupData.projects) ? backupData.projects.length : 0,
    posts: Array.isArray(backupData.posts) ? backupData.posts.length : 0,
    inquiries: Array.isArray(backupData.inquiries) ? backupData.inquiries.length : 0,
    hasSettings: !!backupData.settings,
    hasThemes: !!backupData.themes,
    hasAnalytics: !!backupData.analytics?.events?.length,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    meta: backupData._meta,
    summary,
  };
}

/**
 * Migrate backup data to current schema version
 */
export function migrateBackup(data: BackupData): BackupData {
  const sourceVersion = data._meta?.schemaVersion || 1;
  
  if (sourceVersion >= SCHEMA_VERSION) {
    return data;
  }

  let migratedData = { ...data };

  // Run migrations in order
  for (let v = sourceVersion + 1; v <= SCHEMA_VERSION; v++) {
    if (MIGRATIONS[v]) {
      console.log(`[Backup] Migrating from v${v - 1} to v${v}`);
      migratedData = MIGRATIONS[v](migratedData);
    }
  }

  // Update meta
  migratedData._meta = {
    ...migratedData._meta,
    schemaVersion: SCHEMA_VERSION,
    version: BACKUP_VERSION,
  };

  return migratedData;
}

/**
 * Import and validate backup data
 */
export function importBackup(rawData: unknown): ImportResult {
  // Validate first
  const validation = validateBackup(rawData);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join('; '),
      migrated: false,
    };
  }

  const data = rawData as BackupData;
  const sourceVersion = data._meta?.schemaVersion || 1;

  // Migrate if needed
  let processedData = data;
  let migrated = false;

  if (sourceVersion < SCHEMA_VERSION) {
    processedData = migrateBackup(data);
    migrated = true;
  }

  // Fill missing fields with defaults
  const defaults = createEmptyBackup();
  const finalData: BackupData = {
    _meta: processedData._meta,
    categories: processedData.categories || defaults.categories,
    products: processedData.products || defaults.products,
    projects: processedData.projects || defaults.projects,
    posts: processedData.posts || defaults.posts,
    settings: processedData.settings ? { ...defaults.settings, ...processedData.settings } : defaults.settings,
    themes: processedData.themes || defaults.themes,
    analytics: processedData.analytics || defaults.analytics,
    inquiries: processedData.inquiries || defaults.inquiries,
  };

  return {
    success: true,
    migrated,
    fromVersion: sourceVersion,
    toVersion: SCHEMA_VERSION,
    data: finalData,
  };
}

/**
 * Download backup as JSON file
 */
export function downloadBackup(backup: BackupData, filename?: string): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toISOString().split('T')[0];
  const defaultFilename = `kernel-cms-backup-${date}.json`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse backup file
 */
export function parseBackupFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Ungültige JSON-Datei'));
      }
    };
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
    reader.readAsText(file);
  });
}
