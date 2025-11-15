/**
 * Graph canvas component (center panel with React Flow)
 */

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GraphState } from '../../types';

interface GraphCanvasProps {
  graphState: GraphState | null;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  isLoading: boolean;
}

export function GraphCanvas({
  graphState,
  selectedNodeId,
  onNodeSelect,
  isLoading,
}: GraphCanvasProps) {
  const nodes = [];
  const edges = [];

  if (isLoading) {
    return (
      <div className="flex-1 bg-[var(--bg-void)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading graph...</p>
        </div>
      </div>
    );
  }

  if (!graphState) {
    return (
      <div className="flex-1 bg-[var(--bg-void)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-2">No Active Attack</h3>
          <p className="text-[var(--text-secondary)]">
            Configure and start an attack from the left panel to begin visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--bg-void)] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(event, node) => onNodeSelect(node.id)}
        fitView
        className="bg-[var(--bg-void)]"
      >
        <Background
          color="var(--border-subtle)"
          gap={20}
          size={1}
        />
        <Controls className="bg-[var(--bg-surface)] border border-[var(--border-subtle)]" />
        <MiniMap
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
          nodeColor="var(--primary-cyan)"
        />
      </ReactFlow>
    </div>
  );
}

export default GraphCanvas;
