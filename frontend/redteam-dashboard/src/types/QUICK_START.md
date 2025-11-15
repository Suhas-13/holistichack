# Quick Start Guide - Type Definitions

Fast reference for common usage patterns.

## Import Everything

```typescript
import {
  // Graph types
  GraphState, GraphNode, GraphCluster, EvolutionLink,
  NodeStatus, AttackType, EvolutionType,
  NodeLayout, Position, Velocity,

  // WebSocket
  WebSocketEvent, ClusterAddEvent, NodeUpdateEvent,
  isNodeUpdateEvent, isNodeAddEvent,

  // API
  StartAttackRequest, AttackResults, AttackStatus
} from '@/types';
```

## Common Patterns

### Initialize Empty Graph State

```typescript
import { GraphState } from '@/types';

const initialState: GraphState = {
  nodes: new Map(),
  clusters: new Map(),
  links: new Map(),
  nodesByCluster: new Map(),
  nodesByParent: new Map(),
  linksBySource: new Map(),
  linksByTarget: new Map(),
  layout: new Map(),
  selectedNodeId: null,
  hoveredNodeId: null,
  lastUpdateTimestamp: Date.now(),
  totalUpdates: 0
};
```

### Create a Node

```typescript
import { GraphNode, AttackType, NodeStatus } from '@/types';

const node: GraphNode = {
  node_id: 'node_eagle_001',
  cluster_id: 'eagle',
  parent_ids: [],
  attack_type: AttackType.BASE64_ENCODING,
  status: NodeStatus.IN_PROGRESS,
  timestamp: Date.now()
};
```

### Create a Cluster

```typescript
import { GraphCluster } from '@/types';

const cluster: GraphCluster = {
  cluster_id: 'eagle',
  name: 'Eagle Agent',
  position_hint: { x: 200, y: 300 },
  color: '#FF6B6B',
  collapsed: false,
  visible: true
};
```

### Add Node to State (Immutable)

```typescript
import { GraphState, GraphNode } from '@/types';

function addNode(state: GraphState, node: GraphNode): GraphState {
  // Clone nodes Map
  const newNodes = new Map(state.nodes);
  newNodes.set(node.node_id, node);

  // Update nodesByCluster index
  const newNodesByCluster = new Map(state.nodesByCluster);
  const clusterNodeIds = new Set(newNodesByCluster.get(node.cluster_id) || []);
  clusterNodeIds.add(node.node_id);
  newNodesByCluster.set(node.cluster_id, clusterNodeIds);

  // Update nodesByParent index
  const newNodesByParent = new Map(state.nodesByParent);
  node.parent_ids.forEach(parentId => {
    const childIds = new Set(newNodesByParent.get(parentId) || []);
    childIds.add(node.node_id);
    newNodesByParent.set(parentId, childIds);
  });

  return {
    ...state,
    nodes: newNodes,
    nodesByCluster: newNodesByCluster,
    nodesByParent: newNodesByParent,
    lastUpdateTimestamp: Date.now(),
    totalUpdates: state.totalUpdates + 1
  };
}
```

### Query: Get All Nodes in Cluster

```typescript
import { GraphState, GraphNode } from '@/types';

function getClusterNodes(state: GraphState, clusterId: string): GraphNode[] {
  const nodeIds = state.nodesByCluster.get(clusterId) || new Set();
  return Array.from(nodeIds)
    .map(id => state.nodes.get(id)!)
    .filter((n): n is GraphNode => n !== undefined);
}

// Usage
const eagleNodes = getClusterNodes(state, 'eagle');
```

### Query: Get Node Children

```typescript
import { GraphState, GraphNode } from '@/types';

function getChildren(state: GraphState, nodeId: string): GraphNode[] {
  const childIds = state.nodesByParent.get(nodeId) || new Set();
  return Array.from(childIds)
    .map(id => state.nodes.get(id)!)
    .filter((n): n is GraphNode => n !== undefined);
}

// Usage
const children = getChildren(state, 'node_eagle_001');
```

### Query: Filter Nodes

```typescript
import { GraphState, NodeFilter } from '@/types';

function filterNodes(state: GraphState, filter: NodeFilter) {
  let results = Array.from(state.nodes.values());

  if (filter.cluster_ids?.length) {
    results = results.filter(n => filter.cluster_ids!.includes(n.cluster_id));
  }

  if (filter.attack_types?.length) {
    results = results.filter(n => filter.attack_types!.includes(n.attack_type));
  }

  if (filter.statuses?.length) {
    results = results.filter(n => filter.statuses!.includes(n.status));
  }

  return results;
}

// Usage
const results = filterNodes(state, {
  cluster_ids: ['eagle', 'wolf'],
  attack_types: ['base64_encoding', 'role_play'],
  statuses: ['success', 'partial']
});
```

### Handle WebSocket Events

```typescript
import {
  WebSocketEvent,
  isClusterAddEvent,
  isNodeAddEvent,
  isNodeUpdateEvent
} from '@/types';

function handleWebSocketEvent(state: GraphState, event: WebSocketEvent): GraphState {
  if (isClusterAddEvent(event)) {
    // Handle cluster_add
    const cluster = {
      cluster_id: event.data.cluster_id,
      name: event.data.name,
      position_hint: event.data.position_hint,
      color: event.data.color || '#999',
      collapsed: false,
      visible: true
    };
    // Add cluster to state...

  } else if (isNodeAddEvent(event)) {
    // Handle node_add
    const node = {
      node_id: event.data.node_id,
      cluster_id: event.data.cluster_id,
      parent_ids: event.data.parent_ids,
      attack_type: event.data.attack_type,
      status: event.data.status,
      timestamp: event.data.timestamp || Date.now()
    };
    // Add node to state...

  } else if (isNodeUpdateEvent(event)) {
    // Handle node_update
    const updates = event.data;
    // Update node in state...
  }

  return state;
}
```

### Start an Attack

```typescript
import { StartAttackRequest } from '@/types';

const request: StartAttackRequest = {
  targets: [
    {
      agent_id: 'eagle',
      agent_name: 'Eagle Agent',
      endpoint: 'https://api.example.com/chat',
      model: 'gpt-3.5-turbo'
    }
  ],
  attack_types: ['base64_encoding', 'role_play'],
  population_size: 50,
  generations: 20,
  config: {
    timeout: 30000,
    max_retries: 3,
    continue_on_error: true
  }
};

const response = await fetch('/api/attacks/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});
```

### Fetch Attack Results

```typescript
import { AttackResults } from '@/types';

async function getResults(attackId: string): Promise<AttackResults> {
  const response = await fetch(`/api/attacks/${attackId}/results`);
  return response.json() as Promise<AttackResults>;
}

// Usage
const results = await getResults('atk_67890abc');
console.log(`Success Rate: ${results.summary.success_rate}%`);
```

### React Component with Types

```typescript
import { GraphState, GraphNode } from '@/types';
import React, { useState } from 'react';

interface GraphCanvasProps {
  state: GraphState;
  onNodeClick: (nodeId: string) => void;
}

export function GraphCanvas({ state, onNodeClick }: GraphCanvasProps) {
  const nodes = Array.from(state.nodes.values());

  return (
    <svg>
      {nodes.map(node => (
        <g
          key={node.node_id}
          onClick={() => onNodeClick(node.node_id)}
        >
          {/* Render node */}
        </g>
      ))}
    </svg>
  );
}
```

### React Hook for WebSocket

```typescript
import { WebSocketEvent, GraphState } from '@/types';
import { useEffect, useState } from 'react';

export function useGraphWebSocket(url: string) {
  const [state, setState] = useState<GraphState>(initialState);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      const msg: WebSocketEvent = JSON.parse(event.data);
      setState(prev => handleEvent(prev, msg));
    };

    return () => ws.close();
  }, [url]);

  return state;
}
```

### Type-Safe Enum Usage

```typescript
import { NodeStatus, AttackType } from '@/types';

// Validate at compile time
const status: NodeStatus = NodeStatus.SUCCESS;     // ✓ OK
const type: AttackType = AttackType.BASE64_ENCODING; // ✓ OK

// Invalid assignments caught by TypeScript
const bad1: NodeStatus = 'invalid';      // ✗ Type error
const bad2: AttackType = 'something';    // ✗ Type error
```

## Common Issues & Solutions

### Issue: "Cannot get property of undefined"

```typescript
// ✗ Bad - Map.get() returns undefined
const node = state.nodes.get('invalid_id');
console.log(node.llm_summary); // Error!

// ✓ Good - Check first
const node = state.nodes.get('invalid_id');
if (node) {
  console.log(node.llm_summary);
}

// ✓ Better - Use nullish coalescing
const node = state.nodes.get('invalid_id') || null;
```

### Issue: "Cannot modify state directly"

```typescript
// ✗ Bad - Direct mutation
state.nodes.set(nodeId, updatedNode);

// ✓ Good - Create new Map
const newState: GraphState = {
  ...state,
  nodes: new Map(state.nodes).set(nodeId, updatedNode)
};
```

### Issue: "Array indices lost with Map"

```typescript
// For serialization, convert Maps to arrays
const serializable = {
  nodes: Array.from(state.nodes.values()),
  clusters: Array.from(state.clusters.values()),
  // ...
};
```

## Type Checking

```bash
# Check types without compiling
tsc --noEmit

# Check with strict mode
tsc --strict --noEmit

# Generate type coverage report
npx type-coverage --at-least 99
```

## Performance Tips

1. **Use O(1) lookups**
   ```typescript
   // ✓ Fast O(1)
   const node = state.nodes.get(nodeId);

   // ✗ Slow O(n)
   const node = Array.from(state.nodes.values()).find(n => n.node_id === nodeId);
   ```

2. **Batch updates**
   ```typescript
   // Better: Batch into single state update
   let newState = state;
   newState = addNode(newState, node1);
   newState = addNode(newState, node2);
   setState(newState);
   ```

3. **Memoize complex queries**
   ```typescript
   const clusterNodes = useMemo(
     () => getClusterNodes(state, clusterId),
     [state, clusterId]
   );
   ```

## File Locations

- **Graph types** → `/home/user/holistichack/frontend/src/types/graph.ts`
- **WebSocket types** → `/home/user/holistichack/frontend/src/types/websocket.ts`
- **API types** → `/home/user/holistichack/frontend/src/types/api.ts`
- **All exports** → `/home/user/holistichack/frontend/src/types/index.ts`
- **Documentation** → `/home/user/holistichack/frontend/src/types/README.md`

## Next Steps

1. Copy these type files to your frontend project
2. Configure TypeScript path alias: `@/types` → `./src/types`
3. Start importing types from `@/types`
4. Enable strict mode in `tsconfig.json`
5. Use with your React components and state management

---

**Last Updated:** November 15, 2024
