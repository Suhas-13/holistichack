#!/bin/bash

# Quick start script for insurance agent demo

echo "================================================"
echo "Insurance Agent - Demo Setup"
echo "================================================"
echo ""

# Check if OPENROUTER_API_KEY is set
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "⚠️  OPENROUTER_API_KEY not set!"
    echo ""
    echo "Please set your OpenRouter API key:"
    echo "  export OPENROUTER_API_KEY='your-key-here'"
    echo ""
    echo "Get a key at: https://openrouter.ai/keys"
    exit 1
fi

# Check if requirements are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    echo ""
fi

echo "✅ Starting Insurance Agent..."
echo ""
echo "Endpoint: http://localhost:5001/api/insurance"
echo "Format: POST {\"message\": \"your message\"}"
echo ""
echo "Press Ctrl+C to stop"
echo ""
echo "------------------------------------------------"
echo ""

python agent.py
