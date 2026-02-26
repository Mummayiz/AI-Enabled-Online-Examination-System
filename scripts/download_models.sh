#!/bin/bash

# Download face-api.js models
echo "Downloading face-api.js models..."

mkdir -p /app/frontend/public/models
cd /app/frontend/public/models

# Download tiny face detector model
wget -q https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
wget -q https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

echo "Models downloaded successfully!"
