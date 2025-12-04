/**
 * ============================================================================
 * AI NOTES: CATEGORY COLOR SYSTEM
 * ============================================================================
 * 
 * This utility automatically assigns colors to categories based on their index.
 * Colors are defined in index.css as --category-0 through --category-15.
 * 
 * When adding new categories:
 * - Colors are automatically assigned based on category order/index
 * - No manual color assignment needed
 * - Supports up to 16 unique colors before cycling
 * 
 * To add more colors:
 * 1. Add new --category-N variables to index.css
 * 2. Update CATEGORY_COLOR_COUNT constant below
 * ============================================================================
 */

// Number of category colors available in index.css
export const CATEGORY_COLOR_COUNT = 16;

/**
 * Get category color classes based on index
 * Colors cycle if there are more categories than colors
 */
export function getCategoryColorClasses(categoryIndex: number) {
  const colorIndex = categoryIndex % CATEGORY_COLOR_COUNT;
  
  return {
    bg: `bg-[hsl(var(--category-${colorIndex})/.15)]`,
    border: `border-[hsl(var(--category-${colorIndex})/.5)]`,
    text: `text-[hsl(var(--category-${colorIndex}))]`,
    glow: `hover:shadow-[0_0_30px_hsl(var(--category-${colorIndex})/.3)]`,
    solid: `bg-[hsl(var(--category-${colorIndex}))]`,
  };
}

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
 * Combined helper: Get color classes for a category by ID
 */
export function getCategoryColors(
  categoryId: string,
  categories: { id: string; order?: number }[]
) {
  const index = getCategoryColorIndex(categoryId, categories);
  return getCategoryColorClasses(index);
}
