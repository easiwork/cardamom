#!/bin/bash

# Build script for Cardamom React App

echo "🌿 Building Cardamom Recipe Vault..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the React app
echo "🔨 Building React application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ React app built successfully!"
    echo "📁 Build files are in the 'dist' directory"
    echo ""
    echo "🚀 To run in production:"
    echo "   NODE_ENV=production npm start"
    echo ""
    echo "🌐 The app will be available at http://localhost:3000"
else
    echo "❌ Build failed!"
    exit 1
fi
