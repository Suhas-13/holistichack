# Red-Teaming Dashboard - Implementation Guide

## Quick Start Code Snippets

### 1. React Component Structure

```tsx
// src/App.tsx
import { useState } from 'react';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import GraphCanvas from './components/GraphCanvas';
import RightPanel from './components/RightPanel';
import TimelinePanel from './components/TimelinePanel';

export default function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [attackStatus, setAttackStatus] = useState('idle');

  return (
    <div className="h-screen bg-void text-primary flex flex-col">
      {/* Top Bar */}
      <TopBar attackStatus={attackStatus} />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <LeftPanel
          isCollapsed={isPanelCollapsed}
          onToggle={() => setIsPanelCollapsed(!isPanelCollapsed)}
          onStart={() => setAttackStatus('active')}
        />

        {/* Graph Canvas */}
        <GraphCanvas
          className="flex-1"
          onNodeSelect={setSelectedNode}
        />

        {/* Right Panel */}
        <RightPanel
          selectedNode={selectedNode}
        />
      </div>

      {/* Bottom Timeline */}
      <TimelinePanel />
    </div>
  );
}
```

### 2. Top Bar Component

```tsx
// src/components/TopBar.tsx
import { motion } from 'framer-motion';

interface TopBarProps {
  attackStatus: 'idle' | 'active' | 'paused';
  generation?: number;
  nodeCount?: number;
  successRate?: number;
  avgFitness?: number;
}

export default function TopBar({
  attackStatus,
  generation = 0,
  nodeCount = 0,
  successRate = 0,
  avgFitness = 0
}: TopBarProps) {
  return (
    <header className="h-16 bg-surface border-b border-subtle flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <div className="font-mono font-bold tracking-wide">
          <div className="text-xl text-primary-cyan">REDTEAM</div>
          <div className="text-xs text-text-secondary">EVOLUTION</div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-3 px-4 py-2 bg-elevated rounded-lg border border-subtle">
        <motion.div
          className={`w-3 h-3 rounded-full ${
            attackStatus === 'active'
              ? 'bg-status-running'
              : attackStatus === 'paused'
              ? 'bg-status-pending'
              : 'bg-text-muted'
          }`}
          animate={attackStatus === 'active' ? {
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <span className="text-sm font-medium uppercase tracking-wide">
          {attackStatus}
        </span>
        <span className="text-xs text-text-muted">
          Gen {generation} | {nodeCount} nodes
        </span>
      </div>

      {/* Metrics Ticker */}
      <div className="flex-1 flex items-center justify-center gap-8 font-numeric text-sm">
        <Metric label="Success Rate" value={`${successRate}%`} trend="up" />
        <Metric label="Avg Fitness" value={avgFitness.toFixed(2)} trend="down" />
        <Metric label="Best" value="0.94" />
        <Metric label="Mutations" value="847" />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="cyber-button text-xs">
          Export
        </button>
      </div>
    </header>
  );
}

function Metric({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-muted">{label}:</span>
      <span className="text-primary-cyan font-semibold">{value}</span>
      {trend && (
        <span className={trend === 'up' ? 'text-status-success' : 'text-status-failure'}>
          {trend === 'up' ? '▲' : '▼'}
        </span>
      )}
    </div>
  );
}
```

### 3. D3.js Force Graph Setup

```tsx
// src/components/GraphCanvas.tsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  generation: number;
  fitness: number;
  status: 'pending' | 'running' | 'success' | 'failure';
  cluster: string;
  x?: number;
  y?: number;
}

interface Link {
  source: string | Node;
  target: string | Node;
  type: 'parent' | 'breeding' | 'mutation';
}

export default function GraphCanvas({ onNodeSelect }: { onNodeSelect: (node: Node) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Sample data
    const nodes: Node[] = [
      { id: '1', generation: 0, fitness: 0.5, status: 'success', cluster: 'A' },
      { id: '2', generation: 1, fitness: 0.7, status: 'success', cluster: 'A' },
      { id: '3', generation: 1, fitness: 0.6, status: 'running', cluster: 'B' },
    ];

    const links: Link[] = [
      { source: '1', target: '2', type: 'parent' },
      { source: '1', target: '3', type: 'breeding' },
    ];

    // Create SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('cluster', forceCluster())
      .force('collision', d3.forceCollide().radius(30));

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', d => `link link-${d.type}`)
      .attr('stroke', d =>
        d.type === 'parent' ? 'rgba(0, 217, 255, 0.3)' :
        d.type === 'breeding' ? 'rgba(255, 0, 110, 0.5)' :
        'rgba(167, 139, 250, 0.4)'
      )
      .attr('stroke-width', d => d.type === 'breeding' ? 2 : 1);

    // Draw nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('r', d => 6 + d.fitness * 8)
      .attr('fill', d =>
        d.status === 'success' ? '#10b981' :
        d.status === 'failure' ? '#ef4444' :
        d.status === 'running' ? '#fbbf24' :
        '#6b7280'
      )
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.3)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onNodeSelect(d);
        // Add selection styling
        node.attr('stroke-width', 2);
        d3.select(event.currentTarget)
          .attr('stroke', '#00d9ff')
          .attr('stroke-width', 3);
      })
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (6 + d.fitness * 8) * 1.3);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6 + d.fitness * 8);
      })
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any
      );

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Custom cluster force
    function forceCluster() {
      const strength = 0.2;
      const clusters = new Map();

      nodes.forEach(node => {
        if (!clusters.has(node.cluster)) {
          clusters.set(node.cluster, { x: 0, y: 0, count: 0 });
        }
      });

      return (alpha: number) => {
        nodes.forEach(node => {
          const cluster = clusters.get(node.cluster);
          if (cluster && node.x && node.y) {
            node.vx! -= (node.x - cluster.x) * strength * alpha;
            node.vy! -= (node.y - cluster.y) * strength * alpha;
          }
        });
      };
    }

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-void"
      style={{ cursor: 'grab' }}
    />
  );
}
```

### 4. Node Detail Panel

```tsx
// src/components/RightPanel.tsx
import { motion, AnimatePresence } from 'framer-motion';

interface Node {
  id: string;
  generation: number;
  fitness: number;
  status: string;
  cluster: string;
  transcript?: {
    prompt: string;
    response: string;
    analysis: string;
  };
}

export default function RightPanel({ selectedNode }: { selectedNode: Node | null }) {
  return (
    <div className="w-96 bg-surface border-l border-subtle overflow-y-auto">
      <AnimatePresence mode="wait">
        {selectedNode ? (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-6 space-y-6"
          >
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">
                NODE DETAILS
              </h2>
              <div className="h-px glow-divider mb-4" />
            </div>

            {/* Node Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  selectedNode.status === 'success' ? 'bg-status-success' :
                  selectedNode.status === 'failure' ? 'bg-status-failure' :
                  selectedNode.status === 'running' ? 'bg-status-running' :
                  'bg-status-pending'
                }`} />
                <span className="font-mono font-semibold">
                  Node #{selectedNode.id}
                </span>
              </div>

              <InfoRow label="Generation" value={selectedNode.generation} />
              <InfoRow label="Fitness" value={selectedNode.fitness.toFixed(2)} />
              <InfoRow label="Cluster" value={selectedNode.cluster} />
            </div>

            {/* Transcript */}
            {selectedNode.transcript && (
              <div className="glass-panel p-4 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Transcript
                </h3>

                <div className="transcript space-y-4">
                  <div>
                    <div className="text-primary-cyan mb-1">&gt; User prompt:</div>
                    <div className="text-text-secondary pl-4">
                      "{selectedNode.transcript.prompt}"
                    </div>
                  </div>

                  <div>
                    <div className="text-primary-purple mb-1">&lt; Agent response:</div>
                    <div className="text-text-secondary pl-4">
                      "{selectedNode.transcript.response}"
                    </div>
                  </div>

                  <div className="pt-3 border-t border-subtle">
                    <div className={`font-semibold ${
                      selectedNode.transcript.analysis.includes('SUCCESS')
                        ? 'text-status-success'
                        : 'text-status-failure'
                    }`}>
                      Analysis: {selectedNode.transcript.analysis}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <button className="cyber-button-primary w-full">
              EXPORT DATA ⬇
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 h-full flex items-center justify-center"
          >
            <div className="text-center text-text-muted">
              <div className="text-4xl mb-4">◯</div>
              <div className="text-sm">Select a node to view details</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-muted">{label}:</span>
      <span className="font-mono text-text-primary">{value}</span>
    </div>
  );
}
```

### 5. Custom CSS Utilities

```css
/* src/styles/globals.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  :root {
    --bg-void: #0a0e14;
    --bg-surface: #111827;
    --bg-elevated: #1a1f2e;
    --primary-cyan: #00d9ff;
    --primary-purple: #a78bfa;
    --primary-magenta: #ff006e;
    --status-running: #fbbf24;
    --status-success: #10b981;
    --status-failure: #ef4444;
    --text-primary: #f9fafb;
    --text-secondary: #9ca3af;
    --text-muted: #6b7280;
    --border-subtle: #1f2937;
  }

  body {
    @apply bg-void text-primary font-display antialiased;
  }
}

@layer components {
  .cyber-button {
    @apply px-4 py-2 bg-elevated text-primary-cyan font-medium;
    @apply border border-primary-cyan/30 rounded-md;
    @apply hover:bg-primary-cyan/10 hover:border-primary-cyan/60;
    @apply transition-all duration-200 active:scale-95;
  }

  .cyber-button-primary {
    @apply cyber-button bg-primary-cyan/20 border-primary-cyan;
    @apply hover:bg-primary-cyan/30 hover:shadow-lg hover:shadow-primary-cyan/50;
  }

  .glass-panel {
    @apply bg-surface/85 backdrop-blur-sm border border-subtle rounded-lg;
  }

  .glow-divider {
    @apply h-px bg-gradient-to-r from-transparent via-primary-cyan to-transparent opacity-30;
  }

  .transcript {
    @apply bg-void border border-subtle rounded-md p-4;
    @apply font-mono text-sm text-secondary;
    @apply overflow-y-auto max-h-96;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 217, 255, 0.3) transparent;
  }

  .transcript::-webkit-scrollbar {
    width: 6px;
  }

  .transcript::-webkit-scrollbar-track {
    background: transparent;
  }

  .transcript::-webkit-scrollbar-thumb {
    background: rgba(0, 217, 255, 0.3);
    border-radius: 3px;
  }

  .transcript::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 217, 255, 0.5);
  }
}

@layer utilities {
  .text-primary {
    color: var(--text-primary);
  }

  .text-secondary {
    color: var(--text-secondary);
  }

  .text-muted {
    color: var(--text-muted);
  }

  .bg-void {
    background-color: var(--bg-void);
  }

  .bg-surface {
    background-color: var(--bg-surface);
  }

  .bg-elevated {
    background-color: var(--bg-elevated);
  }

  .text-primary-cyan {
    color: var(--primary-cyan);
  }

  .text-primary-purple {
    color: var(--primary-purple);
  }

  .border-subtle {
    border-color: var(--border-subtle);
  }
}

/* Animations */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 6. Real-time WebSocket Integration

```tsx
// src/hooks/useEvolutionData.ts
import { useEffect, useState } from 'react';

interface EvolutionUpdate {
  type: 'node_added' | 'node_updated' | 'generation_complete';
  data: any;
}

export function useEvolutionData() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/evolution');

    ws.onmessage = (event) => {
      const update: EvolutionUpdate = JSON.parse(event.data);

      switch (update.type) {
        case 'node_added':
          setNodes(prev => [...prev, update.data]);
          break;

        case 'node_updated':
          setNodes(prev =>
            prev.map(node =>
              node.id === update.data.id ? { ...node, ...update.data } : node
            )
          );
          break;

        case 'generation_complete':
          setGeneration(update.data.generation);
          break;
      }
    };

    return () => ws.close();
  }, []);

  return { nodes, links, generation };
}
```

### 7. Animation Variants (Framer Motion)

```tsx
// src/utils/animations.ts
export const nodeVariants = {
  enter: {
    scale: [0, 1.3, 1],
    opacity: [0, 0.7, 1],
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1], // Elastic ease-out
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
  selected: {
    scale: 1.2,
    transition: {
      duration: 0.15,
    },
  },
};

export const panelVariants = {
  collapsed: {
    width: 48,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1], // Material Design standard
    },
  },
  expanded: {
    width: 300,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
};

export const statusChangeVariants = {
  flash: {
    opacity: [1, 0.5, 1],
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.8,
    },
  },
};
```

## Performance Optimizations

### 1. Virtualization for Large Graphs
```tsx
// Use react-window for rendering large node lists
import { FixedSizeList } from 'react-window';

// Only render visible nodes in detail views
```

### 2. Throttle Graph Updates
```tsx
import { throttle } from 'lodash';

const updateGraph = throttle((data) => {
  // Update logic
}, 16); // 60fps max
```

### 3. WebGL for Large Graphs
```tsx
// Consider using react-force-graph for WebGL rendering
import ForceGraph2D from 'react-force-graph-2d';
// or ForceGraph3D for 3D visualization
```

## Testing Checklist

- [ ] All colors meet WCAG AAA contrast ratios
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Keyboard navigation works throughout
- [ ] Touch targets are minimum 44x44px
- [ ] Graph performs smoothly with 1000+ nodes
- [ ] Real-time updates don't cause UI jank
- [ ] Panel collapse/expand is smooth
- [ ] Node selection feedback is immediate
- [ ] Export functionality works
- [ ] Responsive on tablet/mobile

## Demo Script for Judges

1. **Open with dark screen** - Logo fade in
2. **Start evolution** - Nodes appear with animation
3. **Show clustering** - Zoom to cluster, highlight boundaries
4. **Select node** - Detail panel slides in, show transcript
5. **Real-time update** - New generation appears, status changes animate
6. **Timeline scrubbing** - Slide through generations smoothly
7. **Export results** - Download JSON with success feedback

---

This implementation guide provides production-ready code for your hackathon demo!
