import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "./components/theme-provider";
import {
  generateWebsiteSchema,
  generateSoftwareApplicationSchema,
} from "./lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RadarViz Pro - Advanced Weather Radar Visualization",
    template: "%s | RadarViz Pro",
  },
  description:
    "Professional weather radar visualization platform powered by NOAA MRMS technology. Real-time precipitation tracking, storm analysis, and meteorological intelligence with interactive maps and comprehensive API access.",
  keywords: [
    "weather radar",
    "NOAA MRMS",
    "precipitation analysis",
    "storm tracking",
    "meteorological data",
    "weather visualization",
    "real-time weather",
    "radar data API",
    "weather intelligence",
    "precipitation tracking",
    "weather maps",
    "GRIB2 data",
    "weather analytics",
  ],
  authors: [
    {
      name: "RadarViz Pro Team",
      url: "https://github.com/knowell41/radar-data-viz",
    },
  ],
  creator: "RadarViz Pro",
  publisher: "RadarViz Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "RadarViz Pro - Advanced Weather Radar Visualization",
    description:
      "Professional weather radar visualization platform powered by NOAA MRMS technology. Real-time precipitation tracking, storm analysis, and meteorological intelligence.",
    siteName: "RadarViz Pro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RadarViz Pro - Weather Radar Visualization Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RadarViz Pro - Advanced Weather Radar Visualization",
    description:
      "Professional weather radar visualization platform powered by NOAA MRMS technology. Real-time precipitation tracking and storm analysis.",
    images: ["/twitter-image.png"],
    creator: "@radarvizpro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebsiteSchema();
  const appSchema = generateSoftwareApplicationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="RadViz" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(appSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
