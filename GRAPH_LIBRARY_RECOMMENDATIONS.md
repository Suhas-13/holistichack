# Graph Visualization Library Recommendations

## Overview
This document provides recommendations for graph visualization libraries suitable for the real-time attack evolution dashboard.

**Requirements:**
- Handle 200-300 nodes smoothly
- Real-time updates via WebSocket
- Force-directed layout with clustering
- Interactive node selection
- High performance rendering

---

## Recommended Libraries

### 1. **React Flow** ⭐ RECOMMENDED
**Best for:** React-based applications with structured graphs

**Pros:**
- ✅ Excellent React integration
- ✅ Built-in performance optimizations (virtualization, culling)
- ✅ Easy to customize nodes and edges
- ✅ Good TypeScript support
- ✅ Handles 500+ nodes smoothly
- ✅ Active development and community

**Cons:**
- ❌ Force-directed layout requires additional plugin
- ❌ Less flexible than D3 for custom layouts

**Installation:**
```bash
npm install reactflow
```

**Integration Example:**
```tsx
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

interface GraphVisualizationProps {
  state: GraphState;
  onNodeClick: (nodeId: string) => void;
}

function GraphVisualization({ state, onNodeClick }: GraphVisualizationProps) {
  // Convert GraphState to React Flow format
  const nodes: Node[] = Array.from(state.nodes.values()).map(node => {
    const layout = state.layout.get(node.node_id)!;
    return {
      id: node.node_id,
      type: 'attackNode',
      position: layout.position,
      data: {
        node,
        cluster: state.clusters.get(node.cluster_id)
      },
      style: {
        background: getNodeColor(node.status),
        borderRadius: '50%',
        width: layout.radius * 2,
        height: layout.radius * 2
      }
    };
  });

  const edges: Edge[] = Array.from(state.links.values()).map(link => ({
    id: link.link_id,
    source: link.source_node_ids[0], // Simplified for single source
    target: link.target_node_id,
    type: 'smoothstep',
    animated: link.animated,
    style: { strokeWidth: (link.strength || 1) * 2 }
  }));

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={(_, node) => onNodeClick(node.id)}
      fitView
    />
  );
}
```

---

### 2. **D3-Force + React**
**Best for:** Maximum customization and control

**Pros:**
- ✅ Complete control over rendering and physics
- ✅ Excellent force-directed layouts
- ✅ Highly customizable
- ✅ Industry standard
- ✅ Best performance when optimized

**Cons:**
- ❌ Steeper learning curve
- ❌ More boilerplate code
- ❌ Need to manage React integration manually

**Installation:**
```bash
npm install d3-force d3-selection d3-zoom
npm install --save-dev @types/d3-force @types/d3-selection
```

**Integration Strategy:**
```tsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3-force';

function D3GraphVisualization({ state }: { state: GraphState }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any>>();

  useEffect(() => {
    if (!svgRef.current) return;

    // Convert state to D3 format
    const nodes = Array.from(state.nodes.values()).map(node => ({
      id: node.node_id,
      ...state.layout.get(node.node_id)!.position,
      data: node
    }));

    const links = Array.from(state.links.values()).map(link => ({
      source: link.source_node_ids[0],
      target: link.target_node_id,
      data: link
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(400, 300))
      .force('collision', d3.forceCollide().radius(20));

    simulationRef.current = simulation;

    // Render with D3...
    // (See implementation details below)

    return () => simulation.stop();
  }, [state]);

  return <svg ref={svgRef} width="800" height="600" />;
}
```

---

### 3. **Cytoscape.js**
**Best for:** Complex graph analysis and advanced layouts

**Pros:**
- ✅ Powerful graph analysis features
- ✅ Multiple layout algorithms built-in
- ✅ Good performance
- ✅ Rich API

**Cons:**
- ❌ React integration requires wrapper
- ❌ Steeper learning curve
- ❌ Large bundle size (~500KB)

**Installation:**
```bash
npm install cytoscape
npm install --save-dev @types/cytoscape
```

**Integration:**
```tsx
import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

function CytoscapeGraph({ state }: { state: GraphState }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core>();

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [
      // Nodes
      ...Array.from(state.nodes.values()).map(node => ({
        data: {
          id: node.node_id,
          label: node.attack_type,
          cluster: node.cluster_id,
          ...node
        }
      })),
      // Edges
      ...Array.from(state.links.values()).map(link => ({
        data: {
          id: link.link_id,
          source: link.source_node_ids[0],
          target: link.target_node_id
        }
      }))
    ];

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      layout: { name: 'cose' }, // Force-directed layout
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(status)',
            'label': 'data(attack_type)'
          }
        }
      ]
    });

    return () => cyRef.current?.destroy();
  }, [state]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}
```

---

### 4. **Sigma.js**
**Best for:** Large graphs (1000+ nodes)

**Pros:**
- ✅ Excellent performance for large graphs
- ✅ WebGL rendering
- ✅ Good for network visualization

**Cons:**
- ❌ Less active development
- ❌ Limited React support
- ❌ Harder to customize

---

## Final Recommendation

### **Use React Flow** if:
- ✅ You're building with React
- ✅ You want quick development
- ✅ 200-300 nodes is your target
- ✅ You need good TypeScript support

### **Use D3-Force** if:
- ✅ You need maximum control
- ✅ You have custom layout requirements
- ✅ Performance is critical
- ✅ Team has D3 experience

### **Use Cytoscape.js** if:
- ✅ You need graph analysis features
- ✅ Complex layout algorithms required
- ✅ Graph theory operations needed

---

## Performance Optimization Techniques

### 1. **Viewport Culling**
Only render nodes within the visible viewport:

```typescript
function getVisibleNodes(
  state: GraphState,
  viewport: Viewport
): Set<string> {
  const visible = new Set<string>();

  for (const [nodeId, layout] of state.layout) {
    const { position, radius } = layout;

    // Check if node is in viewport bounds
    if (
      position.x + radius >= viewport.x &&
      position.x - radius <= viewport.x + viewport.width &&
      position.y + radius >= viewport.y &&
      position.y - radius <= viewport.y + viewport.height
    ) {
      visible.add(nodeId);
    }
  }

  return visible;
}
```

### 2. **Level of Detail (LOD)**
Render different detail levels based on zoom:

```typescript
function getNodeRenderLayer(
  zoom: number,
  node: GraphNode
): RenderLayer {
  if (zoom < 0.5) {
    // Far out - just show important nodes
    return node.status === NodeStatus.SUCCESS
      ? RenderLayer.SIMPLIFIED
      : RenderLayer.CULLED;
  } else if (zoom < 1.0) {
    // Medium zoom - show all nodes, no labels
    return RenderLayer.SIMPLIFIED;
  } else {
    // Close up - full detail
    return RenderLayer.FULL;
  }
}
```

### 3. **Memoization**
Use React.memo and useMemo to avoid re-renders:

```tsx
import { memo, useMemo } from 'react';

const AttackNode = memo(({ node, layout }: {
  node: GraphNode;
  layout: NodeLayout;
}) => {
  const style = useMemo(() => ({
    left: layout.position.x,
    top: layout.position.y,
    width: layout.radius * 2,
    height: layout.radius * 2,
    backgroundColor: getNodeColor(node.status)
  }), [layout.position.x, layout.position.y, layout.radius, node.status]);

  return <div className="attack-node" style={style} />;
});
```

### 4. **Debounced Layout Updates**
Don't update layout on every physics tick:

```typescript
import { debounce } from 'lodash';

const debouncedLayoutUpdate = debounce((newLayout: Map<string, NodeLayout>) => {
  setState(prev => ({
    ...prev,
    layout: newLayout
  }));
}, 50); // Update at most every 50ms (20 FPS)
```

### 5. **WebWorker for Physics**
Offload force simulation to a worker:

```typescript
// physics-worker.ts
import * as d3 from 'd3-force';

self.onmessage = (e) => {
  const { nodes, links, config } = e.data;

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).distance(config.link_distance))
    .force('charge', d3.forceManyBody().strength(config.charge_strength))
    .on('tick', () => {
      // Send updated positions back to main thread
      self.postMessage({ type: 'tick', nodes });
    });

  simulation.tick(300); // Run simulation
};
```

### 6. **Canvas vs SVG**
For 200-300 nodes, **SVG is fine**. For 500+, use **Canvas** or **WebGL**:

```typescript
// Canvas rendering for better performance
function renderNodesCanvas(
  ctx: CanvasRenderingContext2D,
  state: GraphState
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const [nodeId, layout] of state.layout) {
    const node = state.nodes.get(nodeId)!;

    ctx.beginPath();
    ctx.arc(
      layout.position.x,
      layout.position.y,
      layout.radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = getNodeColor(node.status);
    ctx.fill();
  }
}
```

---

## Integration with WebSocket

### Real-time Update Strategy

```typescript
import { useEffect, useReducer } from 'react';

function useGraphState(websocketUrl: string) {
  const [state, dispatch] = useReducer(
    (state: GraphState, event: GraphWebSocketEvent) =>
      handleWebSocketEvent(state, event),
    createEmptyGraphState()
  );

  useEffect(() => {
    const ws = new WebSocket(websocketUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as GraphWebSocketEvent;
      dispatch(data);
    };

    return () => ws.close();
  }, [websocketUrl]);

  return state;
}

// Usage
function Dashboard() {
  const state = useGraphState('ws://localhost:8000/graph');

  return <GraphVisualization state={state} />;
}
```

### Batched Updates
For high-frequency updates, batch them:

```typescript
class GraphWebSocketClient {
  private updateQueue: GraphWebSocketEvent[] = [];
  private flushInterval: NodeJS.Timer;

  constructor(
    private onBatch: (events: GraphWebSocketEvent[]) => void
  ) {
    // Flush queue every 100ms
    this.flushInterval = setInterval(() => this.flush(), 100);
  }

  handleMessage(event: GraphWebSocketEvent) {
    this.updateQueue.push(event);
  }

  private flush() {
    if (this.updateQueue.length > 0) {
      this.onBatch([...this.updateQueue]);
      this.updateQueue = [];
    }
  }

  destroy() {
    clearInterval(this.flushInterval);
    this.flush();
  }
}
```

---

## Summary

For your red team attack evolution visualization with 200-300 nodes:

**Best Choice: React Flow + D3-Force**
- Use **React Flow** for the rendering layer (easy React integration)
- Use **D3-Force** for physics simulation (better clustering support)
- Implement viewport culling for performance
- Use WebSocket batching for smooth updates

This combination gives you:
- ✅ Easy React integration
- ✅ Powerful force-directed layouts
- ✅ Excellent performance
- ✅ Full TypeScript support
- ✅ Easy customization
