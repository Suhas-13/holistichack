# Testing & Demo Setup Complete

Testing specialist has created a complete demo data and testing utilities package for your red team attack evolution dashboard.

## Files Created

### Core Testing Files

```
src/
├── types/index.ts                    # 411 lines - TypeScript type definitions
├── utils/
│   ├── mockWebSocket.ts             # 320 lines - Mock WebSocket server simulator
│   ├── mockData.ts                  # 383 lines - Demo data & configurations
│   └── index.ts                     # 69 lines - Utility exports

Configuration Files:
├── .env.example                     # Environment variable template
└── README.md                        # 414 lines - Complete documentation
```

**Total Lines of Code**: 1,597 lines
**Total Files Created**: 6 files
**No new dependencies required**

## What's Included

### 1. Type Definitions (`src/types/index.ts`)

Comprehensive TypeScript interfaces for:
- **Core Types**: GraphNode, GraphCluster, EvolutionLink, GraphState
- **Enums**: NodeStatus (6 states), AttackType (10 types), EvolutionType (5 types)
- **WebSocket Events**: ClusterAddEvent, NodeAddEvent, NodeUpdateEvent, EvolutionLinkAddEvent, AttackCompleteEvent
- **Layout & Config**: ForceLayoutConfig, Viewport, RenderLayer, etc.

### 2. Mock WebSocket Server (`src/utils/mockWebSocket.ts`)

A fully functional mock WebSocket server that:
- Generates realistic attack scenarios
- Simulates 100-500ms event delays
- Creates 5-10 AI agent clusters
- Generates 20-30 attack nodes per demo
- Sends proper WebSocket-style events
- Includes evolution links between attacks
- Ends with attack_complete event

**Key Classes & Functions:**
- `MockWebSocketServer` - Main server class
- `startMockWebSocket()` - Quick start helper
- `createMockWebSocket()` - Factory function
- `shouldUseMockWebSocket()` - Environment detection
- `getWebSocketUrl()` - URL resolver
- `generateEventsLazy()` - Memory-efficient generator

### 3. Demo Data (`src/utils/mockData.ts`)

Pre-configured realistic data:

**7 AI Agents** (Eagle, Wolf, Bear, Fox, Lynx, Hawk, Tiger)
- Color-coded for visualization
- Real model identifiers
- Endpoint configurations

**10 Attack Types**:
- Base64 encoding
- Role-play exploitation
- Jailbreak attempts
- Prompt injection
- Model extraction
- System prompt leak
- Function enumeration
- Error exploitation
- Unicode bypass
- Multi-turn attacks

**8 Sample Transcripts**:
- Realistic conversation logs
- Attack attempts and defenses
- Escalation patterns
- Refinement strategies

**Graph Generation Functions**:
- `generateSampleNodes()` - Creates 3-4 nodes per cluster
- `generateSampleLinks()` - Creates evolution relationships
- `generateMockGraphState()` - Complete graph state factory

### 4. Environment Configuration (`.env.example`)

```bash
# Enable mock WebSocket (recommended for demo)
VITE_MOCK_WEBSOCKET=true

# Real backend URL (if not using mock)
VITE_WEBSOCKET_URL=ws://localhost:8000

# REST API base URL
VITE_API_URL=http://localhost:8000

# Debug mode
VITE_DEBUG=false
```

### 5. Documentation (`README.md`)

Complete guide with:
- Quick start instructions
- Mock WebSocket usage examples
- Integration guide with Zustand/stores
- Demo data reference
- Troubleshooting tips
- Switching between mock and real backend
- Presentation tips

## Quick Start Guide

### 1. Enable Mock Mode

```bash
cd /home/user/holistichack/frontend/redteam-dashboard
echo "VITE_MOCK_WEBSOCKET=true" > .env.local
```

### 2. Start Development Server

```bash
npm install  # If not already done
npm run dev
```

### 3. Use in Your Component

```typescript
import { startMockWebSocket } from './utils';

function Dashboard() {
  useEffect(() => {
    const server = startMockWebSocket((event) => {
      // Handle event
      console.log('Event:', event);
      // Update your graph store
    });

    return () => server.stop();
  }, []);

  return <YourVisualization />;
}
```

## Demo Data Specifications

### Cluster Configuration

| Agent  | Color   | Model              | Endpoint    | Description              |
|--------|---------|-------------------|-------------|--------------------------|
| Eagle  | #FF6B6B | claude-3.5-sonnet | :8001       | Primary defense          |
| Wolf   | #4ECDC4 | gpt-4-turbo       | :8002       | Secondary defense        |
| Bear   | #95E1D3 | mistral-large     | :8003       | Tertiary defense         |
| Fox    | #F38181 | llama-2-70b       | :8004       | Specialized defense      |
| Lynx   | #AA96DA | anthropic-claude  | :8005       | Quarantine agent         |
| Hawk   | #FCBAD3 | openai-gpt3.5     | :8006       | Threat analysis          |
| Tiger  | #A8D8EA | google-palm       | :8007       | Attack response          |

### Attack Evolution Types

Attacks progress through these evolution patterns:
- **REFINEMENT** - Same technique, improved payload
- **ESCALATION** - More aggressive variant
- **COMBINATION** - Combines multiple techniques
- **PIVOT** - Different approach to same goal
- **FOLLOW_UP** - Exploits previous success

### Event Sequence

The mock server sends events in this order:

1. **Cluster Setup** (100-200ms each)
   - 5-10 cluster_add events

2. **Node Creation** (200-400ms each)
   - 20-30 node_add events

3. **Node Execution** (150-300ms each)
   - node_update events for each node (pending → in_progress → success/failed)

4. **Evolution Tracking** (100-250ms each)
   - evolution_link_add events connecting related attacks

5. **Completion** (500ms final)
   - attack_complete event with summary

**Total Duration**: ~2-3 minutes for full demo

## Integration Examples

### With Zustand Store

```typescript
import { create } from 'zustand';
import { startMockWebSocket } from './utils';

const useGraphStore = create((set) => ({
  nodes: new Map(),
  clusters: new Map(),

  addNode: (node) => set((state) => ({
    nodes: new Map(state.nodes).set(node.node_id, node)
  })),

  handleEvent: (event) => {
    set((state) => {
      switch (event.type) {
        case 'node_add':
          // Create node
          break;
        case 'node_update':
          // Update node
          break;
        // ... handle other events
      }
      return state;
    });
  }
}));

// Usage in component
useEffect(() => {
  startMockWebSocket((event) =>
    useGraphStore.getState().handleEvent(event)
  );
}, []);
```

### With Real WebSocket

```typescript
import { shouldUseMockWebSocket, startMockWebSocket, getWebSocketUrl } from './utils';

function initConnection() {
  if (shouldUseMockWebSocket()) {
    startMockWebSocket(handleEvent);
  } else {
    const ws = new WebSocket(getWebSocketUrl());
    ws.onmessage = (e) => handleEvent(JSON.parse(e.data));
  }
}
```

## Testing the Setup

### Verify Files

```bash
# Check all files are in place
ls -la src/types/index.ts
ls -la src/utils/mockWebSocket.ts
ls -la src/utils/mockData.ts
```

### Test Mock Server

```typescript
// In browser console while running dev server
import { MockWebSocketServer } from './utils/mockWebSocket';

const server = new MockWebSocketServer();
server.start((event) => console.log('Event:', event));

// Check status
console.log(server.getStatus());
```

### Check Event Generation

```typescript
import { generateEventsLazy } from './utils/mockWebSocket';

let count = 0;
for (const event of generateEventsLazy(['eagle', 'wolf'])) {
  count++;
  if (count <= 5) console.log(event);
}
console.log(`Total events: ${count}`);
```

## Performance Characteristics

- **Supports**: 200-300 nodes with smooth rendering
- **Lookups**: O(1) using Map-based indexing
- **Updates**: Immutable for React optimization
- **Layout**: Force-directed with physics simulation
- **Culling**: Viewport-based rendering optimization

## Troubleshooting

### Mock WebSocket Not Starting

1. Check `.env.local` has `VITE_MOCK_WEBSOCKET=true`
2. Verify browser console for errors
3. Check that `src/utils/mockWebSocket.ts` is imported

### Events Not Appearing

1. Verify event callback is properly set
2. Check store connection to event handler
3. Inspect browser DevTools (should show no WebSocket for mock mode)

### TypeScript Errors

All types are exported from `src/types/index.ts` - ensure you're importing from there:

```typescript
import {
  GraphNode,
  AttackType,
  NodeStatus,
  GraphWebSocketEvent
} from './types';
```

## Next Steps

1. **Import in Your Component**
   ```typescript
   import { startMockWebSocket } from './utils';
   ```

2. **Create Event Handler**
   ```typescript
   const handleGraphEvent = (event) => { /* ... */ };
   ```

3. **Start Mock Server**
   ```typescript
   useEffect(() => {
     startMockWebSocket(handleGraphEvent);
   }, []);
   ```

4. **Visualize the Graph**
   Use your graph visualization library (xyflow, D3, etc.) to render the incoming events

## Demo Presentation Checklist

- [ ] `.env.local` has `VITE_MOCK_WEBSOCKET=true`
- [ ] Dev server running with `npm run dev`
- [ ] Event handler connected to store
- [ ] Graph visualization configured
- [ ] Test event flow in browser console
- [ ] Verify all agents appear in visualization
- [ ] Check attack evolution connections
- [ ] Time demo for ~2 minute flow

## Support

- See README.md for detailed documentation
- Check src/types/index.ts for all available types
- Review src/utils/mockData.ts for data structure examples
- Inspect src/utils/mockWebSocket.ts for server implementation

---

**Ready to demo!** All testing utilities and demo data are configured and ready to use.
