import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  STORAGE_KEYS, getStorageItem, setStorageItem,
  fetchThemeFromServer, saveThemeToServer 
} from '@/lib/storage';
import { 
  Theme, ThemeConfig, ThemeColors,
  initialThemeConfig, presetThemes, getActiveTheme, applyThemeToDocument 
} from '@/data/themes';

interface ThemeContextType {
  themeConfig: ThemeConfig;
  activeTheme: Theme;
  allThemes: Theme[];
  isLoading: boolean;
  
  setActiveTheme: (themeId: string) => void;
  addCustomTheme: (theme: Omit<Theme, 'id' | 'isPreset' | 'createdAt'>) => void;
  updateCustomTheme: (id: string, theme: Partial<Theme>) => void;
  deleteCustomTheme: (id: string) => void;
  duplicateTheme: (themeId: string) => void;
  importThemes: (themes: { activeThemeId: string; customThemes: Theme[] }, mode: 'replace' | 'merge') => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(initialThemeConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Persist theme to server and localStorage
  const persistTheme = useCallback(async (config: ThemeConfig) => {
    // Always save to localStorage as backup
    setStorageItem(STORAGE_KEYS.THEME, config);
    
    // Try to save to server
    await saveThemeToServer(config);
  }, []);

  // Load theme config from server first, fallback to localStorage
  useEffect(() => {
    const loadTheme = async () => {
      setIsLoading(true);
      
      // Try to load from server first
      const serverTheme = await fetchThemeFromServer();
      
      if (serverTheme) {
        // Server data available - use it
        const config: ThemeConfig = {
          activeThemeId: serverTheme.activeThemeId || 'default-amber',
          customThemes: (serverTheme.customThemes as Theme[]) || [],
        };
        setThemeConfig(config);
        
        // Also update localStorage as cache
        setStorageItem(STORAGE_KEYS.THEME, config);
      } else {
        // Fallback to localStorage (for Lovable preview)
        const saved = getStorageItem<ThemeConfig>(STORAGE_KEYS.THEME, initialThemeConfig);
        setThemeConfig(saved);
      }
      
      setIsLoading(false);
    };
    
    loadTheme();
  }, []);

  // Apply theme whenever config changes
  useEffect(() => {
    const activeTheme = getActiveTheme(themeConfig);
    applyThemeToDocument(activeTheme);
  }, [themeConfig]);

  const allThemes = [...presetThemes, ...themeConfig.customThemes];
  const activeTheme = getActiveTheme(themeConfig);

  const setActiveTheme = (themeId: string) => {
    const updated = { ...themeConfig, activeThemeId: themeId };
    setThemeConfig(updated);
    persistTheme(updated);
  };

  const addCustomTheme = (theme: Omit<Theme, 'id' | 'isPreset' | 'createdAt'>) => {
    const newTheme: Theme = {
      ...theme,
      id: `custom_${Date.now()}`,
      isPreset: false,
      createdAt: Date.now(),
    };
    const updated = {
      ...themeConfig,
      customThemes: [...themeConfig.customThemes, newTheme],
    };
    setThemeConfig(updated);
    persistTheme(updated);
  };

  const updateCustomTheme = (id: string, updates: Partial<Theme>) => {
    const updated = {
      ...themeConfig,
      customThemes: themeConfig.customThemes.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    };
    setThemeConfig(updated);
    persistTheme(updated);
  };

  const deleteCustomTheme = (id: string) => {
    // Switch to default if deleting active theme
    let newActiveId = themeConfig.activeThemeId;
    if (themeConfig.activeThemeId === id) {
      newActiveId = presetThemes[0].id;
    }
    
    const updated = {
      activeThemeId: newActiveId,
      customThemes: themeConfig.customThemes.filter(t => t.id !== id),
    };
    setThemeConfig(updated);
    persistTheme(updated);
  };

  const duplicateTheme = (themeId: string) => {
    const theme = allThemes.find(t => t.id === themeId);
    if (!theme) return;
    
    addCustomTheme({
      name: `${theme.name} (Kopie)`,
      description: theme.description,
      colors: { ...theme.colors },
    });
  };

  const importThemes = (themes: { activeThemeId: string; customThemes: Theme[] }, mode: 'replace' | 'merge') => {
    let updated: ThemeConfig;
    if (mode === 'replace') {
      updated = {
        activeThemeId: themes.activeThemeId,
        customThemes: themes.customThemes.map((t, i) => ({
          ...t,
          id: t.id || `custom_${Date.now()}_${i}`,
          isPreset: false,
          createdAt: t.createdAt || Date.now(),
        })),
      };
    } else {
      // Merge: add new themes, keep existing
      const existingIds = themeConfig.customThemes.map(t => t.id);
      const newThemes = themes.customThemes.filter(t => !existingIds.includes(t.id));
      updated = {
        activeThemeId: themeConfig.activeThemeId,
        customThemes: [
          ...themeConfig.customThemes,
          ...newThemes.map((t, i) => ({
            ...t,
            id: t.id || `custom_${Date.now()}_${i}`,
            isPreset: false,
            createdAt: t.createdAt || Date.now(),
          })),
        ],
      };
    }
    setThemeConfig(updated);
    persistTheme(updated);
  };

  return (
    <ThemeContext.Provider value={{
      themeConfig,
      activeTheme,
      allThemes,
      isLoading,
      setActiveTheme,
      addCustomTheme,
      updateCustomTheme,
      deleteCustomTheme,
      duplicateTheme,
      importThemes,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
