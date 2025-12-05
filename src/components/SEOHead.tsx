import { useEffect } from 'react';
import { useContent } from '@/contexts/ContentContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  image?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  product?: {
    name: string;
    description: string;
    price: string;
    currency?: string;
  };
}

export function SEOHead({
  title,
  description,
  canonicalPath = '',
  type = 'website',
  image,
  article,
  product
}: SEOHeadProps) {
  const { settings, categories, products } = useContent();
  
  const siteName = settings.companyName || 'Mein Firmenname';
  const siteUrl = settings.apiBaseUrl?.replace('/api', '') || 'https://meinfirmenname.ch';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription = description || settings.heroSubtitle || '';
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const ogImage = image || `${siteUrl}/og-image.jpg`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic SEO
    updateMeta('description', fullDescription);
    updateMeta('author', siteName);

    // Open Graph
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', fullDescription, true);
    updateMeta('og:type', type, true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:site_name', siteName, true);
    updateMeta('og:locale', 'de_CH', true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', fullDescription);
    updateMeta('twitter:image', ogImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // JSON-LD Structured Data for AEO (Answer Engine Optimization)
    const existingScripts = document.querySelectorAll('script[data-seo="structured-data"]');
    existingScripts.forEach(s => s.remove());

    const structuredData: object[] = [];

    // Organization Schema
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description: fullDescription,
      contactPoint: settings.contactEmail ? {
        '@type': 'ContactPoint',
        email: settings.contactEmail,
        telephone: settings.contactPhone,
        contactType: 'customer service'
      } : undefined,
      sameAs: [
        settings.socialLinkedin,
        settings.socialInstagram,
        settings.socialTwitter,
        settings.socialYoutube,
        settings.socialFacebook
      ].filter(Boolean)
    });

    // WebSite Schema with SearchAction for AI
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      description: fullDescription,
      inLanguage: 'de-CH',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/leistungen?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    });

    // Person Schema (for About page)
    if (type === 'profile' || canonicalPath === '/ueber-mich') {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: settings.ownerName || siteName,
        jobTitle: settings.aboutTagline,
        description: settings.aboutText,
        url: `${siteUrl}/ueber-mich`,
        worksFor: {
          '@type': 'Organization',
          name: siteName
        },
        knowsAbout: settings.skills || []
      });
    }

    // Service/Product Schema
    if (products && products.length > 0 && (canonicalPath === '/leistungen' || type === 'product')) {
      const serviceList = products
        .filter(p => p.status === 'published')
        .slice(0, 10)
        .map(p => ({
          '@type': 'Service',
          name: p.name,
          description: p.shortDescription,
          provider: {
            '@type': 'Organization',
            name: siteName
          },
          offers: {
            '@type': 'Offer',
            price: p.priceText.replace(/[^\d.,]/g, '').replace(',', '.') || '0',
            priceCurrency: 'CHF'
          }
        }));

      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Leistungen',
        description: 'Unsere Dienstleistungen',
        itemListElement: serviceList.map((service, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: service
        }))
      });
    }

    // Product Schema for specific product
    if (product) {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'CHF',
          availability: 'https://schema.org/InStock'
        }
      });
    }

    // Article Schema for Blog posts
    if (type === 'article' && article) {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: fullDescription,
        image: ogImage,
        author: {
          '@type': 'Person',
          name: article.author || settings.ownerName || siteName
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/logo.png`
          }
        },
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime || article.publishedTime,
        keywords: article.tags?.join(', ')
      });
    }

    // BreadcrumbList for navigation
    if (canonicalPath && canonicalPath !== '/') {
      const pathParts = canonicalPath.split('/').filter(Boolean);
      const breadcrumbs = pathParts.map((part, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
        item: `${siteUrl}/${pathParts.slice(0, index + 1).join('/')}`
      }));

      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Startseite',
            item: siteUrl
          },
          ...breadcrumbs
        ]
      });
    }

    // FAQ Schema (for services page with common questions)
    if (canonicalPath === '/leistungen' && categories.length > 0) {
      const faqs = categories.slice(0, 5).map(cat => ({
        '@type': 'Question',
        name: `Was ist ${cat.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: cat.description
        }
      }));

      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs
      });
    }

    // Add all structured data
    structuredData.forEach((data) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'structured-data');
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });

    // Cleanup
    return () => {
      const scripts = document.querySelectorAll('script[data-seo="structured-data"]');
      scripts.forEach(s => s.remove());
    };
  }, [fullTitle, fullDescription, canonicalUrl, ogImage, type, siteName, siteUrl, settings, products, categories, article, product, canonicalPath]);

  return null;
}
