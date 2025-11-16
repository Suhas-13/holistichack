#!/bin/bash

# Setup script for Insurance Agent

echo "Setting up Insurance Agent..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "To run the agent:"
echo "  1. source venv/bin/activate"
echo "  2. export OPENROUTER_API_KEY='your-key-here'"
echo "  3. python agent.py"
echo ""
