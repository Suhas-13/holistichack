# Graph Visualization Components

A stunning, cyber-themed graph visualization system built with ReactFlow for visualizing red team attack evolution.

## Components

### GraphCanvas

The main ReactFlow container that orchestrates the entire graph visualization.

**Features:**
- Auto-layout with zoom/pan controls
- Dark theme with cyber aesthetics
- MiniMap for navigation
- Real-time updates from WebSocket
- Cluster backgrounds
- Status legend

**Usage:**
```tsx
import { GraphCanvas } from './components/graph';

function App() {
  return (
    <div className="w-screen h-screen">
      <GraphCanvas />
    </div>
  );
}
```

### AttackNode

Custom node component displaying individual attack attempts.

**Features:**
- Color-coded by status (pending, running, success, failed)
- Pulse animation for running attacks
- Glow effect for successful attacks
- Attack type icon and label
- Success score display
- Model ID badge (when extracted)
- Hover tooltip with node ID

**Status Colors:**
- `pending`: Gray
- `in_progress`: Cyan with pulse animation
- `success`: Green with glow effect
- `failed`: Red
- `partial`: Yellow
- `error`: Purple

**Props:**
```typescript
interface AttackNodeData extends GraphNode {
  label?: string;
}
```

### EvolutionEdge

Custom edge component showing attack evolution relationships.

**Features:**
- Animated gradient flow
- Dashed lines for specific evolution types
- Color-coded by evolution type
- Flowing particles animation
- Edge labels showing evolution type
- Arrow markers

**Evolution Types:**
- `refinement`: Cyan, solid line
- `escalation`: Red/Magenta, thick line
- `combination`: Purple, dashed line
- `pivot`: Yellow, dashed line
- `follow_up`: Green, solid line

**Props:**
```typescript
interface EvolutionEdgeData {
  evolution_type: EvolutionType;
  animated?: boolean;
  strength?: number;
  description?: string;
}
```

### ClusterBackground

Visual grouping component for clusters (AI agents being attacked).

**Features:**
- Glass morphism background
- Cluster name label
- Success/total attacks badge
- Animated gradient overlay
- Corner accents
- Floating particles for successful clusters

**Props:**
```typescript
interface ClusterBackgroundProps {
  cluster: GraphCluster;
  nodeLayouts: NodeLayout[];
  viewport: { x: number; y: number; zoom: number };
}
```

## State Management

### graphStore (Zustand)

Manages all graph data including nodes, edges, clusters, and relationships.

**Methods:**
```typescript
// Handle WebSocket events
handleEvent(event: GraphWebSocketEvent): void

// Node selection
selectNode(nodeId: string | null): void
hoverNode(nodeId: string | null): void

// Queries
getNodeDetail(nodeId: string): NodeDetail | null
queryNodes(filter: NodeFilter): GraphNode[]
getStats(): GraphStats

// Utilities
reset(): void
```

**Usage:**
```typescript
import { useGraphStore } from '@/stores/graphStore';

function MyComponent() {
  const { nodes, selectNode, getStats } = useGraphStore();
  const stats = getStats();

  return <div>Total nodes: {stats.total_nodes}</div>;
}
```

### uiStore (Zustand)

Manages UI state like viewport, selections, and preferences.

**State:**
```typescript
{
  viewport: { x, y, zoom }
  selectedNodeId: string | null
  hoveredNodeId: string | null
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean
  showMiniMap: boolean
  showControls: boolean
  showClusterBackgrounds: boolean
  animationsEnabled: boolean
  filterStatus: string[]
  filterAttackTypes: string[]
}
```

## WebSocket Integration

Connect to the backend WebSocket to receive real-time updates:

```typescript
import { useEffect } from 'react';
import { useGraphStore } from '@/stores/graphStore';

function useWebSocketConnection() {
  const handleEvent = useGraphStore(state => state.handleEvent);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/evolution');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleEvent(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, [handleEvent]);
}
```

## WebSocket Event Types

### cluster_add
```json
{
  "type": "cluster_add",
  "data": {
    "cluster_id": "eagle",
    "name": "Eagle Agent",
    "position_hint": { "x": 100, "y": 100 },
    "color": "#FF6B6B"
  }
}
```

### node_add
```json
{
  "type": "node_add",
  "data": {
    "node_id": "attack_001",
    "cluster_id": "eagle",
    "parent_ids": [],
    "attack_type": "jailbreak",
    "status": "pending",
    "timestamp": 1234567890
  }
}
```

### node_update
```json
{
  "type": "node_update",
  "data": {
    "node_id": "attack_001",
    "status": "success",
    "model_id": "gpt-3.5-turbo",
    "llm_summary": "Successfully extracted model information",
    "success_score": 85
  }
}
```

### evolution_link_add
```json
{
  "type": "evolution_link_add",
  "data": {
    "link_id": "link_001",
    "source_node_ids": ["attack_001"],
    "target_node_id": "attack_002",
    "evolution_type": "refinement",
    "description": "Refined payload based on previous success"
  }
}
```

## Styling

The components use a cyber-themed dark color palette:

**Colors:**
- Background: `#0a0e14` (void)
- Surface: `#111827`
- Elevated: `#1a1f2e`
- Accent Cyan: `#00d9ff`
- Accent Purple: `#a78bfa`
- Accent Magenta: `#ff006e`
- Accent Green: `#00ff88`

**Animations:**
All animations respect `prefers-reduced-motion` for accessibility.

## Performance

**Optimizations:**
- Memoized node and edge components
- Efficient Map-based data structures for O(1) lookups
- Virtualization-ready architecture
- Throttled graph updates
- Conditional rendering based on viewport

**Recommended Limits:**
- Nodes: 200-300 for smooth performance
- Edges: 500-800
- Clusters: 10-15

## Development

**Install dependencies:**
```bash
npm install
```

**Run dev server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

## Example Integration

```tsx
import React, { useEffect } from 'react';
import { GraphCanvas } from './components/graph';
import { useGraphStore } from './stores/graphStore';
import './styles/globals.css';

function App() {
  const handleEvent = useGraphStore(state => state.handleEvent);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/evolution');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleEvent(data);
    };

    return () => ws.close();
  }, [handleEvent]);

  return (
    <div className="w-screen h-screen bg-void">
      {/* Top Bar */}
      <header className="h-16 bg-surface border-b border-gray-700">
        {/* Your top bar content */}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel */}
        <aside className="w-80 bg-surface border-r border-gray-700">
          {/* Your left panel content */}
        </aside>

        {/* Graph Canvas */}
        <main className="flex-1">
          <GraphCanvas />
        </main>

        {/* Right Panel */}
        <aside className="w-96 bg-surface border-l border-gray-700">
          {/* Your right panel content */}
        </aside>
      </div>
    </div>
  );
}

export default App;
```

## License

MIT
