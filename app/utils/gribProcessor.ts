/**
 * Simple GRIB2 processor for browser environment
 * This is a simplified implementation for demonstration purposes
 * For production, you'd want to use a more robust GRIB2 parsing library
 */

import { inflate } from 'pako';

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

export interface ProcessedRadarData {
  data: RadarDataPoint[];
  metadata: {
    width: number;
    height: number;
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
    timestamp: Date;
    dataSource?: string;
  };
  isSampleData: boolean;
}

export class SimpleGribProcessor {
  static async processGribBuffer(buffer: ArrayBuffer): Promise<RadarDataPoint[]> {
    try {
      console.log(`🔍 Processing buffer of size: ${buffer.byteLength} bytes`);
      
      // Check if the data is gzipped
      const uint8Array = new Uint8Array(buffer);
      const isGzipped = this.isGzipFile(uint8Array);
      
      if (isGzipped) {
        console.log('📦 File is gzipped, decompressing...');
        try {
          const decompressed = inflate(uint8Array);
          console.log(`✅ Successfully decompressed ${uint8Array.length} bytes to ${decompressed.byteLength} bytes`);
          buffer = decompressed.buffer.slice(decompressed.byteOffset, decompressed.byteOffset + decompressed.byteLength);
        } catch (error) {
          console.error('❌ Failed to decompress gzipped file:', error);
          return this.generateSampleData();
        }
      }
      
      // Check GRIB magic number
      const magic = new TextDecoder().decode(buffer.slice(0, 4));
      console.log(`🔤 Magic string: "${magic}"`);
      
      if (magic !== 'GRIB') {
        console.warn(`❌ Not a GRIB file, magic string is "${magic}", generating sample data...`);
        return this.generateSampleData();
      }
      
      console.log('✅ Valid GRIB file detected, processing real data...');
      const realData = await this.parseGrib2Data(buffer);
      return realData;
      
    } catch (error) {
      console.error('💥 Error processing GRIB data:', error);
      console.log('🔄 Falling back to sample data...');
      return this.generateSampleData();
    }
  }

  private static isGzipFile(data: Uint8Array): boolean {
    // Gzip files start with magic number 0x1f, 0x8b
    return data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;
  }

  private static async parseGrib2Data(buffer: ArrayBuffer): Promise<RadarDataPoint[]> {
    try {
      const dataView = new DataView(buffer);
      const data: RadarDataPoint[] = [];
      
      // GRIB2 file structure parsing
      let offset = 16; // Skip indicator section
      
      // Look for Grid Definition Section (Section 3)
      while (offset < buffer.byteLength - 4) {
        const sectionLength = dataView.getUint32(offset);
        const sectionNumber = dataView.getUint8(offset + 4);
        
        if (sectionNumber === 3) {
          // Grid Definition Section
          const gridTemplate = dataView.getUint16(offset + 12);
          console.log(`🗂️  Found Grid Definition Section, template: ${gridTemplate}`);
          
          if (gridTemplate === 0) { // Latitude/longitude grid
            const ni = dataView.getUint32(offset + 30); // Number of points along parallel
            const nj = dataView.getUint32(offset + 34); // Number of points along meridian
            const la1 = dataView.getInt32(offset + 46) / 1000000; // First point latitude
            const lo1 = dataView.getInt32(offset + 50) / 1000000; // First point longitude
            const la2 = dataView.getInt32(offset + 55) / 1000000; // Last point latitude
            const lo2 = dataView.getInt32(offset + 59) / 1000000; // Last point longitude
            const di = dataView.getUint32(offset + 63) / 1000000; // i direction increment
            const dj = dataView.getUint32(offset + 67) / 1000000; // j direction increment
            
            // Check scanning mode and other flags
            const scanningMode = dataView.getUint8(offset + 71);
            const scanningFlags = {
              iNegative: (scanningMode & 0x80) !== 0,  // i direction scanning
              jPositive: (scanningMode & 0x40) !== 0,  // j direction scanning  
              consecutive: (scanningMode & 0x20) !== 0  // consecutive points in i or j direction
            };
            
            console.log(`Grid: ${ni}x${nj}, from ${la1},${lo1} to ${la2},${lo2}`);
            console.log(`🔍 Grid increments: di=${di}, dj=${dj}`);
            console.log(`🧭 Scanning mode: ${scanningMode.toString(16)}, flags:`, scanningFlags);
            console.log(`📍 Expected Hawaii coordinates: lat ~19-22°N, lon ~154-162°W`);
            
            // Check if this looks like Hawaii data
            const isHawaiiData = la1 > 15 && la1 < 30 && lo1 > 180 && lo1 < 220;
            if (isHawaiiData) {
              console.log(`🌺 Detected Hawaii dataset - special coordinate handling needed`);
              console.log(`🔍 Using grid definition method (template 0) - no explicit coordinates stored`);
            }
            
            // Find the data section (Section 7)
            let dataOffset = offset + sectionLength;
            while (dataOffset < buffer.byteLength - 4) {
              const dataSectionLength = dataView.getUint32(dataOffset);
              const dataSectionNumber = dataView.getUint8(dataOffset + 4);
              
              if (dataSectionNumber === 7) {
                // Data section found
                const dataStartOffset = dataOffset + 5;
                const actualDataLength = dataSectionLength - 5;
                const numValues = Math.floor(actualDataLength / 2);
                const valuesToRead = Math.min(numValues, ni * nj);
                
                console.log(`📊 Reading ${valuesToRead} data values from MRMS grid...`);
                
                // **EXPERIMENTAL: Try rendering more data points for better detail**
                // We can adjust these parameters to balance detail vs performance
                
                const EXPERIMENTAL_HIGH_DENSITY = true; // Set to true to try rendering more points
                
                let rowStep, colStep;
                if (EXPERIMENTAL_HIGH_DENSITY) {
                  // More aggressive sampling - render ~250,000 points
                  rowStep = Math.max(1, Math.floor(nj / 1000)); // Every ~3-4 rows
                  colStep = Math.max(1, Math.floor(ni / 1000)); // Every ~7 columns  
                  console.log(`🚀 EXPERIMENTAL HIGH-DENSITY MODE: every ${rowStep} rows, every ${colStep} columns`);
                } else {
                  // Conservative sampling - render ~250,000 points
                  rowStep = Math.max(1, Math.floor(nj / 500)); // Every ~7 rows
                  colStep = Math.max(1, Math.floor(ni / 500)); // Every ~14 columns
                  console.log(`📊 Standard density sampling: every ${rowStep} rows, every ${colStep} columns`);
                }
                
                const expectedPoints = Math.ceil(nj/rowStep) * Math.ceil(ni/colStep);
                console.log(`📊 Expected coverage: ${Math.ceil(nj/rowStep)} × ${Math.ceil(ni/colStep)} = ${expectedPoints.toLocaleString()} grid points`);
                
                if (expectedPoints > 500000) {
                  console.warn(`⚠️  Warning: ${expectedPoints.toLocaleString()} points may impact browser performance!`);
                }
                
                // Also log expected latitude coverage
                const latCoverage = {
                  north: la1 - 0 * Math.abs(dj),
                  center: la1 - Math.floor(nj/2) * Math.abs(dj), 
                  south: la1 - (nj-1) * Math.abs(dj)
                };
                console.log(`📍 Latitude coverage: ${latCoverage.north.toFixed(1)}°N to ${latCoverage.south.toFixed(1)}°N (center: ${latCoverage.center.toFixed(1)}°N)`);
                
                // SIMPLIFIED APPROACH: Process ALL valid data points without filtering
                // This will show us exactly what's in the Hawaii GRIB file
                const allDataPoints: RadarDataPoint[] = [];
                
                console.log(`🔍 Processing ALL data points without filtering...`);
                console.log(`Grid parameters: ni=${ni}, nj=${nj}, la1=${la1}, la2=${la2}, lo1=${lo1}, lo2=${lo2}`);
                
                // Sample every N-th point across the entire grid to get good coverage
                const sampleRowStep = Math.max(1, Math.floor(nj / 200)); // Sample 200 rows
                const sampleColStep = Math.max(1, Math.floor(ni / 200)); // Sample 200 columns
                
                console.log(`� Sampling: every ${sampleRowStep} rows, every ${sampleColStep} columns`);
                
                for (let row = 0; row < nj; row += sampleRowStep) {
                  for (let col = 0; col < ni; col += sampleColStep) {
                    const i = row * ni + col;
                    if (i >= valuesToRead) break;
                    
                    try {
                      // Read 16-bit value and convert to dBZ
                      const rawValue = dataView.getUint16(dataStartOffset + i * 2, false);
                      
                      // **DEBUG: Log first few samples**
                      if (row < 5 && col < 5) {
                        console.log(`🔍 Sample: row=${row}, col=${col}, i=${i}, rawValue=${rawValue}`);
                      }
                      
                      // Skip missing/invalid data markers
                      if (rawValue === 0 || rawValue === 65535 || rawValue === 32767) {
                        if (row < 5 && col < 5) {
                          console.log(`⏭️  Skipping missing/invalid data marker: ${rawValue}`);
                        }
                        continue;
                      }
                      
                      // MRMS reflectivity scaling
                      let dbzValue;
                      if (rawValue > 32000) {
                        dbzValue = (rawValue - 65535) / 100.0;
                      } else if (rawValue > 3200) {
                        dbzValue = (rawValue / 100.0) - 32.0;
                      } else {
                        dbzValue = rawValue / 100.0;
                      }
                      
                      // **NO FILTERING** - Include all valid data points
                      
                      // Calculate lat/lng using GRIB2 scanning mode and grid definition
                      // This is the standard method - GRIB2 stores grid parameters, not individual coordinates
                      
                      // For latitude: Use scanning flags to determine direction
                      let lat;
                      if (scanningFlags.jPositive) {
                        // j increases from South to North
                        lat = la1 + row * Math.abs((la2 - la1) / (nj - 1));
                      } else {
                        // j increases from North to South (most common)
                        lat = la1 - row * Math.abs((la1 - la2) / (nj - 1));
                      }
                      
                      // For longitude: Use scanning flags to determine direction
                      let lng;
                      if (scanningFlags.iNegative) {
                        // i increases from East to West
                        lng = lo1 - col * Math.abs((lo1 - lo2) / (ni - 1));
                      } else {
                        // i increases from West to East (most common)
                        lng = lo1 + col * Math.abs((lo2 - lo1) / (ni - 1));
                      }
                      
                      // Convert 0-360° longitude to -180/+180°
                      if (lng > 180) {
                        lng = lng - 360;
                      }
                      
                      // Debug coordinate calculation for first few points
                      if (row < 5 && col < 5) {
                        console.log(`🔍 Coord calc: row=${row}, col=${col} → lat=${lat.toFixed(3)}, lng=${lng.toFixed(3)}, dbz=${dbzValue.toFixed(1)}`);
                      }
                      
                      // **NO COORDINATE OR VALUE FILTERING** - Accept all calculated points
                      const point = { lat, lng, value: dbzValue };
                      allDataPoints.push(point);
                      
                      // **Track total points to prevent browser overload** 
                      if (allDataPoints.length >= 5000) {
                        console.log(`⚠️  Reached 5,000 point limit, stopping sampling`);
                        break;
                      }
                    } catch (err) {
                      // Skip problematic values
                      continue;
                    }
                  }
                  
                  // Break out of outer loop too if we hit the limit
                  if (allDataPoints.length >= 10000) {
                    break;
                  }
                }
                
                console.log(`🔍 DEBUG: Found ${allDataPoints.length} total data points across full grid`);
                
                // Analyze the geographic distribution
                if (allDataPoints.length > 0) {
                  const lats = allDataPoints.map(p => p.lat);
                  const lngs = allDataPoints.map(p => p.lng);
                  const values = allDataPoints.map(p => p.value);
                  
                  console.log(`🌍 Geographic distribution:`);
                  console.log(`   Latitude: ${Math.min(...lats).toFixed(3)}° to ${Math.max(...lats).toFixed(3)}°`);
                  console.log(`   Longitude: ${Math.min(...lngs).toFixed(3)}° to ${Math.max(...lngs).toFixed(3)}°`);
                  console.log(`   Values: ${Math.min(...values).toFixed(1)} to ${Math.max(...values).toFixed(1)} dBZ`);
                  
                  // Count by value ranges
                  const highValues = values.filter(v => v > 10).length;
                  const mediumValues = values.filter(v => v > -10 && v <= 10).length;
                  const lowValues = values.filter(v => v <= -10).length;
                  
                  console.log(`   High values (>10 dBZ): ${highValues} points`);
                  console.log(`   Medium values (-10 to 10 dBZ): ${mediumValues} points`);
                  console.log(`   Low values (<-10 dBZ): ${lowValues} points`);
                }
                
                // Use all data points for analysis
                const combinedData = allDataPoints;
                
                console.log(`✅ Successfully extracted ${combinedData.length} radar data points from real GRIB2 data`);
                console.log(`� DEBUGGING: Full grid systematic sampling complete`);
                
                if (combinedData.length > 0) {
                  // Check data distribution
                  const latRange = [Math.min(...combinedData.map(d => d.lat)), Math.max(...combinedData.map(d => d.lat))];
                  const lngRange = [Math.min(...combinedData.map(d => d.lng)), Math.max(...combinedData.map(d => d.lng))];
                  console.log(`📊 Data lat range: ${latRange[0].toFixed(3)} to ${latRange[1].toFixed(3)}`);
                  console.log(`📊 Data lng range: ${lngRange[0].toFixed(3)} to ${lngRange[1].toFixed(3)}`);
                }
                return combinedData;
              }
              
              dataOffset += dataSectionLength;
            }
          }
        }
        
        offset += sectionLength;
      }
      
      // If we get here, couldn't parse the data properly
      throw new Error('Could not find valid grid data in GRIB2 file');
      
    } catch (error) {
      console.error('GRIB2 parsing error:', error);
      throw error;
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