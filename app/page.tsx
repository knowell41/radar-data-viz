import RadarVisualization from './components/RadarVisualization';
import { Header } from './components/header';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Weather Radar Dashboard - Real-time NOAA MRMS Data",
  description: "Interactive weather radar dashboard featuring real-time NOAA MRMS precipitation data, storm tracking, and advanced meteorological visualization. Access live radar imagery with 1km resolution updated every 2-5 minutes.",
  keywords: [
    "weather radar dashboard",
    "real-time precipitation",
    "NOAA MRMS data",
    "storm tracking",
    "live weather radar",
    "precipitation visualization",
    "weather monitoring",
    "radar imagery",
    "meteorological dashboard"
  ],
  openGraph: {
    title: "Weather Radar Dashboard - Real-time NOAA MRMS Data",
    description: "Interactive weather radar dashboard featuring real-time NOAA MRMS precipitation data, storm tracking, and advanced meteorological visualization.",
    type: "website",
    images: [
      {
        url: "/og-dashboard.png",
        width: 1200,
        height: 630,
        alt: "RadarViz Pro Dashboard - Real-time Weather Radar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weather Radar Dashboard - Real-time NOAA MRMS Data",
    description: "Interactive weather radar dashboard featuring real-time NOAA MRMS precipitation data and storm tracking.",
    images: ["/twitter-dashboard.png"],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-indigo-950/20 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">{/* Hero Section */}
        <div className="text-center mb-12 animate-in">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Real-time Weather Intelligence
          </div>
          
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Advanced Radar
            </span>
            <br />
            <span className="text-foreground">
              Visualization
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience next-generation weather radar visualization powered by NOAA MRMS technology. 
            Real-time precipitation tracking, storm analysis, and meteorological intelligence at your fingertips.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <div className="bg-card rounded-lg p-4 shadow-lg border border-border">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2-5min</div>
              <div className="text-sm text-muted-foreground">Update Frequency</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-lg border border-border">{/* Update Frequency */}
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2-5min</div>
              <div className="text-sm text-muted-foreground">Update Frequency</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-lg border border-border">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">1km</div>
              <div className="text-sm text-muted-foreground">Resolution</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-lg border border-border">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">CONUS</div>
              <div className="text-sm text-muted-foreground">Coverage</div>
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="mb-12">
          <RadarVisualization className="w-full" />
        </div>
          
        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="group bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Real-time Processing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Lightning-fast GRIB2 data processing with advanced algorithms for immediate weather pattern analysis and visualization.
            </p>
          </div>

          <div className="group bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Interactive Mapping</h3>
            <p className="text-muted-foreground leading-relaxed">
              Explore weather patterns with our responsive map interface featuring zoom, pan, and layer controls for detailed analysis.
            </p>
          </div>

          <div className="group bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">NOAA Integration</h3>
            <p className="text-muted-foreground leading-relaxed">
              Direct integration with NOAA MRMS systems providing authoritative, high-resolution meteorological data streams.
            </p>
          </div>
        </div>

        {/* API Section */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-2/3 mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold text-card-foreground mb-4">
                Developer API Access
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Integrate weather radar data into your applications with our comprehensive RESTful API. 
                Access real-time GRIB2 files, metadata, and processed datasets programmatically.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                  REST API
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  Real-time Data
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
                  GRIB2 Format
                </span>
              </div>
            </div>
            <div className="lg:w-1/3 lg:pl-8">
              <Link
                href="/test-radar"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Try API Demo
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-purple-600"></div>
              <span className="font-semibold text-card-foreground">RadarViz Pro</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Data courtesy of NOAA</span>
              <span>•</span>
              <span>Educational use only</span>
              <span>•</span>
              <span>© 2025</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
