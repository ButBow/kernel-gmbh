// localStorage utilities for content management with server API fallback

const STORAGE_KEYS = {
  AUTH: 'admin_auth',
  AUTH_TOKEN: 'admin_auth_token',
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

// Get auth token from localStorage
function getAuthToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

// Set auth token
function setAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

// Remove auth token
function removeAuthToken(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
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
// AUTHENTICATION API
// ============================================================================

interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
  expiresIn?: number;
}

// Server login - returns auth token
export async function serverLogin(password: string): Promise<LoginResponse> {
  if (!isServerAvailable()) {
    // Fallback for Lovable preview - simple password check
    return { success: false, error: 'Server nicht verfügbar' };
  }
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  } catch (error) {
    console.warn('Login request failed');
    return { success: false, error: 'Verbindungsfehler' };
  }
}

// Server logout
export async function serverLogout(): Promise<void> {
  const token = getAuthToken();
  
  if (isServerAvailable() && token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore errors
    }
  }
  
  removeAuthToken();
}

// Verify token is still valid
export async function verifyAuthToken(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    
    if (!data.valid) {
      removeAuthToken();
    }
    
    return data.valid;
  } catch {
    return false;
  }
}

// ============================================================================
// SERVER API FUNCTIONS (with auth)
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

// Get headers with auth token
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Fetch content from server with timeout
export async function fetchContentFromServer(): Promise<ContentData | null> {
  if (!isServerAvailable()) return null;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    const response = await fetch('/api/content', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Server not available or timeout, using localStorage fallback');
  }
  return null;
}

// Save content to server (requires auth)
export async function saveContentToServer(content: ContentData): Promise<boolean> {
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(content),
    });
    
    if (response.status === 401) {
      console.warn('Unauthorized - please login again');
      removeAuthToken();
      return false;
    }
    
    return response.ok;
  } catch (error) {
    console.warn('Failed to save to server, using localStorage fallback');
    return false;
  }
}

// Fetch theme from server with timeout
export async function fetchThemeFromServer(): Promise<ThemeData | null> {
  if (!isServerAvailable()) return null;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    const response = await fetch('/api/theme', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Server not available for theme or timeout, using localStorage fallback');
  }
  return null;
}

// Save theme to server (requires auth)
export async function saveThemeToServer(theme: ThemeData): Promise<boolean> {
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch('/api/theme', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(theme),
    });
    
    if (response.status === 401) {
      console.warn('Unauthorized - please login again');
      removeAuthToken();
      return false;
    }
    
    return response.ok;
  } catch (error) {
    console.warn('Failed to save theme to server, using localStorage fallback');
    return false;
  }
}

// Fetch inquiries from server (requires auth)
export async function fetchInquiriesFromServer(): Promise<unknown[] | null> {
  if (!isServerAvailable()) return null;
  
  try {
    const response = await fetch('/api/inquiries', {
      headers: getAuthHeaders(),
    });
    
    if (response.status === 401) {
      console.warn('Unauthorized - please login again');
      return null;
    }
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Server not available for inquiries, using localStorage fallback');
  }
  return null;
}

// Save inquiry to server (public - for contact form)
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

// Delete inquiry from server (requires auth)
export async function deleteInquiryFromServer(id: string): Promise<boolean> {
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch(`/api/inquiries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (response.status === 401) {
      console.warn('Unauthorized - please login again');
      removeAuthToken();
      return false;
    }
    
    return response.ok;
  } catch (error) {
    console.warn('Failed to delete inquiry from server');
    return false;
  }
}

// Bulk save inquiries to server (requires auth)
export async function saveAllInquiriesToServer(inquiries: unknown[]): Promise<boolean> {
  if (!isServerAvailable()) return false;
  
  try {
    const response = await fetch('/api/inquiries', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(inquiries),
    });
    
    if (response.status === 401) {
      console.warn('Unauthorized - please login again');
      removeAuthToken();
      return false;
    }
    
    return response.ok;
  } catch (error) {
    console.warn('Failed to bulk save inquiries to server');
    return false;
  }
}

export { STORAGE_KEYS, getAuthToken, setAuthToken, removeAuthToken };