#!/bin/bash
# Quick setup script for Red Team Evolution Backend

set -e

echo "============================================================"
echo "Red Team Evolution Backend - Quick Setup"
echo "============================================================"
echo ""

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not found!"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo "✓ Dependencies installed"

# Setup .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your API keys:"
    echo "   - AWS_ACCESS_KEY_ID"
    echo "   - AWS_SECRET_ACCESS_KEY"
    echo "   - TOGETHER_API_KEY"
    echo ""
    echo "   Run: nano .env"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "============================================================"
echo "✓ Setup Complete!"
echo "============================================================"
echo ""
echo "Next steps:"
echo "  1. Configure your API keys: nano .env"
echo "  2. Run the server: python run.py"
echo "  3. Test the API: python test_api.py"
echo "  4. Test WebSocket: python test_websocket.py"
echo ""
echo "Or run the quick test:"
echo "  source venv/bin/activate && python test_api.py"
echo ""
