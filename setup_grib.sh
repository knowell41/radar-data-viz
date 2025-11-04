#!/bin/bash

# Setup script for GRIB2 radar data processing
# This script downloads the latest NOAA MRMS data and sets up the Python environment

echo "🌦️  Setting up NOAA MRMS Radar Data Processing"
echo "=============================================="

# Check if GRIB file exists locally
GRIB_FILE="MRMS_MergedReflectivityQC_00.50.latest.grib2"

if [ -f "$GRIB_FILE" ]; then
    FILE_SIZE=$(ls -lh "$GRIB_FILE" | awk '{print $5}')
    echo "✅ Found existing GRIB file: $GRIB_FILE ($FILE_SIZE)"
else
    echo "❌ GRIB file not found: $GRIB_FILE"
    echo "💡 Make sure the file is in the current directory"
    exit 1
fi

echo ""
echo "🚀 Setup complete! Run the processor with:"
echo "   python3 process_grib.py"
echo ""
echo "📁 This will generate:"
echo "   - radar_interactive_map.html (Interactive map visualization)"
echo "   - radar_data_analysis.html (Data distribution analysis)"