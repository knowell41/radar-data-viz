'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RadarDataPoint {
  lat: number;
  lng: number;
  value: number;
}

interface MapComponentProps {
  radarData: RadarDataPoint[];
}

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapComponent({ radarData }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const radarLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on continental US
    const map = L.map(mapContainerRef.current).setView([39.8283, -98.5795], 4);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add dark map option for better radar visibility
    const darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    });

    // Add layer control
    const baseMaps = {
      "Standard": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }),
      "Dark": darkTileLayer
    };

    L.control.layers(baseMaps).addTo(map);

    // Create radar layer group
    radarLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update radar data on map
  useEffect(() => {
    if (!mapRef.current || !radarLayerRef.current) return;

    // Clear existing radar data
    radarLayerRef.current.clearLayers();

    if (radarData.length === 0) return;

    console.log(`Rendering ${radarData.length} radar points on map`);

    // Color function for radar reflectivity values (dBZ)
    const getRadarColor = (value: number): string => {
      if (value < -20) return '#000000'; // Black - No data
      if (value < -10) return '#9C9C9C'; // Gray - Very light
      if (value < 0) return '#0099CC'; // Light blue
      if (value < 5) return '#00CC99'; // Cyan
      if (value < 10) return '#00FF00'; // Green
      if (value < 15) return '#99FF00'; // Light green
      if (value < 20) return '#FFFF00'; // Yellow
      if (value < 25) return '#FFCC00'; // Orange
      if (value < 30) return '#FF9900'; // Dark orange
      if (value < 35) return '#FF6600'; // Red-orange
      if (value < 40) return '#FF0000'; // Red
      if (value < 45) return '#CC0099'; // Pink
      if (value < 50) return '#9900CC'; // Purple
      if (value < 55) return '#FFFFFF'; // White
      return '#FFFFFF'; // White for very high values
    };

    // Group nearby points to improve performance
    const gridSize = 0.1; // Degrees
    const gridData = new Map<string, { lat: number; lng: number; value: number; count: number }>();

    radarData.forEach(point => {
      const gridLat = Math.round(point.lat / gridSize) * gridSize;
      const gridLng = Math.round(point.lng / gridSize) * gridSize;
      const key = `${gridLat},${gridLng}`;

      if (gridData.has(key)) {
        const existing = gridData.get(key)!;
        existing.value = Math.max(existing.value, point.value); // Use max value in grid cell
        existing.count += 1;
      } else {
        gridData.set(key, {
          lat: gridLat,
          lng: gridLng,
          value: point.value,
          count: 1
        });
      }
    });

    // Add grid cells to map
    let addedPoints = 0;
    const maxPoints = 5000; // Limit for performance

    gridData.forEach(({ lat, lng, value, count }) => {
      if (addedPoints >= maxPoints) return;

      // Skip very low reflectivity values to reduce clutter
      if (value < -10) return;

      const color = getRadarColor(value);
      const radius = Math.max(2, Math.min(8, value / 10 + 3)); // Size based on intensity

      const circle = L.circleMarker([lat, lng], {
        radius: radius,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.7,
        fillOpacity: 0.6
      });

      // Add popup with radar information
      circle.bindPopup(`
        <div>
          <strong>Radar Reflectivity</strong><br>
          Value: ${value.toFixed(1)} dBZ<br>
          Location: ${lat.toFixed(3)}, ${lng.toFixed(3)}<br>
          ${count > 1 ? `Grid points: ${count}` : ''}
        </div>
      `);

      circle.addTo(radarLayerRef.current!);
      addedPoints++;
    });

    console.log(`Rendered ${addedPoints} grid cells on map`);

    // Fit map to radar data bounds if we have data
    if (gridData.size > 0) {
      const bounds = Array.from(gridData.values()).map(point => [point.lat, point.lng] as [number, number]);
      if (bounds.length > 1) {
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }

  }, [radarData]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-1000">
        <h4 className="font-semibold text-sm mb-3 text-slate-800 dark:text-slate-200">
          Radar Reflectivity (dBZ)
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm border border-slate-300 dark:border-slate-600" style={{ backgroundColor: '#00FF00' }}></div>
            <span className="text-slate-700 dark:text-slate-300">Light (5-15)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm border border-slate-300 dark:border-slate-600" style={{ backgroundColor: '#FFFF00' }}></div>
            <span className="text-slate-700 dark:text-slate-300">Moderate (15-25)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm border border-slate-300 dark:border-slate-600" style={{ backgroundColor: '#FF6600' }}></div>
            <span className="text-slate-700 dark:text-slate-300">Heavy (25-35)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm border border-slate-300 dark:border-slate-600" style={{ backgroundColor: '#FF0000' }}></div>
            <span className="text-slate-700 dark:text-slate-300">Intense (35-45)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm border border-slate-300 dark:border-slate-600" style={{ backgroundColor: '#9900CC' }}></div>
            <span className="text-slate-700 dark:text-slate-300">Extreme (45+)</span>
          </div>
        </div>
        
        {/* Data count indicator */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {radarData.length.toLocaleString()} points active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}