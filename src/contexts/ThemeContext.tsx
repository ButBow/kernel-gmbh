import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';
import { 
  Theme, ThemeConfig, ThemeColors,
  initialThemeConfig, presetThemes, getActiveTheme, applyThemeToDocument 
} from '@/data/themes';

interface ThemeContextType {
  themeConfig: ThemeConfig;
  activeTheme: Theme;
  allThemes: Theme[];
  
  setActiveTheme: (themeId: string) => void;
  addCustomTheme: (theme: Omit<Theme, 'id' | 'isPreset' | 'createdAt'>) => void;
  updateCustomTheme: (id: string, theme: Partial<Theme>) => void;
  deleteCustomTheme: (id: string) => void;
  duplicateTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(initialThemeConfig);

  // Load theme config from localStorage
  useEffect(() => {
    const saved = getStorageItem<ThemeConfig>(STORAGE_KEYS.THEME, initialThemeConfig);
    setThemeConfig(saved);
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
    setStorageItem(STORAGE_KEYS.THEME, updated);
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
    setStorageItem(STORAGE_KEYS.THEME, updated);
  };

  const updateCustomTheme = (id: string, updates: Partial<Theme>) => {
    const updated = {
      ...themeConfig,
      customThemes: themeConfig.customThemes.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    };
    setThemeConfig(updated);
    setStorageItem(STORAGE_KEYS.THEME, updated);
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
    setStorageItem(STORAGE_KEYS.THEME, updated);
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

  return (
    <ThemeContext.Provider value={{
      themeConfig,
      activeTheme,
      allThemes,
      setActiveTheme,
      addCustomTheme,
      updateCustomTheme,
      deleteCustomTheme,
      duplicateTheme,
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
