import type { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  twitterImage?: string;
  noIndex?: boolean;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage = '/og-image.png',
    twitterImage = '/twitter-image.png',
    noIndex = false,
  } = config;

  const fullTitle = title.includes('RadarViz Pro') ? title : `${title} | RadarViz Pro`;

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, 'weather radar', 'NOAA MRMS', 'RadarViz Pro'],
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [twitterImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

export const siteConfig = {
  name: 'RadarViz Pro',
  description: 'Professional weather radar visualization platform powered by NOAA MRMS technology.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  twitterHandle: '@radarvizpro',
  keywords: [
    'weather radar',
    'NOAA MRMS',
    'precipitation analysis',
    'storm tracking',
    'meteorological data',
    'weather visualization',
    'real-time weather',
    'radar data API',
    'weather intelligence',
    'precipitation tracking',
  ],
};

// Schema.org structured data generators
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    description: siteConfig.description,
    applicationCategory: 'Weather Application',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'RadarViz Pro Team',
    },
    screenshot: `${siteConfig.url}/og-image.png`,
    featureList: [
      'Real-time NOAA MRMS radar data',
      'Interactive weather visualization',
      'Storm tracking and analysis',
      'API access for developers',
      'High-resolution precipitation maps',
    ],
  };
}

export function generateAPISchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    name: 'RadarViz Pro API',
    description: 'RESTful API for accessing NOAA MRMS radar data and weather information',
    documentation: `${siteConfig.url}/test-radar`,
    provider: {
      '@type': 'Organization',
      name: 'RadarViz Pro',
    },
    termsOfService: `${siteConfig.url}/terms`,
    version: '1.0',
  };
}