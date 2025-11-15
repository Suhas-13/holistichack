# WebSocket System - Quick Start

## 🚀 Installation (1 minute)

```bash
cd /home/user/holistichack/frontend/redteam-dashboard
npm install zustand immer reactflow
```

## ⚙️ Configuration (30 seconds)

Create `.env` file:

```env
VITE_WS_URL=ws://localhost:8000/ws
```

## 💻 Basic Usage (2 minutes)

### Step 1: Connect to WebSocket

```tsx
// src/App.tsx
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  useWebSocket(); // That's it! Auto-connects & manages connection

  return <YourApp />;
}
```

### Step 2: Display Connection Status

```tsx
import { useWebSocketStatus } from './hooks/useWebSocket';

function StatusBar() {
  const { status, isConnected, error } = useWebSocketStatus();

  return (
    <div>
      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      {error && <span>Error: {error}</span>}
    </div>
  );
}
```

### Step 3: Use Graph Data

```tsx
import { useGraphStore } from './store/graphStore';

function GraphStats() {
  const nodes = useGraphStore((state) => state.nodes);
  const clusters = useGraphStore((state) => state.clusters);

  return (
    <div>
      <div>Nodes: {nodes.size}</div>
      <div>Clusters: {clusters.size}</div>
    </div>
  );
}
```

## 📊 Visualization with ReactFlow (5 minutes)

```tsx
import { useGraphStore } from './store/graphStore';
import { transformGraphToReactFlow } from './utils/graphTransforms';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';

function GraphCanvas() {
  const nodes = useGraphStore((state) => state.nodes);
  const clusters = useGraphStore((state) => state.clusters);
  const links = useGraphStore((state) => state.links);
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);

  const { nodes: rfNodes, edges: rfEdges } = transformGraphToReactFlow(
    nodes,
    clusters,
    links,
    selectedNodeId
  );

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        fitView
      />
    </div>
  );
}
```

## 🎮 Manual Controls (Optional)

```tsx
import { useWebSocket } from './hooks/useWebSocket';

function Controls() {
  const { connect, disconnect, reconnect, isConnected } = useWebSocket();

  return (
    <div>
      <button onClick={connect} disabled={isConnected}>
        Connect
      </button>
      <button onClick={disconnect} disabled={!isConnected}>
        Disconnect
      </button>
      <button onClick={reconnect}>
        Reconnect
      </button>
    </div>
  );
}
```

## 📡 WebSocket Event Format

Your backend should send events in this format:

### Add Cluster (Agent)

```json
{
  "type": "cluster_add",
  "data": {
    "cluster_id": "eagle",
    "name": "Eagle Agent",
    "position_hint": { "x": 200, "y": 300 },
    "color": "#FF6B6B"
  }
}
```

### Add Attack Node

```json
{
  "type": "node_add",
  "data": {
    "node_id": "node_1",
    "cluster_id": "eagle",
    "parent_ids": [],
    "attack_type": "jailbreak",
    "status": "in_progress"
  }
}
```

### Update Node Results

```json
{
  "type": "node_update",
  "data": {
    "node_id": "node_1",
    "status": "success",
    "model_id": "gpt-3.5-turbo",
    "llm_summary": "Successfully extracted system prompt"
  }
}
```

## 🔧 Troubleshooting

### Can't Connect?

1. Check WebSocket URL:
   ```tsx
   import { useAttackStore } from './store/attackStore';
   console.log(useAttackStore.getState().websocketUrl);
   ```

2. Enable debug mode:
   ```tsx
   useWebSocket({ debug: true });
   ```

3. Check connection status:
   ```tsx
   const { status, error } = useWebSocketStatus();
   console.log('Status:', status, 'Error:', error);
   ```

### No Data Appearing?

1. Check if events are being received:
   ```tsx
   const { messagesReceived } = useWebSocketStatus();
   console.log('Messages received:', messagesReceived);
   ```

2. Verify event format matches spec

3. Check browser console for errors

## 📚 Full Documentation

- **Complete Guide:** See `WEBSOCKET_README.md`
- **Dependencies:** See `DEPENDENCIES.md`
- **Examples:** See `src/examples/WebSocketExample.tsx`
- **Summary:** See `IMPLEMENTATION_SUMMARY.md`

## 🎯 Key Files

```
src/
├── hooks/
│   └── useWebSocket.ts      👈 Main WebSocket hook
├── store/
│   ├── graphStore.ts        👈 Graph data
│   ├── websocketStore.ts    👈 Connection state
│   └── attackStore.ts       👈 Configuration
├── utils/
│   ├── websocketHandler.ts  👈 Event processing
│   └── graphTransforms.ts   👈 ReactFlow transforms
└── types/
    └── graph.ts             👈 Type definitions
```

## ✅ Features Checklist

- [x] Auto-connect on mount
- [x] Auto-reconnect with exponential backoff
- [x] Heartbeat every 30s
- [x] Error handling
- [x] Clean disconnect on unmount
- [x] TypeScript strict mode
- [x] Real-time graph updates
- [x] ReactFlow integration ready

## 🚨 Common Mistakes

❌ **Don't do this:**
```tsx
// Creating WebSocket manually
const ws = new WebSocket('ws://...');
```

✅ **Do this:**
```tsx
// Use the hook
useWebSocket();
```

---

❌ **Don't do this:**
```tsx
// Subscribing to entire store
const state = useGraphStore();
```

✅ **Do this:**
```tsx
// Select specific data
const nodes = useGraphStore((state) => state.nodes);
```

---

❌ **Don't do this:**
```tsx
// Manual connection without cleanup
useEffect(() => {
  const ws = new WebSocket('ws://...');
}, []); // No cleanup!
```

✅ **Do this:**
```tsx
// Hook handles everything
useWebSocket(); // Auto cleanup on unmount
```

## ⚡ Performance Tips

1. **Use selective subscriptions:**
   ```tsx
   // Good
   const nodeCount = useGraphStore((state) => state.nodes.size);

   // Bad
   const store = useGraphStore();
   const nodeCount = store.nodes.size;
   ```

2. **Batch updates for high-frequency events:**
   ```tsx
   import { WebSocketBatchProcessor } from './utils/websocketHandler';
   const processor = new WebSocketBatchProcessor(100);
   ```

3. **Memoize transforms:**
   ```tsx
   const { nodes, edges } = useMemo(
     () => transformGraphToReactFlow(nodes, clusters, links),
     [nodes, clusters, links]
   );
   ```

## 🎉 You're Ready!

Start your app and watch real-time updates flow in!

```bash
npm run dev
```

Visit: `http://localhost:5173`

---

**Need Help?** Check `WEBSOCKET_README.md` for detailed documentation.
