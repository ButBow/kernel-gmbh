import { useEffect } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { defaultCookieSettings } from '@/types/cookieSettings';

/**
 * Syncs cookie settings from ContentContext to AnalyticsContext
 * This ensures that when settings are changed in admin, they are reflected in tracking
 */
export function CookieSettingsSync() {
  const { settings, isLoading } = useContent();
  const { updateCookieSettings } = useAnalytics();

  useEffect(() => {
    // Only sync when content is loaded
    if (isLoading) return;
    
    const cookieSettings = settings.cookieSettings || defaultCookieSettings;
    updateCookieSettings(cookieSettings);
  }, [settings.cookieSettings, updateCookieSettings, isLoading]);

  return null;
}
