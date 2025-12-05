// localStorage utilities for content management with server API fallback

const STORAGE_KEYS = {
  AUTH: 'admin_auth',
  CATEGORIES: 'cms_categories',
  PRODUCTS: 'cms_products',
  PROJECTS: 'cms_projects',
  POSTS: 'cms_posts',
  SETTINGS: 'cms_settings',
  THEME: 'cms_theme',
  INQUIRIES: 'cms_inquiries',
} as const;

// Check if we're running on the production server (not Lovable preview)
function isServerAvailable(): boolean {
  // In production, API is available at same origin
  // In Lovable preview, there's no server, so we fall back to localStorage
  return typeof window !== 'undefined' && !window.location.hostname.includes('lovable');
}

// Generic storage functions (localStorage fallback)
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageItem(key: string): void {
  localStorage.removeItem(key);
}

// ============================================================================
// SERVER API FUNCTIONS
// ============================================================================

interface ContentData {
  categories: unknown[];
  products: unknown[];
  projects: unknown[];
  posts: unknown[];
  settings: unknown;
}

interface ThemeData {
  activeThemeId: string;
  customThemes: unknown[];
}

// Fetch content from server
export async function fetchContentFromServer(): Promise<ContentData | null> {
  if (!isServerAvailable()) return null;
  
  try {
    const response = await fetch('/api/content');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Server not available, using localStorage fallback');
  }
  return null;
}

// Save content to server
export async function saveContentToServer(content: ContentData): Promise<boolean> {
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    return response.ok;
  } catch (error) {
    console.warn('Failed to save to server, using localStorage fallback');
    return false;
  }
}

// Fetch theme from server
export async function fetchThemeFromServer(): Promise<ThemeData | null> {
  if (!isServerAvailable()) return null;
  
  try {
    const response = await fetch('/api/theme');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Server not available for theme, using localStorage fallback');
  }
  return null;
}

// Save theme to server
export async function saveThemeToServer(theme: ThemeData): Promise<boolean> {
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    return response.ok;
  } catch (error) {
    console.warn('Failed to save theme to server, using localStorage fallback');
    return false;
  }
}

// Fetch inquiries from server
export async function fetchInquiriesFromServer(): Promise<unknown[] | null> {
  if (!isServerAvailable()) return null;
  
  try {
    const response = await fetch('/api/inquiries');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Server not available for inquiries, using localStorage fallback');
  }
  return null;
}

// Save inquiry to server
export async function saveInquiryToServer(inquiry: unknown): Promise<boolean> {
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    });
    return response.ok;
  } catch (error) {
    console.warn('Failed to save inquiry to server');
    return false;
  }
}

// Delete inquiry from server
export async function deleteInquiryFromServer(id: string): Promise<boolean> {
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch(`/api/inquiries/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.warn('Failed to delete inquiry from server');
    return false;
  }
}

// Bulk save inquiries to server
export async function saveAllInquiriesToServer(inquiries: unknown[]): Promise<boolean> {
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch('/api/inquiries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiries),
    });
    return response.ok;
  } catch (error) {
    console.warn('Failed to bulk save inquiries to server');
    return false;
  }
}

export { STORAGE_KEYS };
