# WebSocket Management System

## Overview

Production-ready WebSocket management system for real-time graph visualization with automatic reconnection, heartbeat monitoring, and comprehensive state management.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     WebSocket System                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐      ┌─────────────────────────────┐   │
│  │  useWebSocket  │─────>│  WebSocket Connection       │   │
│  │  Hook          │      │  - Auto reconnect           │   │
│  └────────────────┘      │  - Exponential backoff      │   │
│          │               │  - Heartbeat (30s)          │   │
│          │               └─────────────────────────────┘   │
│          │                                                   │
│          v                                                   │
│  ┌────────────────┐      ┌─────────────────────────────┐   │
│  │ WebSocket      │─────>│  Event Router               │   │
│  │ Handler        │      │  - cluster_add              │   │
│  └────────────────┘      │  - node_add                 │   │
│          │               │  - node_update              │   │
│          │               │  - evolution_link_add       │   │
│          │               │  - agent_mapping_update     │   │
│          │               │  - attack_complete          │   │
│          v               └─────────────────────────────┘   │
│  ┌────────────────┐                                         │
│  │ Zustand Stores │                                         │
│  │ - graphStore   │ - Manages nodes, clusters, links       │
│  │ - wsStore      │ - Connection state & stats             │
│  │ - attackStore  │ - Attack config & agent mapping        │
│  └────────────────┘                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

### Core Files

1. **`src/types/graph.ts`** - Type definitions for graph data and WebSocket events
2. **`src/store/graphStore.ts`** - Zustand store for graph data (nodes, clusters, links)
3. **`src/store/websocketStore.ts`** - Zustand store for WebSocket connection state
4. **`src/store/attackStore.ts`** - Zustand store for attack configuration
5. **`src/hooks/useWebSocket.ts`** - Main WebSocket connection hook
6. **`src/utils/websocketHandler.ts`** - Event processing and routing
7. **`src/utils/graphTransforms.ts`** - Transform graph data to ReactFlow format
8. **`src/examples/WebSocketExample.tsx`** - Complete usage examples

### Index Files

- `src/hooks/index.ts`
- `src/store/index.ts`
- `src/utils/index.ts` (updated)
- `src/types/index.ts` (updated)

## Quick Start

### Basic Usage

```tsx
import { useWebSocket, useWebSocketStatus } from '@/hooks/useWebSocket';

function App() {
  // Connect to WebSocket
  const { isConnected } = useWebSocket();

  // Get connection status
  const { status, error } = useWebSocketStatus();

  return (
    <div>
      <div>Status: {status}</div>
      {isConnected && <div>Receiving real-time updates!</div>}
    </div>
  );
}
```

### Advanced Usage

```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

function Dashboard() {
  const { connect, disconnect, sendMessage, reconnect } = useWebSocket({
    autoReconnect: true,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    debug: true,

    onOpen: () => {
      console.log('Connected!');
      sendMessage({ type: 'subscribe', channels: ['attacks'] });
    },

    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  return (
    <div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      <button onClick={reconnect}>Reconnect</button>
    </div>
  );
}
```

## WebSocket Events

### Incoming Events

The system handles the following WebSocket event types:

#### 1. `cluster_add`

Add a new cluster (agent) to the graph.

```json
{
  "type": "cluster_add",
  "data": {
    "cluster_id": "eagle",
    "name": "Eagle Agent",
    "position_hint": { "x": 200, "y": 300 },
    "color": "#FF6B6B",
    "agent_type": "langchain"
  }
}
```

#### 2. `node_add`

Add a new attack node to the graph.

```json
{
  "type": "node_add",
  "data": {
    "node_id": "node_eagle_1",
    "cluster_id": "eagle",
    "parent_ids": [],
    "attack_type": "jailbreak",
    "status": "in_progress",
    "timestamp": 1700000000000
  }
}
```

#### 3. `node_update`

Update an existing node with results.

```json
{
  "type": "node_update",
  "data": {
    "node_id": "node_eagle_1",
    "status": "success",
    "model_id": "gpt-3.5-turbo",
    "llm_summary": "Successfully extracted system prompt",
    "full_transcript": ["User: ...", "Agent: ..."],
    "success_score": 100
  }
}
```

#### 4. `evolution_link_add`

Add an evolution link between nodes.

```json
{
  "type": "evolution_link_add",
  "data": {
    "link_id": "link_1_2",
    "source_node_ids": ["node_eagle_1"],
    "target_node_id": "node_eagle_2",
    "evolution_type": "refinement",
    "description": "Refined payload with context"
  }
}
```

#### 5. `agent_mapping_update`

Update agent to cluster mapping.

```json
{
  "type": "agent_mapping_update",
  "data": {
    "agent_name": "Eagle",
    "cluster_id": "eagle",
    "metadata": {
      "model": "gpt-3.5-turbo",
      "framework": "langchain"
    }
  }
}
```

#### 6. `attack_complete`

Notification when an attack run completes.

```json
{
  "type": "attack_complete",
  "data": {
    "attack_id": "attack_001",
    "status": "success",
    "total_attempts": 100,
    "successful_attacks": 42,
    "timestamp": 1700000000000
  }
}
```

### Outgoing Events

#### Heartbeat (Automatic)

The system automatically sends heartbeat pings every 30 seconds:

```json
{
  "type": "ping",
  "timestamp": 1700000000000
}
```

#### Custom Messages

Send custom messages using the `sendMessage` function:

```tsx
const { sendMessage } = useWebSocket();

sendMessage({
  type: 'subscribe',
  channels: ['attacks', 'evolution']
});

sendMessage({
  type: 'start_attack',
  data: {
    attack_id: 'attack_001',
    targets: ['agent_1', 'agent_2']
  }
});
```

## State Management

### Graph Store

Manages all graph data with O(1) lookups using Maps.

```tsx
import { useGraphStore } from '@/store/graphStore';

function GraphComponent() {
  // Get data
  const nodes = useGraphStore((state) => state.nodes);
  const clusters = useGraphStore((state) => state.clusters);
  const links = useGraphStore((state) => state.links);

  // Get selected node
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);

  // Actions
  const setSelectedNode = useGraphStore((state) => state.setSelectedNode);

  // Query helpers
  const getClusterNodes = useGraphStore((state) => state.getClusterNodes);
  const clusterNodes = getClusterNodes('eagle');

  return <div>...</div>;
}
```

### WebSocket Store

Manages connection state and statistics.

```tsx
import { useWebSocketStore } from '@/store/websocketStore';

function StatusComponent() {
  const status = useWebSocketStore((state) => state.status);
  const error = useWebSocketStore((state) => state.error);
  const reconnectAttempts = useWebSocketStore((state) => state.reconnectAttempts);
  const messagesReceived = useWebSocketStore((state) => state.messagesReceived);

  return (
    <div>
      <div>Status: {status}</div>
      <div>Messages: {messagesReceived}</div>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### Attack Store

Manages attack configuration and agent mapping.

```tsx
import { useAttackStore } from '@/store/attackStore';

function ConfigComponent() {
  const websocketUrl = useAttackStore((state) => state.websocketUrl);
  const setWebSocketUrl = useAttackStore((state) => state.setWebSocketUrl);

  const agentMapping = useAttackStore((state) => state.agentMapping);

  return <div>...</div>;
}
```

## Graph Transforms

Transform graph data to ReactFlow format for visualization.

```tsx
import { transformGraphToReactFlow } from '@/utils/graphTransforms';
import { useGraphStore } from '@/store/graphStore';
import ReactFlow from 'reactflow';

function GraphCanvas() {
  const nodes = useGraphStore((state) => state.nodes);
  const clusters = useGraphStore((state) => state.clusters);
  const links = useGraphStore((state) => state.links);
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);

  // Transform to ReactFlow format
  const { nodes: reactFlowNodes, edges: reactFlowEdges } = transformGraphToReactFlow(
    nodes,
    clusters,
    links,
    selectedNodeId,
    null // hoveredNodeId
  );

  return (
    <ReactFlow
      nodes={reactFlowNodes}
      edges={reactFlowEdges}
      // ... other props
    />
  );
}
```

## Features

### 1. Automatic Reconnection

- Exponential backoff with jitter
- Configurable max attempts (default: 5)
- Automatic retry on connection loss

```tsx
useWebSocket({
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,      // Initial delay: 1s
  maxReconnectDelay: 30000,  // Max delay: 30s
});
```

### 2. Heartbeat Monitoring

- Automatic ping every 30 seconds
- Keeps connection alive
- Detects connection issues

```tsx
useWebSocket({
  heartbeatInterval: 30000, // 30 seconds
});
```

### 3. Error Handling

- Automatic error recovery
- Error state tracking
- Custom error handlers

```tsx
useWebSocket({
  onError: (error) => {
    console.error('WebSocket error:', error);
    // Custom error handling
  },
});
```

### 4. Connection State

Track connection status in real-time:

- `disconnected` - Not connected
- `connecting` - Attempting to connect
- `connected` - Successfully connected
- `reconnecting` - Attempting to reconnect
- `error` - Connection error

### 5. Statistics Tracking

- Total messages received
- Last message timestamp
- Connection timestamp
- Reconnection attempts

## Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_WS_URL=ws://localhost:8000/ws
```

### Runtime Configuration

```tsx
import { useAttackStore } from '@/store/attackStore';

// Update WebSocket URL at runtime
const setWebSocketUrl = useAttackStore((state) => state.setWebSocketUrl);
setWebSocketUrl('ws://production-server:8000/ws');
```

## Best Practices

### 1. Connection Management

```tsx
// ✅ Good - Let the hook manage connection lifecycle
function App() {
  useWebSocket(); // Connects on mount, disconnects on unmount
  return <div>...</div>;
}

// ❌ Bad - Manual connection management without cleanup
function App() {
  const ws = new WebSocket('ws://...');
  // No cleanup!
  return <div>...</div>;
}
```

### 2. Event Handling

```tsx
// ✅ Good - Use default handler
useWebSocket(); // Uses handleWebSocketMessage internally

// ✅ Good - Custom handler with fallback
useWebSocket({
  onMessage: (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'custom') {
      handleCustomEvent(data);
    } else {
      handleWebSocketMessage(event);
    }
  },
});
```

### 3. State Access

```tsx
// ✅ Good - Selective state subscription
const nodes = useGraphStore((state) => state.nodes);

// ❌ Bad - Subscribe to entire state
const state = useGraphStore();
```

### 4. Cleanup

```tsx
// ✅ Good - Automatic cleanup with hook
useEffect(() => {
  const { disconnect } = useWebSocket();
  return () => disconnect(); // Cleanup on unmount
}, []);
```

## Troubleshooting

### Connection Issues

```tsx
const { status, error, reconnectAttempts } = useWebSocketStatus();

if (status === 'error') {
  console.error('Connection error:', error);
  console.log('Reconnect attempts:', reconnectAttempts);
}
```

### Enable Debug Logging

```tsx
useWebSocket({
  debug: true, // Enable detailed logging
});
```

### Manual Reconnection

```tsx
const { reconnect } = useWebSocket();

// Force reconnection
<button onClick={reconnect}>Reconnect</button>
```

## Performance

### Batch Processing

For high-frequency events, use the batch processor:

```tsx
import { WebSocketBatchProcessor } from '@/utils/websocketHandler';

const processor = new WebSocketBatchProcessor(100); // 100ms batch interval

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  processor.enqueue(data); // Batches events
};
```

### Memory Management

- Automatic cleanup on unmount
- No memory leaks
- Proper event listener removal

## Examples

See `src/examples/WebSocketExample.tsx` for complete examples:

- Basic connection
- Advanced configuration
- Custom message handlers
- ReactFlow integration
- Programmatic control

## Type Safety

All types are fully typed with TypeScript:

```tsx
import type {
  GraphNode,
  GraphCluster,
  EvolutionLink,
  GraphWebSocketEvent,
  NodeStatus,
  AttackType,
} from '@/types/graph';
```

## Testing

```tsx
import { renderHook } from '@testing-library/react';
import { useWebSocket } from '@/hooks/useWebSocket';

test('connects to WebSocket', () => {
  const { result } = renderHook(() => useWebSocket());
  expect(result.current.isConnected).toBe(false);
});
```

## License

MIT
