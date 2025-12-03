// localStorage utilities for content management

const STORAGE_KEYS = {
  AUTH: 'admin_auth',
  CATEGORIES: 'cms_categories',
  PRODUCTS: 'cms_products',
  PROJECTS: 'cms_projects',
  POSTS: 'cms_posts',
  SETTINGS: 'cms_settings',
} as const;

// Generic storage functions
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

export { STORAGE_KEYS };
