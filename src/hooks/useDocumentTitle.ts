import { useEffect } from 'react';
import { useContent } from '@/contexts/ContentContext';

export function useDocumentTitle(pageTitle?: string) {
  const { settings } = useContent();
  
  useEffect(() => {
    const companyName = settings.companyName || 'Mein Firmenname';
    
    if (pageTitle) {
      document.title = `${pageTitle} | ${companyName}`;
    } else {
      document.title = companyName;
    }
  }, [settings.companyName, pageTitle]);
}
