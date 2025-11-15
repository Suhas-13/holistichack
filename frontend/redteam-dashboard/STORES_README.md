# Zustand Stores - Red Team Dashboard

## Overview

All Zustand stores have been successfully created for the red-teaming dashboard. These stores use **Map-based data structures** for O(1) lookup performance and **Immer middleware** for immutable state updates.

---

## Store Files Created

All stores are located in: `/home/user/holistichack/frontend/redteam-dashboard/src/stores/`

### 1. **graphStore.ts** (297 lines)
**Purpose:** Manages graph state including nodes, edges, and clusters

**Features:**
- Map-based storage for O(1) lookups
- Indices for efficient queries (nodesByCluster, nodesByParent, linksBySource, linksByTarget)
- Cluster management with auto-generated colors
- Node lifecycle (add, update, remove)
- Edge lifecycle (add, remove)
- Cluster statistics tracking

**Key Actions:**
- `addCluster(cluster)` - Add a new cluster with auto-color generation
- `addNode(node)` - Add node with automatic indexing
- `updateNode(nodeId, updates)` - Update node and cluster stats
- `addEdge(link)` - Add edge between nodes
- `removeNode(nodeId)` - Remove node and cascade delete links
- `removeEdge(linkId)` - Remove specific edge

**Key Getters:**
- `getNode(nodeId)` - O(1) node lookup
- `getNodesByCluster(clusterId)` - Get all nodes in a cluster
- `getGraphData()` - Get all nodes and edges as arrays

**State:**
```typescript
{
  nodes: Map<string, GraphNode>,
  clusters: Map<string, GraphCluster>,
  links: Map<string, GraphEdge>,
  nodesByCluster: Map<string, Set<string>>,
  nodesByParent: Map<string, Set<string>>,
  linksBySource: Map<string, Set<string>>,
  linksByTarget: Map<string, Set<string>>,
  lastUpdateTimestamp: number,
  totalUpdates: number
}
```

---

### 2. **attackStore.ts** (156 lines)
**Purpose:** Manages attack configuration, status, and results

**Features:**
- Attack configuration persistence
- Attack lifecycle management (idle → running → completed/error)
- WebSocket URL configuration
- Results tracking

**Key Actions:**
- `setConfig(config)` - Update attack configuration
- `setWebSocketUrl(url)` - Set WebSocket connection URL
- `startAttack(attackId)` - Start new attack session
- `completeAttack(result)` - Mark attack as completed with results
- `failAttack(error)` - Handle attack failure
- `cancelAttack()` - Cancel running attack

**State:**
```typescript
{
  config: AttackConfig,
  websocketUrl: string,
  status: 'idle' | 'running' | 'completed' | 'error',
  currentAttackId: string | null,
  startTime: number | null,
  endTime: number | null,
  results: AttackResult | null,
  error: string | null
}
```

**Persistence:** Config and WebSocket URL are persisted to localStorage

---

### 3. **uiStore.ts** (196 lines)
**Purpose:** Manages UI state including panels, modals, and selections

**Features:**
- Node selection management
- Panel visibility (config, details, stats)
- Modal management (results, settings, help)
- View preferences (labels, animations, theme, zoom)
- localStorage persistence

**Key Actions:**
- **Selection:** `selectNode(nodeId)`, `clearSelection()`
- **Panels:** `toggleConfigPanel()`, `toggleDetailsPanel()`, `toggleStatsPanel()`
- **Modals:** `openResultsModal(nodeId)`, `closeResultsModal()`, `closeAllModals()`
- **View:** `setShowLabels(bool)`, `setShowAnimations(bool)`, `setTheme(theme)`, `setZoom(zoom)`

**State:**
```typescript
{
  selectedNodeId: string | null,
  configPanelOpen: boolean,
  detailsPanelOpen: boolean,
  statsPanelOpen: boolean,
  resultsModalOpen: boolean,
  settingsModalOpen: boolean,
  helpModalOpen: boolean,
  resultsNodeId: string | null,
  showLabels: boolean,
  showAnimations: boolean,
  theme: 'light' | 'dark' | 'system',
  zoom: number
}
```

**Persistence:** Panel states, view preferences, and theme are persisted

---

### 4. **websocketStore.ts** (108 lines)
**Purpose:** Manages WebSocket connection state and statistics

**Features:**
- Connection status tracking
- Reconnection attempt management
- Message statistics
- Error handling

**Key Actions:**
- `setStatus(status)` - Update connection status
- `setUrl(url)` - Set WebSocket URL
- `setError(error)` - Set error message
- `incrementReconnect()` - Track reconnection attempts
- `resetReconnect()` - Reset reconnection counter
- `incrementMessages()` - Track message count
- `setLastMessage(timestamp)` - Update last message time

**State:**
```typescript
{
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error',
  url: string | null,
  error: string | null,
  reconnectAttempts: number,
  maxReconnectAttempts: number,
  messagesReceived: number,
  lastMessageTimestamp: number | null,
  connectionTimestamp: number | null
}
```

---

### 5. **index.ts** (27 lines)
**Purpose:** Central export for all stores

**Exports:**
- `useGraphStore`
- `useAttackStore`
- `useUIStore`
- `useWebSocketStore`
- Type exports: `ConnectionStatus`, `AttackStatus`
- Utility: `resetAllStores()` - Reset all stores to initial state

**Usage:**
```typescript
import {
  useGraphStore,
  useAttackStore,
  useUIStore,
  useWebSocketStore,
  resetAllStores
} from './stores';
```

---

## Dependencies Installed

- **zustand** (v4.4.7) - State management library
- **immer** (latest) - Immutable state updates

---

## Architecture Highlights

### Map-Based Performance
All core data structures use `Map` for O(1) lookups:
- `nodes: Map<string, GraphNode>`
- `clusters: Map<string, GraphCluster>`
- `links: Map<string, GraphEdge>`

### Efficient Indexing
Multiple indices for fast queries:
- `nodesByCluster` - Group nodes by cluster
- `nodesByParent` - Find children of any node
- `linksBySource` - Find outgoing links
- `linksByTarget` - Find incoming links

### Immutable Updates
All stores use Immer middleware for safe state updates:
```typescript
set((state) => {
  state.nodes.set(nodeId, updatedNode); // Direct mutation, handled by Immer
  state.totalUpdates++;
});
```

### Type Safety
Full TypeScript coverage with strict types from `../types`

---

## Usage Examples

### Graph Store
```typescript
import { useGraphStore } from './stores';

function MyComponent() {
  const addNode = useGraphStore((state) => state.addNode);
  const nodes = useGraphStore((state) => state.nodes);
  const getNode = useGraphStore((state) => state.getNode);
  
  // Add a node
  addNode({
    node_id: 'node_1',
    cluster_id: 'eagle',
    parent_ids: [],
    attack_type: 'jailbreak',
    status: 'pending',
    timestamp: Date.now()
  });
  
  // Get node
  const node = getNode('node_1');
}
```

### Attack Store
```typescript
import { useAttackStore } from './stores';

function AttackPanel() {
  const status = useAttackStore((state) => state.status);
  const startAttack = useAttackStore((state) => state.startAttack);
  const results = useAttackStore((state) => state.results);
  
  const handleStart = () => {
    startAttack('attack_123');
  };
  
  return <div>Status: {status}</div>;
}
```

### UI Store
```typescript
import { useUIStore } from './stores';

function NodeDetailsPanel() {
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const isOpen = useUIStore((state) => state.detailsPanelOpen);
  const selectNode = useUIStore((state) => state.selectNode);
  
  return isOpen ? <div>Selected: {selectedNodeId}</div> : null;
}
```

### WebSocket Store
```typescript
import { useWebSocketStore } from './stores';

function ConnectionStatus() {
  const status = useWebSocketStore((state) => state.status);
  const error = useWebSocketStore((state) => state.error);
  const attempts = useWebSocketStore((state) => state.reconnectAttempts);
  
  return (
    <div>
      Status: {status}
      {error && <div>Error: {error}</div>}
      {attempts > 0 && <div>Reconnecting... (Attempt {attempts})</div>}
    </div>
  );
}
```

---

## Testing

Reset all stores for testing:
```typescript
import { resetAllStores } from './stores';

beforeEach(() => {
  resetAllStores();
});
```

---

## Production Ready

All stores are:
- ✅ Fully typed with TypeScript
- ✅ Using Map-based structures for performance
- ✅ Implementing immutable updates with Immer
- ✅ Following clean architecture principles
- ✅ Including comprehensive error handling
- ✅ Supporting localStorage persistence (where appropriate)
- ✅ Properly indexed for O(1) lookups

---

## File Summary

| Store | Lines | Purpose |
|-------|-------|---------|
| graphStore.ts | 297 | Graph data (nodes, edges, clusters) |
| attackStore.ts | 156 | Attack configuration and status |
| uiStore.ts | 196 | UI state (panels, modals, preferences) |
| websocketStore.ts | 108 | WebSocket connection management |
| index.ts | 27 | Central exports |
| **Total** | **784** | Complete state management system |
