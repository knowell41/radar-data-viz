#!/bin/bash

# Build and optimize Docker image for smallest size
echo "🐳 Building optimized Docker image..."

# Build the image with build-time optimizations
docker build \
  --build-arg NODE_ENV=production \
  --build-arg NEXT_TELEMETRY_DISABLED=1 \
  -t radar-viz:latest \
  -t radar-viz:$(date +%Y%m%d-%H%M%S) \
  .

echo "📦 Image built successfully!"

# Display image size
echo "📊 Image sizes:"
docker images | grep radar-viz

# Optional: Run container
echo "🚀 To run the container:"
echo "docker run -p 3000:3000 radar-viz:latest"
echo ""
echo "🐙 Or use docker-compose:"
echo "docker-compose up -d"

# Optional: Push to registry (uncomment and modify as needed)
# echo "📤 Pushing to registry..."
# docker tag radar-viz:latest your-registry/radar-viz:latest
# docker push your-registry/radar-viz:latest