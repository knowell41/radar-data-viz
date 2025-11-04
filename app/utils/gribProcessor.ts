/**
 * Simple GRIB2 processor for browser environment
 * This is a simplified implementation for demonstration purposes
 * For production, you'd want to use a more robust GRIB2 parsing library
 */

export interface GribHeader {
  nx: number;
  ny: number;
  la1: number;
  lo1: number;
  la2: number;
  lo2: number;
  parameterName?: string;
  units?: string;
}

export interface GribData {
  header: GribHeader;
  data: number[];
}

export interface RadarDataPoint {
  lat: number;
  lng: number;
  value: number;
}

export class SimpleGribProcessor {
  static async processGribBuffer(buffer: ArrayBuffer): Promise<RadarDataPoint[]> {
    try {
      const dataView = new DataView(buffer);
      
      // Check GRIB magic number
      const magic = new TextDecoder().decode(buffer.slice(0, 4));
      if (magic !== 'GRIB') {
        console.warn('Not a GRIB file, generating sample data...');
        return this.generateSampleData();
      }
      
      // For now, return sample data since full GRIB2 parsing is complex
      // In production, you'd implement full GRIB2 parsing or use a server-side API
      console.log('GRIB file detected, generating representative sample data...');
      return this.generateSampleData();
      
    } catch (error) {
      console.error('Error processing GRIB data:', error);
      return this.generateSampleData();
    }
  }
  
  private static generateSampleData(): RadarDataPoint[] {
    const data: RadarDataPoint[] = [];
    
    // Generate realistic radar data patterns
    const stormSystems = [
      { centerLat: 39.0, centerLng: -95.0, intensity: 45, size: 3.0 }, // Kansas storm
      { centerLat: 32.0, centerLng: -85.0, intensity: 35, size: 2.5 }, // Alabama storm
      { centerLat: 41.5, centerLng: -87.5, intensity: 25, size: 2.0 }, // Chicago area
      { centerLat: 29.5, centerLng: -95.0, intensity: 40, size: 2.8 }, // Houston area
      { centerLat: 33.5, centerLng: -112.0, intensity: 20, size: 1.5 }, // Phoenix area
      { centerLat: 47.0, centerLng: -122.0, intensity: 30, size: 2.2 }, // Seattle area
    ];
    
    stormSystems.forEach(storm => {
      // Create spiral patterns for more realistic storm appearance
      for (let r = 0; r <= storm.size; r += 0.15) {
        const numPoints = Math.max(8, Math.floor(r * 12));
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * 2 * Math.PI + r * 0.5; // Spiral effect
          const lat = storm.centerLat + r * Math.cos(angle) * 0.8;
          const lng = storm.centerLng + r * Math.sin(angle);
          
          // Calculate intensity with distance falloff and some randomness
          const distanceFactor = Math.max(0, 1 - (r / storm.size));
          const baseIntensity = storm.intensity * distanceFactor;
          const noise = (Math.random() - 0.5) * 10;
          const intensity = Math.max(0, baseIntensity + noise);
          
          // Add some bands of higher intensity
          const bandEffect = Math.sin(r * 3) * 5;
          const finalIntensity = Math.max(0, intensity + bandEffect);
          
          if (finalIntensity > 5) {
            data.push({
              lat: lat + (Math.random() - 0.5) * 0.1, // Small random offset
              lng: lng + (Math.random() - 0.5) * 0.1,
              value: finalIntensity
            });
          }
        }
      }
      
      // Add some scattered light precipitation around the storm
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = storm.size + Math.random() * 2;
        const lat = storm.centerLat + distance * Math.cos(angle);
        const lng = storm.centerLng + distance * Math.sin(angle);
        const lightIntensity = Math.random() * 15 + 5;
        
        data.push({ lat, lng, value: lightIntensity });
      }
    });
    
    // Add some random light precipitation across the country
    for (let i = 0; i < 200; i++) {
      const lat = 25 + Math.random() * 25; // Continental US latitude range
      const lng = -125 + Math.random() * 60; // Continental US longitude range
      const value = Math.random() * 20;
      
      if (value > 8) { // Only include moderate+ precipitation
        data.push({ lat, lng, value });
      }
    }
    
    console.log(`Generated ${data.length} sample radar data points`);
    return data;
  }
  
  // Method to convert actual GRIB2 data (when implemented)
  static extractRadarDataPoints(gribData: GribData): RadarDataPoint[] {
    const dataPoints: RadarDataPoint[] = [];
    const { header, data } = gribData;
    
    const { nx, ny, la1, lo1, la2, lo2 } = header;
    
    if (nx === 0 || ny === 0) {
      throw new Error('Invalid grid dimensions');
    }
    
    // Convert from GRIB coordinate system (scaled by 1000000) to decimal degrees
    const lat1 = la1 / 1000000;
    const lon1 = lo1 / 1000000;
    const lat2 = la2 / 1000000;
    const lon2 = lo2 / 1000000;
    
    const latStep = (lat2 - lat1) / (ny - 1);
    const lonStep = (lon2 - lon1) / (nx - 1);
    
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      
      if (value === null || value === undefined || isNaN(value) || value < -30 || value > 80) {
        continue;
      }
      
      const row = Math.floor(i / nx);
      const col = i % nx;
      
      const lat = lat1 + (row * latStep);
      const lng = lon1 + (col * lonStep);
      
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        dataPoints.push({ lat, lng, value });
      }
    }
    
    return dataPoints;
  }
}