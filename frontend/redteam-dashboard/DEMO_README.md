# 🎬 Red-Team Evolution Dashboard - Demo Mode

Run the complete frontend visualization **without needing a backend** using our mock simulation system.

Perfect for:
- 🏆 **Hackathon demonstrations** when backend isn't ready
- 🧪 **Frontend testing** and development
- 📊 **Visualizing attack evolution** without real LLM calls
- 🎓 **Educational demonstrations** of red-teaming concepts

---

## 🚀 Quick Start

### Option 1: Run Demo Script (Recommended)

```bash
cd frontend/redteam-dashboard
./run-demo.sh
```

This will:
1. ✅ Set up demo environment variables
2. ✅ Install dependencies
3. ✅ Start the dev server with mock data
4. ✅ Open the dashboard in your browser

### Option 2: Manual Setup

```bash
# 1. Copy demo environment
cp .env.demo .env.local

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## 🎮 How to Use Demo Mode

### Starting a Simulated Attack

1. **Click the "DEMO MODE" button** in the bottom-right corner
   - Green = Demo mode enabled ✅
   - Gray = Real backend mode

2. **Configure your attack** in the left panel:
   - Target Agent: `GPT-4 Financial Assistant`
   - Generations: `5`
   - Population: `20`
   - Mutation Rate: `0.3`

3. **Click "Start Attack"**

4. **Watch the simulation unfold**:
   - ⚪ Clusters appear (attack strategies)
   - 🔵 Nodes are added (individual attacks)
   - 🟡 Nodes turn yellow (running)
   - 🟢 Nodes turn green (success) or 🔴 red (failure)
   - 🔗 Evolution links show genetic relationships

---

## ⚙️ Demo Configuration

Click the **⚙️ settings icon** on the DEMO MODE button to configure:

| Parameter | Description | Default | Range |
|-----------|-------------|---------|-------|
| **Clusters** | Number of attack strategy clusters | 4 | 1-8 |
| **Generations** | Number of evolution cycles | 5 | 1-10 |
| **Event Delay** | Time between events (ms) | 600 | 100-3000 |
| **Success Rate** | Percentage of successful attacks | 65% | 0-100% |

### Example Configurations

**Fast Demo (for presentations)**
```
Clusters: 3
Generations: 3
Event Delay: 300ms
Success Rate: 70%
Duration: ~30 seconds
```

**Detailed Demo (for deep dives)**
```
Clusters: 6
Generations: 7
Event Delay: 800ms
Success Rate: 60%
Duration: ~3 minutes
```

**Stress Test (performance testing)**
```
Clusters: 8
Generations: 10
Event Delay: 100ms
Success Rate: 50%
Duration: ~1 minute, 200+ nodes
```

---

## 📊 What Gets Simulated

### WebSocket Events (All 6 Types)

1. **`cluster_add`** - Creates attack strategy clusters
   - Positioned in a circle around center
   - Each has a name and color
   - Examples: "Prompt Injection", "Role Play", "Encoding Bypass"

2. **`node_add`** - Creates individual attack nodes
   - Assigned to clusters
   - Has parent nodes (except first generation)
   - Random attack type

3. **`node_update`** - Updates attack status
   - `pending` → `running` → `success`/`failure`
   - Includes LLM transcripts
   - Success scores (0-1)

4. **`evolution_link_add`** - Shows genetic relationships
   - Connects parent nodes to children
   - Types: mutation, crossover, selection
   - Animated purple lines

5. **`agent_mapping_update`** - Sets target agent info
   - Agent name: "GPT-4 Financial Assistant"
   - Capabilities listed
   - Sent at start

6. **`attack_complete`** - Finishes simulation
   - Total statistics
   - Best ASR (Attack Success Rate)
   - Triggers results modal

### Mock API Responses

- **`POST /attack/start`** → Returns attack ID and WebSocket URL
- **`GET /attack/{id}/status`** → Returns progress and metrics
- **`GET /attack/{id}/results`** → Returns complete results with vulnerabilities

All API calls are intercepted and return realistic mock data instantly.

---

## 🎯 Demo Flow Timeline

Here's what happens during a typical 5-generation demo:

```
0:00s  - Click "Start Attack"
0:00s  - API returns mock attack ID
0:00s  - WebSocket "connects" (mock)
0:01s  - Agent mapping sent
0:02s  - Cluster 0 created (Prompt Injection)
0:03s  - Cluster 1 created (Role Play)
0:04s  - Cluster 2 created (Encoding Bypass)
0:05s  - Cluster 3 created (System Leak)

--- GENERATION 0 (Initial Population) ---
0:06s  - Node 0 added (pending)
0:07s  - Node 0 → running
0:09s  - Node 0 → success (ASR: 0.82)
0:10s  - Node 1 added (pending)
0:11s  - Node 1 → running
0:13s  - Node 1 → failure (ASR: 0.15)
... (8-12 nodes per generation)

--- GENERATION 1 (First Evolution) ---
0:30s  - Evolution link: Node 0 → Node 8 (mutation)
0:31s  - Node 8 added (pending)
0:32s  - Node 8 → running
0:34s  - Node 8 → success (ASR: 0.87) ⬆️ Better than parent!
... (5-10 new nodes)

--- GENERATIONS 2-4 (Continued Evolution) ---
... (More nodes, more evolution links)

--- COMPLETION ---
1:30s  - Attack complete event
1:30s  - Results modal appears
1:30s  - Final stats: 32 attacks, 21 successful, 65.6% ASR
```

---

## 🔍 Understanding the Visualization

### Node Colors (Status)

- **⚪ Gray** - Pending (waiting to execute)
- **🟡 Yellow** - Running (actively attacking)
- **🟢 Green** - Success (attack worked!)
- **🔴 Red** - Failure (attack blocked)

### Edge Colors (Relationships)

- **Gray** - Parent-child relationship
- **Purple (animated)** - Evolution link (mutation/crossover)

### Cluster Layout

- Clusters arranged in a **circle** around center
- Nodes arranged in **sub-circles** within each cluster
- Force-directed layout for natural spacing

---

## 💡 Tips for Great Demos

### For Hackathon Judges

1. **Start with 3 generations** for a quick demo
2. **Use 600ms event delay** (not too fast, not too slow)
3. **Explain as it runs**:
   - "Each node is an attack attempt"
   - "Green means the agent was jailbroken"
   - "Purple lines show genetic evolution"
4. **Click a successful node** to show transcript
5. **Show results modal** with vulnerability summary

### For Technical Deep Dives

1. **Use 7+ generations** to show long-term evolution
2. **Configure 70%+ success rate** to demonstrate improvement
3. **Open DevTools** to show WebSocket events
4. **Explain the genetic algorithm**:
   - Selection (best attacks become parents)
   - Mutation (random variations)
   - Crossover (combining strategies)

### For Performance Testing

1. **Max out parameters**: 8 clusters, 10 generations
2. **Set 100ms delay** for rapid events
3. **Watch FPS counter** (should stay >30 FPS)
4. **Check memory usage** (should stay <200MB)
5. **Verify all animations** work smoothly

---

## 🐛 Troubleshooting

### Demo mode not working?

1. **Check .env.local exists**:
   ```bash
   cat .env.local
   ```
   Should contain `VITE_MOCK_MODE=true`

2. **Check console** for mock messages:
   ```
   [MockWebSocket] Connected
   [API] Mock mode: startAttack
   ```

3. **Verify button** shows "DEMO MODE" (green) not "Real Mode" (gray)

### No events appearing?

1. **Click the config panel "Start Attack" button**
2. **Check console** for errors
3. **Try refreshing** the page
4. **Disable then re-enable** demo mode

### Simulation too fast/slow?

1. **Click settings icon** on DEMO MODE button
2. **Adjust "Event Delay"**:
   - 100ms = very fast (stress test)
   - 600ms = good for demos
   - 1500ms = slow and clear
3. **Settings auto-save** (persists across refreshes)

---

## 🔄 Switching to Real Backend

When your backend is ready:

1. **Click "DEMO MODE" button** to toggle off
   - Button turns gray = "Real Mode"

2. **Update .env.local**:
   ```bash
   VITE_MOCK_MODE=false
   VITE_API_BASE_URL=http://your-backend:8000
   VITE_WS_BASE_URL=ws://your-backend:8000
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

The UI will now connect to your real backend!

---

## 📁 Demo Mode Architecture

### Files

```
src/
├── utils/mockWebSocket.ts       # Mock WebSocket implementation
├── hooks/useMockMode.ts          # Mock mode state management
├── components/MockModeToggle.tsx # UI toggle component
└── api/client.ts                 # API client with mock support

frontend/redteam-dashboard/
├── run-demo.sh                   # Demo launcher script
├── .env.demo                     # Demo environment template
└── DEMO_README.md               # This file
```

### How It Works

1. **Environment Check**: `isMockModeFromEnv()` checks `VITE_MOCK_MODE`
2. **API Interception**: `apiClient.startAttack()` returns mock data
3. **WebSocket Mock**: `MockWebSocket` class simulates events
4. **Event Generation**: Follows exact same spec as real backend
5. **State Updates**: Uses same stores as real mode

**Zero code changes** needed to switch between mock and real!

---

## 🎓 Educational Use

Great for teaching:

- **Genetic algorithms** - Watch evolution in action
- **Red-teaming** - See different attack strategies
- **WebSocket communication** - Real-time event handling
- **Graph visualization** - Force-directed layouts
- **React performance** - Handling 200+ nodes smoothly

---

## 📝 Next Steps

1. ✅ Run the demo: `./run-demo.sh`
2. ✅ Experiment with different configurations
3. ✅ Click nodes to see attack transcripts
4. ✅ Watch the evolution over multiple generations
5. ✅ Present to judges/teammates!

---

## 🎯 Demo Checklist for Hackathon

- [ ] Run `./run-demo.sh` successfully
- [ ] Verify DEMO MODE button is green
- [ ] Configure 4 clusters, 5 generations
- [ ] Start a simulated attack
- [ ] Watch all 4 clusters populate with nodes
- [ ] See nodes change status: pending → running → success/failure
- [ ] Observe purple evolution links between generations
- [ ] Click a successful node to view transcript
- [ ] Wait for completion modal
- [ ] Review vulnerability summary
- [ ] Practice explaining the visualization
- [ ] Prepare to switch to real backend for bonus points

**Good luck with your demo! 🚀**
