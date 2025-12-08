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
  // AEO specific props
  speakableSelectors?: string[];
  keywords?: string[];
  dateModified?: string;
}

export function SEOHead({
  title,
  description,
  canonicalPath = '',
  type = 'website',
  image,
  article,
  product,
  speakableSelectors = ['h1', '.hero-description', 'article'],
  keywords = [],
  dateModified
}: SEOHeadProps) {
  const { settings, categories, products, posts } = useContent();
  
  const siteName = settings.companyName || 'Mein Firmenname';
  const siteUrl = settings.apiBaseUrl?.replace('/api', '') || 'https://meinfirmenname.ch';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription = description || settings.heroSubtitle || '';
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const ogImage = image || `${siteUrl}/og-image.jpg`;
  
  // Generate keywords from categories and products
  const autoKeywords = [
    ...categories.map(c => c.name),
    ...products.filter(p => p.status === 'published').slice(0, 5).map(p => p.name),
    'KI', 'Automatisierung', 'Content', 'Schweiz'
  ];
  const finalKeywords = [...new Set([...keywords, ...autoKeywords])].slice(0, 15);

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
    updateMeta('author', settings.ownerName || siteName);
    updateMeta('keywords', finalKeywords.join(', '));
    
    // Additional SEO Meta Tags
    updateMeta('publisher', siteName);
    updateMeta('copyright', `© ${new Date().getFullYear()} ${siteName}`);
    updateMeta('revisit-after', '7 days');
    updateMeta('distribution', 'global');
    updateMeta('rating', 'general');
    
    // AEO Meta Tags for AI crawlers
    updateMeta('ai-content-declaration', 'human-authored');
    updateMeta('content-type', type === 'article' ? 'blog-post' : 'professional-services');
    
    // Date meta tags for freshness signals
    if (dateModified || article?.modifiedTime) {
      updateMeta('article:modified_time', dateModified || article?.modifiedTime || '', true);
    }
    updateMeta('last-modified', new Date().toISOString().split('T')[0]);

    // Open Graph
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', fullDescription, true);
    updateMeta('og:type', type === 'article' ? 'article' : type === 'product' ? 'product' : 'website', true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:image:width', '1200', true);
    updateMeta('og:image:height', '630', true);
    updateMeta('og:image:alt', fullTitle, true);
    updateMeta('og:site_name', siteName, true);
    updateMeta('og:locale', 'de_CH', true);
    updateMeta('og:locale:alternate', 'de_DE', true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', fullDescription);
    updateMeta('twitter:image', ogImage);
    updateMeta('twitter:image:alt', fullTitle);
    updateMeta('twitter:site', settings.socialTwitter ? `@${settings.socialTwitter.split('/').pop()}` : '');
    updateMeta('twitter:creator', settings.socialTwitter ? `@${settings.socialTwitter.split('/').pop()}` : '');

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

    // Organization Schema with enhanced details
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512
      },
      description: fullDescription,
      foundingDate: '2024',
      areaServed: {
        '@type': 'Country',
        name: 'Schweiz'
      },
      knowsLanguage: ['de', 'en'],
      contactPoint: settings.contactEmail ? {
        '@type': 'ContactPoint',
        email: settings.contactEmail,
        telephone: settings.contactPhone,
        contactType: 'customer service',
        areaServed: 'CH',
        availableLanguage: ['German', 'English']
      } : undefined,
      sameAs: [
        settings.socialLinkedin,
        settings.socialInstagram,
        settings.socialTwitter,
        settings.socialYoutube,
        settings.socialFacebook
      ].filter(Boolean)
    });

    // WebSite Schema with enhanced SearchAction for AI
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      description: fullDescription,
      inLanguage: 'de-CH',
      publisher: {
        '@id': `${siteUrl}/#organization`
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/leistungen?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    });

    // WebPage Schema with Speakable for Voice Search / AEO
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonicalUrl}/#webpage`,
      url: canonicalUrl,
      name: fullTitle,
      description: fullDescription,
      isPartOf: {
        '@id': `${siteUrl}/#website`
      },
      about: {
        '@id': `${siteUrl}/#organization`
      },
      inLanguage: 'de-CH',
      dateModified: dateModified || new Date().toISOString(),
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: speakableSelectors
      },
      mainContentOfPage: {
        '@type': 'WebPageElement',
        cssSelector: 'main'
      }
    });

    // Person Schema (for About page)
    if (type === 'profile' || canonicalPath === '/ueber-mich') {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: settings.ownerName || siteName,
        jobTitle: settings.aboutTagline,
        description: settings.aboutText,
        url: `${siteUrl}/ueber-mich`,
        image: `${siteUrl}/profile.jpg`,
        worksFor: {
          '@id': `${siteUrl}/#organization`
        },
        knowsAbout: settings.skills || finalKeywords,
        sameAs: [
          settings.socialLinkedin,
          settings.socialInstagram,
          settings.socialTwitter
        ].filter(Boolean)
      });
    }

    // Service/Product Schema with enhanced details
    if (products && products.length > 0 && (canonicalPath === '/leistungen' || type === 'product')) {
      const serviceList = products
        .filter(p => p.status === 'published')
        .slice(0, 10)
        .map(p => ({
          '@type': 'Service',
          '@id': `${siteUrl}/leistungen#${p.id}`,
          name: p.name,
          description: p.shortDescription || p.description,
          provider: {
            '@id': `${siteUrl}/#organization`
          },
          areaServed: {
            '@type': 'Country',
            name: 'Schweiz'
          },
          offers: {
            '@type': 'Offer',
            price: p.priceText.replace(/[^\d.,]/g, '').replace(',', '.') || '0',
            priceCurrency: 'CHF',
            availability: 'https://schema.org/InStock',
            validFrom: new Date().toISOString().split('T')[0]
          }
        }));

      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${siteUrl}/leistungen#services`,
        name: 'Leistungen',
        description: 'Professionelle Dienstleistungen für KI, Automatisierung und Content-Produktion',
        numberOfItems: serviceList.length,
        itemListElement: serviceList.map((service, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: service
        }))
      });

      // ProfessionalService Schema for local SEO
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': `${siteUrl}/#professionalservice`,
        name: siteName,
        url: siteUrl,
        description: fullDescription,
        priceRange: '€€',
        areaServed: {
          '@type': 'Country',
          name: 'Schweiz'
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Leistungen',
          itemListElement: serviceList.slice(0, 5)
        }
      });
    }

    // Product Schema for specific product
    if (product) {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${canonicalUrl}/#product`,
        name: product.name,
        description: product.description,
        brand: {
          '@id': `${siteUrl}/#organization`
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'CHF',
          availability: 'https://schema.org/InStock',
          seller: {
            '@id': `${siteUrl}/#organization`
          }
        }
      });
    }

    // Article Schema for Blog posts with enhanced AEO
    if (type === 'article' && article) {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${canonicalUrl}/#article`,
        headline: title,
        description: fullDescription,
        image: {
          '@type': 'ImageObject',
          url: ogImage,
          width: 1200,
          height: 630
        },
        author: {
          '@type': 'Person',
          name: article.author || settings.ownerName || siteName,
          url: `${siteUrl}/ueber-mich`
        },
        publisher: {
          '@id': `${siteUrl}/#organization`
        },
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime || article.publishedTime,
        keywords: article.tags?.join(', '),
        inLanguage: 'de-CH',
        isPartOf: {
          '@id': `${siteUrl}/#website`
        },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', 'article p:first-of-type', '.article-summary']
        },
        mainEntityOfPage: {
          '@id': `${canonicalUrl}/#webpage`
        }
      });

      // Add BlogPosting for better blog indexing
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${canonicalUrl}/#blogposting`,
        headline: title,
        description: fullDescription,
        image: ogImage,
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime || article.publishedTime,
        author: {
          '@type': 'Person',
          name: article.author || settings.ownerName || siteName
        },
        publisher: {
          '@id': `${siteUrl}/#organization`
        },
        articleSection: article.tags?.[0] || 'Allgemein',
        wordCount: 500, // Placeholder
        inLanguage: 'de-CH'
      });
    }

    // BreadcrumbList for navigation
    if (canonicalPath && canonicalPath !== '/') {
      const pathParts = canonicalPath.split('/').filter(Boolean);
      const breadcrumbNames: Record<string, string> = {
        'leistungen': 'Leistungen',
        'portfolio': 'Portfolio',
        'blog': 'Blog',
        'ueber-mich': 'Über mich',
        'kontakt': 'Kontakt',
        'impressum': 'Impressum',
        'datenschutz': 'Datenschutz'
      };
      
      const breadcrumbs = pathParts.map((part, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: breadcrumbNames[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
        item: `${siteUrl}/${pathParts.slice(0, index + 1).join('/')}`
      }));

      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}/#breadcrumb`,
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

    // FAQ Schema (for services page with common questions) - Enhanced for AEO
    if (canonicalPath === '/leistungen' && categories.length > 0) {
      const faqs = categories.slice(0, 5).map(cat => ({
        '@type': 'Question',
        name: `Was ist ${cat.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: cat.description
        }
      }));

      // Add general FAQs for AEO
      faqs.push({
        '@type': 'Question',
        name: 'Welche Dienstleistungen werden angeboten?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${siteName} bietet professionelle Dienstleistungen in den Bereichen ${categories.map(c => c.name).join(', ')} an.`
        }
      });

      faqs.push({
        '@type': 'Question',
        name: 'Für wen sind die Dienstleistungen geeignet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Die Dienstleistungen richten sich an Firmen, Creators und Einzelunternehmer, die ihre Arbeit mit KI und Automatisierung optimieren möchten.'
        }
      });

      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${siteUrl}/leistungen#faq`,
        mainEntity: faqs
      });
    }

    // HowTo Schema for contact page - good for AEO
    if (canonicalPath === '/kontakt') {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        '@id': `${siteUrl}/kontakt#howto`,
        name: 'Wie kann ich Kontakt aufnehmen?',
        description: 'So nehmen Sie Kontakt mit uns auf und starten Ihr Projekt',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Kontaktformular ausfüllen',
            text: 'Füllen Sie das Kontaktformular mit Ihren Projektdetails aus'
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Anfrage senden',
            text: 'Senden Sie Ihre Anfrage ab'
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Rückmeldung erhalten',
            text: 'Wir melden uns innerhalb von 24 Stunden bei Ihnen'
          }
        ]
      });
    }

    // Blog Collection Page
    if (canonicalPath === '/blog' && posts && posts.length > 0) {
      const publishedPosts = posts.filter(p => p.status === 'published').slice(0, 10);
      
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${siteUrl}/blog#blog`,
        name: `${siteName} Blog`,
        description: 'Aktuelle Beiträge zu KI, Automatisierung und Content-Produktion',
        url: `${siteUrl}/blog`,
        inLanguage: 'de-CH',
        publisher: {
          '@id': `${siteUrl}/#organization`
        },
        blogPost: publishedPosts.map(post => ({
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          url: `${siteUrl}/blog/${post.slug}`,
          author: {
            '@type': 'Person',
            name: settings.ownerName || siteName
          }
        }))
      });

      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}/#collectionpage`,
        name: 'Blog',
        description: 'Alle Blogbeiträge',
        url: canonicalUrl,
        isPartOf: {
          '@id': `${siteUrl}/#website`
        },
        about: {
          '@type': 'Thing',
          name: 'KI und Automatisierung'
        }
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
  }, [fullTitle, fullDescription, canonicalUrl, ogImage, type, siteName, siteUrl, settings, products, categories, posts, article, product, canonicalPath, finalKeywords, speakableSelectors, dateModified]);

  return null;
}
