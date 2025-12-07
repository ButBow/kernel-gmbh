// Theme system with HSL colors for consistency

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  isPreset: boolean;
  createdAt?: number;
}

// All colors in HSL format (h s% l%)
export const defaultThemeColors: ThemeColors = {
  background: "222 47% 6%",
  foreground: "210 40% 98%",
  card: "222 47% 8%",
  cardForeground: "210 40% 98%",
  popover: "222 47% 8%",
  popoverForeground: "210 40% 98%",
  primary: "38 92% 50%",
  primaryForeground: "222 47% 6%",
  secondary: "217 33% 17%",
  secondaryForeground: "210 40% 98%",
  muted: "217 33% 17%",
  mutedForeground: "215 20% 65%",
  accent: "217 33% 17%",
  accentForeground: "210 40% 98%",
  destructive: "0 84% 60%",
  destructiveForeground: "210 40% 98%",
  border: "217 33% 17%",
  input: "217 33% 17%",
  ring: "38 92% 50%",
};

export const presetThemes: Theme[] = [
  {
    id: "default-amber",
    name: "Amber Gold (Standard)",
    description: "Dunkles Theme mit warmen Goldakzenten",
    isPreset: true,
    colors: defaultThemeColors,
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Tiefes Blau mit Türkis-Akzenten",
    isPreset: true,
    colors: {
      background: "222 47% 6%",
      foreground: "210 40% 98%",
      card: "222 47% 8%",
      cardForeground: "210 40% 98%",
      popover: "222 47% 8%",
      popoverForeground: "210 40% 98%",
      primary: "190 90% 50%",
      primaryForeground: "222 47% 6%",
      secondary: "217 33% 17%",
      secondaryForeground: "210 40% 98%",
      muted: "217 33% 17%",
      mutedForeground: "215 20% 65%",
      accent: "217 33% 17%",
      accentForeground: "210 40% 98%",
      destructive: "0 84% 60%",
      destructiveForeground: "210 40% 98%",
      border: "217 33% 17%",
      input: "217 33% 17%",
      ring: "190 90% 50%",
    },
  },
  {
    id: "emerald-green",
    name: "Emerald Green",
    description: "Elegantes Grün mit dunklem Hintergrund",
    isPreset: true,
    colors: {
      background: "160 30% 6%",
      foreground: "160 20% 98%",
      card: "160 30% 8%",
      cardForeground: "160 20% 98%",
      popover: "160 30% 8%",
      popoverForeground: "160 20% 98%",
      primary: "155 80% 45%",
      primaryForeground: "160 30% 6%",
      secondary: "160 25% 17%",
      secondaryForeground: "160 20% 98%",
      muted: "160 25% 17%",
      mutedForeground: "160 15% 65%",
      accent: "160 25% 17%",
      accentForeground: "160 20% 98%",
      destructive: "0 84% 60%",
      destructiveForeground: "160 20% 98%",
      border: "160 25% 17%",
      input: "160 25% 17%",
      ring: "155 80% 45%",
    },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description: "Königliches Lila mit modernem Touch",
    isPreset: true,
    colors: {
      background: "270 30% 6%",
      foreground: "270 20% 98%",
      card: "270 30% 8%",
      cardForeground: "270 20% 98%",
      popover: "270 30% 8%",
      popoverForeground: "270 20% 98%",
      primary: "280 85% 60%",
      primaryForeground: "270 30% 6%",
      secondary: "270 25% 17%",
      secondaryForeground: "270 20% 98%",
      muted: "270 25% 17%",
      mutedForeground: "270 15% 65%",
      accent: "270 25% 17%",
      accentForeground: "270 20% 98%",
      destructive: "0 84% 60%",
      destructiveForeground: "270 20% 98%",
      border: "270 25% 17%",
      input: "270 25% 17%",
      ring: "280 85% 60%",
    },
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    description: "Warmes Orange mit lebhaften Akzenten",
    isPreset: true,
    colors: {
      background: "15 30% 6%",
      foreground: "15 20% 98%",
      card: "15 30% 8%",
      cardForeground: "15 20% 98%",
      popover: "15 30% 8%",
      popoverForeground: "15 20% 98%",
      primary: "25 95% 55%",
      primaryForeground: "15 30% 6%",
      secondary: "15 25% 17%",
      secondaryForeground: "15 20% 98%",
      muted: "15 25% 17%",
      mutedForeground: "15 15% 65%",
      accent: "15 25% 17%",
      accentForeground: "15 20% 98%",
      destructive: "0 84% 60%",
      destructiveForeground: "15 20% 98%",
      border: "15 25% 17%",
      input: "15 25% 17%",
      ring: "25 95% 55%",
    },
  },
  {
    id: "rose-pink",
    name: "Rose Pink",
    description: "Sanftes Rosa mit femininem Flair",
    isPreset: true,
    colors: {
      background: "340 30% 6%",
      foreground: "340 20% 98%",
      card: "340 30% 8%",
      cardForeground: "340 20% 98%",
      popover: "340 30% 8%",
      popoverForeground: "340 20% 98%",
      primary: "350 85% 60%",
      primaryForeground: "340 30% 98%",
      secondary: "340 25% 17%",
      secondaryForeground: "340 20% 98%",
      muted: "340 25% 17%",
      mutedForeground: "340 15% 65%",
      accent: "340 25% 17%",
      accentForeground: "340 20% 98%",
      destructive: "0 84% 60%",
      destructiveForeground: "340 20% 98%",
      border: "340 25% 17%",
      input: "340 25% 17%",
      ring: "350 85% 60%",
    },
  },
  {
    id: "minimal-gray",
    name: "Minimal Gray",
    description: "Schlichtes, neutrales Design",
    isPreset: true,
    colors: {
      background: "0 0% 7%",
      foreground: "0 0% 98%",
      card: "0 0% 10%",
      cardForeground: "0 0% 98%",
      popover: "0 0% 10%",
      popoverForeground: "0 0% 98%",
      primary: "0 0% 90%",
      primaryForeground: "0 0% 7%",
      secondary: "0 0% 17%",
      secondaryForeground: "0 0% 98%",
      muted: "0 0% 17%",
      mutedForeground: "0 0% 65%",
      accent: "0 0% 17%",
      accentForeground: "0 0% 98%",
      destructive: "0 84% 60%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 17%",
      input: "0 0% 17%",
      ring: "0 0% 90%",
    },
  },
  {
    id: "magenta-blue",
    name: "Magenta Blue",
    description: "Vibrant Magenta mit Electric Blue Akzenten",
    isPreset: true,
    colors: {
      background: "250 30% 6%",
      foreground: "270 20% 98%",
      card: "250 30% 9%",
      cardForeground: "270 20% 98%",
      popover: "250 30% 9%",
      popoverForeground: "270 20% 98%",
      primary: "300 100% 50%",
      primaryForeground: "250 30% 6%",
      secondary: "240 80% 25%",
      secondaryForeground: "270 20% 98%",
      muted: "250 25% 15%",
      mutedForeground: "270 15% 65%",
      accent: "270 60% 30%",
      accentForeground: "270 20% 98%",
      destructive: "0 84% 60%",
      destructiveForeground: "270 20% 98%",
      border: "250 25% 18%",
      input: "250 25% 15%",
      ring: "300 100% 50%",
    },
  },
  {
    id: "kernelflow-v1",
    name: "KernelFlow V1",
    description: "Professionelles Blau-Lila Theme mit hellem Hintergrund",
    isPreset: true,
    colors: {
      // Background: #A3CEE9 -> HSL: 201 58% 78%
      background: "201 58% 78%",
      // Text: #000000 -> HSL: 0 0% 0%
      foreground: "0 0% 0%",
      // Cards slightly darker than background
      card: "201 58% 72%",
      cardForeground: "0 0% 0%",
      popover: "201 58% 75%",
      popoverForeground: "0 0% 0%",
      // Primary: #0000FF -> HSL: 240 100% 50%
      primary: "240 100% 50%",
      primaryForeground: "0 0% 100%",
      // Secondary: #8000FF -> HSL: 270 100% 50%
      secondary: "270 100% 50%",
      secondaryForeground: "0 0% 100%",
      // Grey: #526775 -> HSL: 203 18% 37%
      muted: "203 18% 65%",
      mutedForeground: "203 18% 25%",
      accent: "270 100% 50%",
      accentForeground: "0 0% 100%",
      destructive: "0 84% 60%",
      destructiveForeground: "0 0% 100%",
      // Border using grey tone
      border: "203 18% 55%",
      input: "203 18% 60%",
      ring: "240 100% 50%",
    },
  },
  {
    id: "kernelflow-v1-dark",
    name: "KernelFlow V1 Dark",
    description: "Dunkles Blau-Lila Theme mit tiefem Hintergrund",
    isPreset: true,
    colors: {
      // Dark Background: #0A0A12
      background: "240 25% 5%",
      foreground: "201 58% 85%",
      // Cards slightly lighter than background
      card: "240 25% 8%",
      cardForeground: "201 58% 90%",
      popover: "240 25% 7%",
      popoverForeground: "201 58% 90%",
      // Primary: #0000FF -> HSL: 240 100% 50%
      primary: "240 100% 55%",
      primaryForeground: "0 0% 100%",
      // Secondary: #8000FF -> HSL: 270 100% 50%
      secondary: "270 100% 55%",
      secondaryForeground: "0 0% 100%",
      // Muted tones
      muted: "240 20% 15%",
      mutedForeground: "203 18% 60%",
      accent: "270 100% 55%",
      accentForeground: "0 0% 100%",
      destructive: "0 84% 55%",
      destructiveForeground: "0 0% 100%",
      // Border using grey tone
      border: "240 20% 18%",
      input: "240 20% 15%",
      ring: "240 100% 55%",
    },
  },
];

export interface ThemeConfig {
  activeThemeId: string;
  customThemes: Theme[];
}

export const initialThemeConfig: ThemeConfig = {
  activeThemeId: "default-amber",
  customThemes: [],
};

// Helper to get active theme
export function getActiveTheme(config: ThemeConfig): Theme {
  const allThemes = [...presetThemes, ...config.customThemes];
  return allThemes.find(t => t.id === config.activeThemeId) || presetThemes[0];
}

// Helper to apply theme to CSS variables
export function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement;
  const colors = theme.colors;

  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.foreground);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--card-foreground', colors.cardForeground);
  root.style.setProperty('--popover', colors.popover);
  root.style.setProperty('--popover-foreground', colors.popoverForeground);
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--muted', colors.muted);
  root.style.setProperty('--muted-foreground', colors.mutedForeground);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-foreground', colors.accentForeground);
  root.style.setProperty('--destructive', colors.destructive);
  root.style.setProperty('--destructive-foreground', colors.destructiveForeground);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--input', colors.input);
  root.style.setProperty('--ring', colors.ring);
  
  // Also update sidebar colors
  root.style.setProperty('--sidebar-background', colors.background);
  root.style.setProperty('--sidebar-foreground', colors.foreground);
  root.style.setProperty('--sidebar-primary', colors.primary);
  root.style.setProperty('--sidebar-primary-foreground', colors.primaryForeground);
  root.style.setProperty('--sidebar-accent', colors.secondary);
  root.style.setProperty('--sidebar-accent-foreground', colors.secondaryForeground);
  root.style.setProperty('--sidebar-border', colors.border);
  root.style.setProperty('--sidebar-ring', colors.ring);
}
