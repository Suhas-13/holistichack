# 🚀 Red Team Evolution Backend - Setup & Run Guide

## Quick Start (3 Steps)

### 1. Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required: AWS Bedrock (for attack generation)
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1

# Required: Together AI (for Llama Guard verification)
TOGETHER_API_KEY=your_together_api_key_here

# Optional: Adjust if needed
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**🔑 How to Get API Keys:**

- **AWS Bedrock**: 
  1. Go to AWS Console → IAM → Create Access Key
  2. Enable Bedrock access in your region (us-east-1 recommended)
  3. Ensure you have Claude 3 Haiku model access

- **Together AI**:
  1. Sign up at https://www.together.ai/
  2. Go to Settings → API Keys
  3. Create a new API key

### 3. Run the Server

```bash
python run.py
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start at: **http://localhost:8000**

---

## 🧪 Testing Your Installation

### Method 1: Interactive API Docs (Easiest)

1. Open http://localhost:8000/docs in your browser
2. Try the `POST /api/v1/start-attack` endpoint
3. Use this test payload:

```json
{
  "target_endpoint": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear",
  "attack_goals": ["reveal_system_prompt"],
  "seed_attack_count": 5
}
```

4. Copy the `attack_id` from the response
5. Check status: `GET /api/v1/status/{attack_id}`
6. Get results: `GET /api/v1/results/{attack_id}`

### Method 2: Using cURL

```bash
# Start an attack (using one of the hackathon endpoints)
curl -X POST http://localhost:8000/api/v1/start-attack \
  -H "Content-Type: application/json" \
  -d '{
    "target_endpoint": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear",
    "attack_goals": ["reveal_system_prompt", "generate_harmful_content"],
    "seed_attack_count": 5
  }'

# Response will look like:
# {
#   "attack_id": "abc-123-def-456",
#   "websocket_url": "ws://localhost:8000/ws/v1/abc-123-def-456"
# }

# Check status (replace {attack_id} with actual ID)
curl http://localhost:8000/api/v1/status/abc-123-def-456

# Get results when complete
curl http://localhost:8000/api/v1/results/abc-123-def-456
```

### Method 3: Python Test Script

Create `test_api.py`:

```python
import requests
import json
import time

# Start attack
response = requests.post(
    "http://localhost:8000/api/v1/start-attack",
    json={
        "target_endpoint": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear",
        "attack_goals": ["reveal_system_prompt"],
        "seed_attack_count": 5
    }
)

data = response.json()
attack_id = data["attack_id"]
print(f"Started attack: {attack_id}")

# Poll status
while True:
    status_response = requests.get(f"http://localhost:8000/api/v1/status/{attack_id}")
    status = status_response.json()
    
    print(f"Status: {status['status']} | Nodes: {status['total_nodes']} | Success: {status['successful_nodes']}")
    
    if status["status"] == "completed":
        break
    
    time.sleep(2)

# Get results
results = requests.get(f"http://localhost:8000/api/v1/results/{attack_id}")
print(json.dumps(results.json(), indent=2))
```

Run it:
```bash
python test_api.py
```

### Method 4: WebSocket Test

Create `test_websocket.py`:

```python
import asyncio
import websockets
import json
import requests

async def test_websocket():
    # Start attack
    response = requests.post(
        "http://localhost:8000/api/v1/start-attack",
        json={
            "target_endpoint": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear",
            "attack_goals": ["reveal_system_prompt"],
            "seed_attack_count": 5
        }
    )
    
    data = response.json()
    attack_id = data["attack_id"]
    websocket_url = data["websocket_url"]
    
    print(f"Connecting to {websocket_url}")
    
    # Connect to WebSocket
    async with websockets.connect(websocket_url) as websocket:
        print("Connected! Listening for events...\n")
        
        while True:
            try:
                message = await websocket.recv()
                event = json.loads(message)
                
                print(f"[{event['event_type']}]")
                
                if event['event_type'] == 'agent_mapping_update':
                    print(f"  → {event['payload']['message']}")
                
                elif event['event_type'] == 'cluster_add':
                    print(f"  → Cluster: {event['payload']['name']}")
                
                elif event['event_type'] == 'node_add':
                    print(f"  → Starting attack: {event['payload']['attack_type']}")
                
                elif event['event_type'] == 'node_update':
                    payload = event['payload']
                    print(f"  → Attack {payload['status']}: {payload.get('llm_summary', 'No summary')[:100]}")
                
                elif event['event_type'] == 'attack_complete':
                    print(f"  → {event['payload']['message']}")
                    break
                
                print()
            
            except websockets.exceptions.ConnectionClosed:
                print("Connection closed")
                break

asyncio.run(test_websocket())
```

Run it:
```bash
pip install websockets  # If not already installed
python test_websocket.py
```

---

## 🎯 Available Target Endpoints (Hackathon)

Test against these 7 animal-coded agents:

```
https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear
https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/fox
https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/eagle
https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/ant
https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/wolf
https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/elephant
https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/chameleon
```

---

## 📊 What to Expect

When you run an attack with 5 seed attacks:

1. **Phase 1: Agent Mapping** (~10-15 seconds)
   - Fingerprints the target agent
   - Identifies framework, model, architecture

2. **Phase 2: Cluster Creation** (~1 second)
   - Creates 2-4 clusters based on attack types
   - Broadcasts cluster positions

3. **Phase 3: Attack Execution** (~30-60 seconds)
   - Executes 5 attacks (1-3 turns each)
   - Verifies with Llama Guard
   - Generates LLM summaries

4. **Phase 4: Complete** (~1 second)
   - Calculates ASR metrics
   - Generates final analysis

**Total time**: ~45-90 seconds for 5 attacks

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or use a different port
PORT=8001 python run.py
```

### AWS Credentials Error
```
botocore.exceptions.NoCredentialsError
```
**Solution**: Check `.env` file has correct AWS credentials

### Together AI Error
```
together.error.AuthenticationError
```
**Solution**: Verify `TOGETHER_API_KEY` in `.env`

### Module Not Found Errors
```bash
# Ensure you're in the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### WebSocket Connection Refused
- Ensure server is running: `curl http://localhost:8000/`
- Check CORS settings in `.env` match your frontend origin
- Try connecting to `ws://localhost:8000` instead of `ws://0.0.0.0:8000`

### Target Endpoint Timeout
The hackathon endpoints have rate limits:
- Wait a few seconds between requests
- Use smaller `seed_attack_count` (e.g., 5 instead of 20)
- Try a different animal endpoint

---

## 📈 Performance Tips

### For Development
```bash
# Use fewer attacks for faster testing
"seed_attack_count": 5

# Reduce attack turns in config.py
MAX_ATTACK_TURNS = 1  # Instead of 3
```

### For Production
```bash
# Increase concurrency (in orchestrator.py)
semaphore = asyncio.Semaphore(10)  # Instead of 5

# Use Redis for state management (future enhancement)
```

---

## 🎨 Frontend Integration Example

Your frontend should:

```javascript
// 1. Start attack
const response = await fetch('http://localhost:8000/api/v1/start-attack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_endpoint: 'https://.../api/bear',
    attack_goals: ['reveal_system_prompt'],
    seed_attack_count: 20
  })
});

const { attack_id, websocket_url } = await response.json();

// 2. Connect to WebSocket
const ws = new WebSocket(websocket_url);

ws.onmessage = (event) => {
  const { event_type, payload } = JSON.parse(event.data);
  
  switch(event_type) {
    case 'cluster_add':
      // Add cluster to visualization
      addCluster(payload.cluster_id, payload.name, payload.position_hint);
      break;
    
    case 'node_add':
      // Show node starting
      addNode(payload.node_id, payload.cluster_id, payload.attack_type);
      break;
    
    case 'node_update':
      // Update node with results and transcript
      updateNode(payload.node_id, payload.status, payload.full_transcript);
      break;
    
    case 'attack_complete':
      // Fetch final results
      fetchResults(attack_id);
      break;
  }
};

// 3. Get final results
async function fetchResults(attack_id) {
  const res = await fetch(`http://localhost:8000/api/v1/results/${attack_id}`);
  const results = await res.json();
  showResultsPanel(results);
}
```

---

## 📚 Next Steps

1. ✅ Test basic attack flow
2. ✅ Verify WebSocket streaming
3. ✅ Check results endpoint
4. 🔄 Integrate with frontend
5. 🔄 Implement evolution system (genetic algorithms)
6. 🔄 Add LLM-based analysis summaries
7. 🔄 Deploy to production

---

## 💡 Quick Commands Reference

```bash
# Setup
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Configure
cp .env.example .env && nano .env

# Run
python run.py

# Test
curl http://localhost:8000/
curl -X POST http://localhost:8000/api/v1/start-attack -H "Content-Type: application/json" -d '{"target_endpoint":"https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear","seed_attack_count":5}'

# Docs
open http://localhost:8000/docs
```

---

## 🏆 You're Ready!

The backend is now fully operational. Start testing attacks and integrate with your frontend visualization!

For questions or issues, check:
- API docs: http://localhost:8000/docs
- Backend README: `backend/README.md`
- Logs: Check terminal output for detailed logging
