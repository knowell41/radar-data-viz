import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "NOAA MRMS API Testing Suite - Radar Data API",
  description: "Comprehensive testing interface for NOAA MRMS radar data API. Test endpoints, download GRIB2 files, inspect metadata, and integrate weather radar data into your applications with our RESTful API.",
  keywords: [
    "NOAA MRMS API",
    "radar data API",
    "GRIB2 download",
    "weather API testing",
    "meteorological API",
    "radar data integration",
    "weather data API",
    "API documentation",
    "weather data access",
    "radar API endpoints"
  ],
  openGraph: {
    title: "NOAA MRMS API Testing Suite - Radar Data API",
    description: "Comprehensive testing interface for NOAA MRMS radar data API. Test endpoints, download GRIB2 files, and integrate weather data into your applications.",
    type: "website",
    images: [
      {
        url: "/og-api-test.png",
        width: 1200,
        height: 630,
        alt: "NOAA MRMS API Testing Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOAA MRMS API Testing Suite - Radar Data API",
    description: "Test NOAA MRMS radar data API endpoints, download GRIB2 files, and integrate weather data into your applications.",
    images: ["/twitter-api-test.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TestRadarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}