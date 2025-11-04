'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { SimpleGribProcessor } from '../utils/gribProcessor';

interface RadarDataPoint {
  lat: number;
  lng: number;
  value: number;
}

interface RadarVisualizationProps {
  className?: string;
}

// Dynamic import of the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
}) as React.ComponentType<{ radarData: RadarDataPoint[] }>;

export default function RadarVisualization({ className }: RadarVisualizationProps) {
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);
  const [filteredRadarData, setFilteredRadarData] = useState<RadarDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter controls
  const [minThreshold, setMinThreshold] = useState(-30);
  const [maxThreshold, setMaxThreshold] = useState(100);
  const [isFilterEnabled, setIsFilterEnabled] = useState(false);

  // Filter radar data based on threshold values
  useEffect(() => {
    if (!isFilterEnabled) {
      setFilteredRadarData(radarData);
      return;
    }

    const filtered = radarData.filter(point => 
      point.value >= minThreshold && point.value <= maxThreshold
    );
    setFilteredRadarData(filtered);
  }, [radarData, minThreshold, maxThreshold, isFilterEnabled]);

  // Calculate data statistics for better slider ranges
  const dataStats = radarData.length > 0 ? {
    min: Math.min(...radarData.map(p => p.value)),
    max: Math.max(...radarData.map(p => p.value)),
    count: radarData.length
  } : { min: -30, max: 100, count: 0 };

  const downloadAndProcessRadarData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Download the latest radar data
      const response = await fetch('/api/download-latest-radar');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Process the GRIB2 data
      await processGribData(arrayBuffer);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download and process radar data');
    } finally {
      setIsLoading(false);
    }
  };

  const processFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      await processGribData(arrayBuffer);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process uploaded file');
    } finally {
      setIsLoading(false);
    }
  };

  const processGribData = async (arrayBuffer: ArrayBuffer) => {
    try {
      // Use our simplified GRIB processor
      const processedData = await SimpleGribProcessor.processGribBuffer(arrayBuffer);
      setRadarData(processedData);
      console.log(`Processed ${processedData.length} radar data points`);
    } catch (err) {
      throw new Error(`Failed to process GRIB2 data: ${err}`);
    }
  };

  const extractRadarDataPoints = (gribData: any): RadarDataPoint[] => {
    const dataPoints: RadarDataPoint[] = [];
    
    try {
      // GRIB2 data structure varies, but typically has this format
      if (!gribData || !gribData.data) {
        throw new Error('Invalid GRIB2 data structure');
      }

      const { data, header } = gribData;
      
      // Extract grid information
      const nx = header?.nx || header?.Nx || 0; // number of points along x-axis
      const ny = header?.ny || header?.Ny || 0; // number of points along y-axis
      const la1 = header?.la1 || header?.latitudeOfFirstGridPoint || 0; // first latitude
      const lo1 = header?.lo1 || header?.longitudeOfFirstGridPoint || 0; // first longitude
      const la2 = header?.la2 || header?.latitudeOfLastGridPoint || 0; // last latitude
      const lo2 = header?.lo2 || header?.longitudeOfLastGridPoint || 0; // last longitude
      
      if (nx === 0 || ny === 0) {
        throw new Error('Invalid grid dimensions in GRIB2 data');
      }

      const latStep = (la2 - la1) / (ny - 1);
      const lonStep = (lo2 - lo1) / (nx - 1);
      
      // Convert GRIB2 coordinate system (typically scaled by 1000000) to decimal degrees
      const lat1 = la1 / 1000000;
      const lon1 = lo1 / 1000000;
      const latStepDeg = latStep / 1000000;
      const lonStepDeg = lonStep / 1000000;
      
      // Process data values
      for (let i = 0; i < data.length; i++) {
        const value = data[i];
        
        // Skip missing or invalid values
        if (value === null || value === undefined || isNaN(value)) {
          continue;
        }
        
        // Calculate lat/lng for this data point
        const row = Math.floor(i / nx);
        const col = i % nx;
        
        const lat = lat1 + (row * latStepDeg);
        const lng = lon1 + (col * lonStepDeg);
        
        // Only include points with reasonable reflectivity values (typically -30 to 80 dBZ)
        if (value >= -30 && value <= 80 && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          dataPoints.push({
            lat,
            lng,
            value
          });
        }
      }
      
      console.log(`Processed ${dataPoints.length} radar data points`);
      return dataPoints;
      
    } catch (err) {
      console.error('Error extracting radar data:', err);
      throw err;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFileUpload(file);
    }
  };

  return (
    <div className={className}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                Weather Radar Intelligence
              </h2>
              <p className="text-teal-100 text-sm">
                Real-time NOAA MRMS precipitation analysis
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadAndProcessRadarData}
                disabled={isLoading}
                className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium backdrop-blur-sm border border-white/20 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Load Latest Data
                  </>
                )}
              </button>
              
              <label className="bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-lg transition-all duration-200 cursor-pointer font-medium backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload GRIB2
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".grib2,.grib2.gz,.grb2"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-3 border-b border-slate-200 dark:border-slate-600">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="font-medium text-slate-700 dark:text-slate-300">Data Points:</span>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded font-medium">
                {isFilterEnabled ? filteredRadarData.length.toLocaleString() : radarData.length.toLocaleString()}
                {isFilterEnabled && (
                  <span className="text-xs opacity-75 ml-1">
                    / {radarData.length.toLocaleString()}
                  </span>
                )}
              </span>
            </div>
            
            {lastUpdated && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Updated:</span>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded font-medium">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Processing radar data...</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Filter Controls */}
        {radarData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <div className="flex flex-col gap-4">
              {/* Filter Toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFilterEnabled}
                    onChange={(e) => setIsFilterEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Enable Reflectivity Filtering
                  </span>
                </label>
                {isFilterEnabled && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </div>

              {/* Slider Controls */}
              {isFilterEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Minimum Threshold */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Minimum dBZ
                      </label>
                      <span className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-mono">
                        {minThreshold.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-8">
                        {dataStats.min.toFixed(0)}
                      </span>
                      <input
                        type="range"
                        min={dataStats.min}
                        max={dataStats.max}
                        step="0.5"
                        value={minThreshold}
                        onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider-green"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-8">
                        {dataStats.max.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Light precipitation and above
                    </div>
                  </div>

                  {/* Maximum Threshold */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Maximum dBZ
                      </label>
                      <span className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-mono">
                        {maxThreshold.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-8">
                        {dataStats.min.toFixed(0)}
                      </span>
                      <input
                        type="range"
                        min={dataStats.min}
                        max={dataStats.max}
                        step="0.5"
                        value={maxThreshold}
                        onChange={(e) => setMaxThreshold(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider-red"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-8">
                        {dataStats.max.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Heavy precipitation and below
                    </div>
                  </div>
                </div>
              )}

              {/* Preset Buttons */}
              {isFilterEnabled && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setMinThreshold(-10); setMaxThreshold(100); }}
                    className="text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300 px-3 py-1 rounded transition-colors"
                  >
                    Light Rain+ (≥-10 dBZ)
                  </button>
                  <button
                    onClick={() => { setMinThreshold(20); setMaxThreshold(100); }}
                    className="text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded transition-colors"
                  >
                    Moderate Rain+ (≥20 dBZ)
                  </button>
                  <button
                    onClick={() => { setMinThreshold(35); setMaxThreshold(100); }}
                    className="text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-800 dark:text-orange-300 px-3 py-1 rounded transition-colors"
                  >
                    Heavy Rain+ (≥35 dBZ)
                  </button>
                  <button
                    onClick={() => { setMinThreshold(50); setMaxThreshold(100); }}
                    className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 px-3 py-1 rounded transition-colors"
                  >
                    Severe Weather (≥50 dBZ)
                  </button>
                  <button
                    onClick={() => { setMinThreshold(dataStats.min); setMaxThreshold(dataStats.max); }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1 rounded transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1">Processing Error</h3>
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="h-[600px] relative bg-slate-100 dark:bg-slate-900">
          <MapComponent radarData={filteredRadarData} />
        </div>

        {/* Statistics */}
        {radarData.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-t border-slate-200 dark:border-slate-600">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.min(...radarData.map(d => d.value)).toFixed(1)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Min Intensity (dBZ)</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {Math.max(...radarData.map(d => d.value)).toFixed(1)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Max Intensity (dBZ)</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(radarData.reduce((sum, d) => sum + d.value, 0) / radarData.length).toFixed(1)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Average (dBZ)</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {radarData.length > 5000 ? 'National' : radarData.length > 1000 ? 'Regional' : 'Local'}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Coverage</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}