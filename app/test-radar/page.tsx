'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/header';

export default function RadarTestPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadRadarData = async () => {
    setIsDownloading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/download-latest-radar?download=true&filename=latest-radar.grib2.gz');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'latest-radar.grib2.gz';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const getMetadata = async () => {
    setError(null);
    
    try {
      const response = await fetch('/api/download-latest-radar', { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const metadata = {
        contentLength: response.headers.get('Content-Length'),
        lastModified: response.headers.get('Last-Modified'),
        originalUrl: response.headers.get('X-Original-URL'),
        fileSize: response.headers.get('X-File-Size'),
      };
      
      setMetadata(metadata);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get metadata');
    }
  };

  const previewFile = async () => {
    setError(null);
    
    try {
      // Open in new tab for preview (though browser might just download it)
      window.open('/api/download-latest-radar', '_blank');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-indigo-950/20 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="container mx-auto p-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            API Testing Interface
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              NOAA MRMS API
            </span>
            <br />
            <span className="text-slate-800 dark:text-slate-200">
              Testing Suite
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Test and explore the NOAA MRMS radar data API endpoints. Download files, inspect metadata, 
            and understand the data structure before integrating into your applications.
          </p>
        </div>

        <div className="grid gap-8">
          {/* API Actions Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                API Operations
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Test different API endpoints and operations
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <button
                  onClick={downloadRadarData}
                  disabled={isDownloading}
                  className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 text-white px-6 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                >
                  <div className="flex flex-col items-center">
                    {isDownloading ? (
                      <svg className="animate-spin h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                    <span className="font-semibold">
                      {isDownloading ? 'Downloading...' : 'Download Data'}
                    </span>
                    <span className="text-xs opacity-90 mt-1">
                      Latest GRIB2 file
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={getMetadata}
                  className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-semibold">Get Metadata</span>
                    <span className="text-xs opacity-90 mt-1">
                      File information
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={previewFile}
                  className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-semibold">Preview File</span>
                    <span className="text-xs opacity-90 mt-1">
                      Stream/View
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-red-800 dark:text-red-300 font-semibold text-lg mb-2">
                    API Error
                  </h3>
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata Display */}
          {metadata && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  File Metadata
                </h2>
                <p className="text-green-100 text-sm mt-1">
                  Current radar data file information
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-1">File Size</span>
                      <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {metadata.fileSize 
                          ? `${(parseInt(metadata.fileSize) / 1024 / 1024).toFixed(2)} MB`
                          : 'Unknown'
                        }
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-1">Last Modified</span>
                      <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {metadata.lastModified 
                          ? new Date(metadata.lastModified).toLocaleString()
                          : 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-2">Original URL</span>
                    <code className="text-sm text-blue-600 dark:text-blue-400 break-all bg-white dark:bg-slate-800 p-2 rounded border">
                      {metadata.originalUrl || 'Unknown'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documentation Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                API Documentation
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Endpoint:</span>
                  <code className="block mt-1 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 p-2 rounded">
                    GET /api/download-latest-radar
                  </code>
                </div>
                
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">Parameters:</span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• <code className="text-xs bg-slate-200 dark:bg-slate-600 px-1 rounded">download=true</code> - Force file download</li>
                    <li>• <code className="text-xs bg-slate-200 dark:bg-slate-600 px-1 rounded">filename=custom.grib2.gz</code> - Custom filename</li>
                  </ul>
                </div>
                
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Response Format:</span>
                  <span className="text-slate-600 dark:text-slate-400">GRIB2 compressed binary data</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Usage Examples
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm block mb-2">
                    JavaScript Fetch:
                  </span>
                  <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`const response = await fetch('/api/download-latest-radar');
const arrayBuffer = await response.arrayBuffer();
// Process with GRIB2 library`}
                  </pre>
                </div>
                
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm block mb-2">
                    cURL Command:
                  </span>
                  <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`curl -o radar.grib2.gz \\
  "http://localhost:3000/api/download-latest-radar?download=true"`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Dashboard */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}