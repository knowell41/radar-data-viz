import { NextRequest, NextResponse } from 'next/server';
// const MRMS_BASE_URL = 'https://mrms.ncep.noaa.gov/2D/HAWAII/ReflectivityAtLowestAltitude/';
const MRMS_BASE_URL = 'https://mrms.ncep.noaa.gov/2D/ReflectivityAtLowestAltitude/';
const LATEST_FILE_NAME = 'MRMS_ReflectivityAtLowestAltitude.latest.grib2.gz';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for optional filtering
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download'); // If true, force download instead of streaming
    const filename = searchParams.get('filename'); // Optional custom filename
    
    const downloadUrl = `${MRMS_BASE_URL}${LATEST_FILE_NAME}`;
    
    console.log(`Fetching latest radar data from: ${downloadUrl}`);
    
    // Retry logic for network resilience
    let lastError: Error | null = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to download radar data...`);
        
        // Fetch the file from NOAA with timeout and better headers
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'radar-viz-app/1.0.0',
            'Accept': 'application/gzip, application/octet-stream, */*',
            'Accept-Encoding': 'identity', // Don't double-compress
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(`Failed to fetch radar data: ${response.status} ${response.statusText}`);
          if (attempt === maxRetries) {
            return NextResponse.json(
              { 
                error: 'Failed to fetch radar data from NOAA MRMS',
                status: response.status,
                statusText: response.statusText 
              },
              { status: response.status }
            );
          }
          continue; // Try again
        }

        // Get the file content with streaming for better memory handling
        const fileBuffer = await response.arrayBuffer();
        const contentLength = response.headers.get('content-length');
        const lastModified = response.headers.get('last-modified');
        
        console.log(`Successfully fetched radar data: ${fileBuffer.byteLength} bytes`);

        // Set appropriate headers for file download
        const headers = new Headers();
        
        // Use custom filename if provided, otherwise use default
        const responseFilename = filename || LATEST_FILE_NAME;
        
        if (download === 'true') {
          // Force download
          headers.set('Content-Disposition', `attachment; filename="${responseFilename}"`);
        } else {
          // Allow inline viewing/streaming
          headers.set('Content-Disposition', `inline; filename="${responseFilename}"`);
        }
        
        headers.set('Content-Type', 'application/gzip');
        headers.set('Content-Length', fileBuffer.byteLength.toString());
        
        // Pass through caching headers from NOAA
        if (lastModified) {
          headers.set('Last-Modified', lastModified);
        }
        
        // Add CORS headers if needed for browser access
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET');
        headers.set('Access-Control-Allow-Headers', 'Content-Type');
        
        // Add metadata headers
        headers.set('X-Original-URL', downloadUrl);
        headers.set('X-File-Size', fileBuffer.byteLength.toString());
        headers.set('X-Retry-Attempt', attempt.toString());
        if (contentLength) {
          headers.set('X-Original-Content-Length', contentLength);
        }

        return new NextResponse(fileBuffer, {
          status: 200,
          headers,
        });

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, return error
    throw lastError || new Error('All retry attempts failed');

  } catch (error) {
    console.error('Error downloading radar data:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error while downloading radar data',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error && error.cause ? String(error.cause) : undefined,
      },
      { status: 500 }
    );
  }
}

// Optional: Add a HEAD method to get file metadata without downloading
export async function HEAD(request: NextRequest) {
  try {
    const downloadUrl = `${MRMS_BASE_URL}${LATEST_FILE_NAME}`;
    
    // Make a HEAD request to get metadata
    const response = await fetch(downloadUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'radar-viz-app/1.0.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch radar data metadata',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/gzip');
    headers.set('Access-Control-Allow-Origin', '*');
    
    // Pass through relevant headers
    const contentLength = response.headers.get('content-length');
    const lastModified = response.headers.get('last-modified');
    const etag = response.headers.get('etag');
    
    if (contentLength) headers.set('Content-Length', contentLength);
    if (lastModified) headers.set('Last-Modified', lastModified);
    if (etag) headers.set('ETag', etag);
    
    headers.set('X-Original-URL', downloadUrl);

    return new NextResponse(null, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error getting radar data metadata:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error while getting radar data metadata',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}