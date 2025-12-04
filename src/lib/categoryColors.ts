/**
 * ============================================================================
 * AI NOTES: CATEGORY COLOR SYSTEM
 * ============================================================================
 * 
 * This utility assigns colors to categories based on their index.
 * Uses STATIC Tailwind classes (dynamic classes don't work with Tailwind purging).
 * 
 * When adding new categories:
 * - Colors are automatically assigned based on category order/index
 * - No manual color assignment needed
 * - Supports 16 unique colors before cycling
 * 
 * To add more colors:
 * 1. Add new color definitions to CATEGORY_COLORS array
 * 2. Add corresponding CSS variables to index.css if needed
 * ============================================================================
 */

export interface CategoryColorSet {
  bg: string;
  border: string;
  text: string;
  glow: string;
  solid: string;
  hoverText: string;
}

/**
 * Static color definitions for each category index
 * These MUST be static strings for Tailwind to properly include them
 */
export const CATEGORY_COLORS: CategoryColorSet[] = [
  // 0 - Purple (Video)
  {
    bg: "bg-purple-500/15",
    border: "border-purple-500/50",
    text: "text-purple-400",
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    solid: "bg-purple-500",
    hoverText: "group-hover:text-purple-400",
  },
  // 1 - Blue (AI)
  {
    bg: "bg-blue-500/15",
    border: "border-blue-500/50",
    text: "text-blue-400",
    glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    solid: "bg-blue-500",
    hoverText: "group-hover:text-blue-400",
  },
  // 2 - Orange (Support)
  {
    bg: "bg-orange-500/15",
    border: "border-orange-500/50",
    text: "text-orange-400",
    glow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]",
    solid: "bg-orange-500",
    hoverText: "group-hover:text-orange-400",
  },
  // 3 - Green (Tools)
  {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/50",
    text: "text-emerald-400",
    glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    solid: "bg-emerald-500",
    hoverText: "group-hover:text-emerald-400",
  },
  // 4 - Pink (Design)
  {
    bg: "bg-pink-500/15",
    border: "border-pink-500/50",
    text: "text-pink-400",
    glow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]",
    solid: "bg-pink-500",
    hoverText: "group-hover:text-pink-400",
  },
  // 5 - Yellow (Text)
  {
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
    glow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]",
    solid: "bg-yellow-500",
    hoverText: "group-hover:text-yellow-400",
  },
  // 6 - Cyan (Management)
  {
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/50",
    text: "text-cyan-400",
    glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]",
    solid: "bg-cyan-500",
    hoverText: "group-hover:text-cyan-400",
  },
  // 7 - Red
  {
    bg: "bg-red-500/15",
    border: "border-red-500/50",
    text: "text-red-400",
    glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]",
    solid: "bg-red-500",
    hoverText: "group-hover:text-red-400",
  },
  // 8 - Violet
  {
    bg: "bg-violet-500/15",
    border: "border-violet-500/50",
    text: "text-violet-400",
    glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    solid: "bg-violet-500",
    hoverText: "group-hover:text-violet-400",
  },
  // 9 - Teal
  {
    bg: "bg-teal-500/15",
    border: "border-teal-500/50",
    text: "text-teal-400",
    glow: "hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]",
    solid: "bg-teal-500",
    hoverText: "group-hover:text-teal-400",
  },
  // 10 - Amber
  {
    bg: "bg-amber-500/15",
    border: "border-amber-500/50",
    text: "text-amber-400",
    glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    solid: "bg-amber-500",
    hoverText: "group-hover:text-amber-400",
  },
  // 11 - Sky
  {
    bg: "bg-sky-500/15",
    border: "border-sky-500/50",
    text: "text-sky-400",
    glow: "hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]",
    solid: "bg-sky-500",
    hoverText: "group-hover:text-sky-400",
  },
  // 12 - Rose
  {
    bg: "bg-rose-500/15",
    border: "border-rose-500/50",
    text: "text-rose-400",
    glow: "hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]",
    solid: "bg-rose-500",
    hoverText: "group-hover:text-rose-400",
  },
  // 13 - Lime
  {
    bg: "bg-lime-500/15",
    border: "border-lime-500/50",
    text: "text-lime-400",
    glow: "hover:shadow-[0_0_30px_rgba(132,204,22,0.3)]",
    solid: "bg-lime-500",
    hoverText: "group-hover:text-lime-400",
  },
  // 14 - Indigo
  {
    bg: "bg-indigo-500/15",
    border: "border-indigo-500/50",
    text: "text-indigo-400",
    glow: "hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]",
    solid: "bg-indigo-500",
    hoverText: "group-hover:text-indigo-400",
  },
  // 15 - Fuchsia
  {
    bg: "bg-fuchsia-500/15",
    border: "border-fuchsia-500/50",
    text: "text-fuchsia-400",
    glow: "hover:shadow-[0_0_30px_rgba(217,70,239,0.3)]",
    solid: "bg-fuchsia-500",
    hoverText: "group-hover:text-fuchsia-400",
  },
];

/**
 * Get category color index from category ID and categories array
 */
export function getCategoryColorIndex(
  categoryId: string,
  categories: { id: string; order?: number }[]
): number {
  // Sort by order if available, otherwise by array position
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0;
  });
  
  const index = sortedCategories.findIndex(c => c.id === categoryId);
  return index >= 0 ? index : 0;
}

/**
 * Get category color classes based on index
 * Colors cycle if there are more categories than colors
 */
export function getCategoryColorClasses(categoryIndex: number): CategoryColorSet {
  const colorIndex = categoryIndex % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[colorIndex];
}

/**
 * Combined helper: Get color classes for a category by ID
 */
export function getCategoryColors(
  categoryId: string,
  categories: { id: string; order?: number }[]
): CategoryColorSet {
  const index = getCategoryColorIndex(categoryId, categories);
  return getCategoryColorClasses(index);
}
