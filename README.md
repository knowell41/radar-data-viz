# NOAA Radar Visualization

A Next.js application that downloads and visualizes NOAA MRMS (Multi-Radar/Multi-Sensor) weather radar data on an interactive map.

## Features

- **Real-time Radar Data**: Download the latest weather radar data from NOAA MRMS
- **Interactive Map**: Leaflet-based map with zoom, pan, and layer controls
- **Data Visualization**: Color-coded radar reflectivity values with intensity legend
- **File Upload**: Support for uploading custom GRIB2 files
- **Responsive Design**: Works on desktop and mobile devices
- **API Endpoint**: RESTful API for programmatic access to radar data

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Web Interface

1. **Load Latest Data**: Click "Load Latest Radar Data" to fetch and display current NOAA radar data
2. **Upload File**: Use "Upload GRIB2 File" to visualize your own radar data files
3. **Explore Map**: 
   - Zoom in/out using mouse wheel or map controls
   - Pan by clicking and dragging
   - Switch between map styles using the layer control
   - Click on radar points to see detailed information

### API Usage

The application provides a REST API for downloading radar data:

```bash
# Download latest radar data
curl -o radar.grib2.gz "http://localhost:3000/api/download-latest-radar?download=true"

# Get file metadata
curl -I "http://localhost:3000/api/download-latest-radar"
```

## Data Format

### Radar Reflectivity Values (dBZ)

The radar data uses the dBZ (decibels of Z) scale to measure precipitation intensity:

- **5 to 20 dBZ**: Light to moderate rain (🟢 Green)
- **20 to 35 dBZ**: Moderate to heavy rain (🟡 Yellow)
- **35 to 45 dBZ**: Heavy rain, possible small hail (🟠 Orange)
- **45+ dBZ**: Intense precipitation, large hail possible (🔴 Red/🟣 Purple)

## Technical Details

### Architecture

- **Frontend**: Next.js 14 with React 18
- **Mapping**: Leaflet with React-Leaflet
- **Styling**: Tailwind CSS
- **Data Processing**: Custom GRIB2 processor for browser compatibility
- **API**: Next.js API routes for server-side data fetching

### Data Source

Radar data is sourced from NOAA's Multi-Radar/Multi-Sensor (MRMS) system:

- **URL**: https://mrms.ncep.noaa.gov/2D/ReflectivityAtLowestAltitude/
- **Update Frequency**: Every 2-5 minutes
- **Coverage**: Continental United States
- **Resolution**: 1km x 1km grid
- **Format**: GRIB2 compressed files

## License

This project is licensed under the MIT License.

---

**Note**: This application is for educational and research purposes. For critical weather decisions, always consult official National Weather Service forecasts and warnings.
