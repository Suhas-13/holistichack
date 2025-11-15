#!/bin/bash

# Red-Team Evolution Dashboard - Demo Mode Runner
# Runs the frontend with mock data (no backend required)

set -e

echo "🚀 Red-Team Evolution Dashboard - Demo Mode"
echo "============================================"
echo ""
echo "This will run the dashboard with simulated backend data."
echo "No real backend connection is required."
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
  echo "⚠️  Warning: .env.local already exists"
  read -p "Overwrite with demo configuration? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Using existing .env.local configuration"
  else
    cp .env.demo .env.local
    echo "✅ Copied .env.demo to .env.local"
  fi
else
  cp .env.demo .env.local
  echo "✅ Created .env.local with demo configuration"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎬 Starting development server in DEMO MODE..."
echo ""
echo "📝 Demo Features:"
echo "   • Mock WebSocket events (no real backend)"
echo "   • Simulated attack evolution with 4 clusters"
echo "   • 5 generations of genetic algorithm evolution"
echo "   • Configurable event delays and success rates"
echo ""
echo "🎮 Controls:"
echo "   • Click the 'DEMO MODE' button in bottom-right to toggle"
echo "   • Configure simulation parameters via settings icon"
echo "   • Use Config Panel to start simulated attacks"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
