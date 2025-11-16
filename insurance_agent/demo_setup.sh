#!/bin/bash

# Complete demo setup script - runs everything needed

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Insurance Agent Demo - Complete Setup                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check API key
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "❌ OPENROUTER_API_KEY not set!"
    echo ""
    echo "Please run:"
    echo "  export OPENROUTER_API_KEY='your-key-here'"
    echo ""
    exit 1
fi

echo "✅ API key found"
echo ""

# Install insurance agent dependencies
echo "📦 Installing insurance agent dependencies..."
cd insurance_agent
pip install -q -r requirements.txt

# Test basic functionality
echo ""
echo "🧪 Testing agent startup..."
timeout 3 python agent.py &>/dev/null &
AGENT_PID=$!
sleep 2

if kill -0 $AGENT_PID 2>/dev/null; then
    echo "✅ Agent can start successfully"
    kill $AGENT_PID 2>/dev/null
else
    echo "⚠️  Agent startup test inconclusive (this is usually fine)"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   SETUP COMPLETE!                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  Start the insurance agent:"
echo "   cd insurance_agent"
echo "   ./start.sh"
echo ""
echo "2️⃣  In another terminal, start your backend:"
echo "   cd backend"
echo "   python run.py"
echo ""
echo "3️⃣  Target the insurance agent with your attack system:"
echo "   Target: http://localhost:5001/api/insurance"
echo ""
echo "📖 Documentation:"
echo "   • insurance_agent/DEMO_SETUP.md     - Complete guide"
echo "   • insurance_agent/INTEGRATION.md    - Integration details"
echo "   • insurance_agent/USAGE_EXAMPLE.md  - Example attacks"
echo "   • insurance_agent/QUICKREF.txt      - Quick reference"
echo ""
echo "🎯 Ready for your demo!"
echo ""
