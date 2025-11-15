/**
 * Graph canvas component (center panel with React Flow)
 */

import { ReactFlow, Background, Controls, MiniMap, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo, useEffect } from 'react';
import type { GraphState } from '../../types';
import { transformGraphStateToReactFlow } from '../../utils/graphTransforms';
import { AttackNode } from './AttackNode';
import { ClusterNode } from './ClusterNode';
import { useGraphStore } from '../../stores/graphStore';

const nodeTypes = {
  custom: AttackNode,
  group: ClusterNode,
};

interface GraphCanvasProps {
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  isLoading: boolean;
}

// Inner component to handle automatic zoom adjustment
function AutoFitView({ clusterCount }: { clusterCount: number }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (clusterCount > 0) {
      // Automatically zoom out to show all clusters when count changes
      setTimeout(() => {
        fitView({ padding: 0.3, duration: 800 });
      }, 100);
    }
  }, [clusterCount, fitView]);

  return null;
}

export function GraphCanvas({
  selectedNodeId,
  onNodeSelect,
  isLoading,
}: GraphCanvasProps) {
  // Get graph data from store
  const storeNodes = useGraphStore((state) => state.nodes);
  const storeClusters = useGraphStore((state) => state.clusters);
  const storeLinks = useGraphStore((state) => state.links);

  // Create graphState object from store
  const graphState: GraphState | null = useMemo(() => {
    if (storeNodes.size === 0 && storeClusters.size === 0) {
      return null;
    }
    return {
      nodes: storeNodes,
      clusters: storeClusters,
      links: storeLinks,
    } as GraphState;
  }, [storeNodes, storeClusters, storeLinks]);

  // Transform GraphState to ReactFlow format
  const { nodes, edges } = useMemo(() => {
    if (!graphState) {
      return { nodes: [], edges: [] };
    }
    return transformGraphStateToReactFlow(graphState);
  }, [graphState]);

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
    <div className="flex-1 bg-[var(--bg-void)] relative" style={{ minHeight: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(event, node) => onNodeSelect(node.id)}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className="bg-[var(--bg-void)]"
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <AutoFitView clusterCount={storeClusters.size} />
        <Background
          color="rgba(167, 139, 250, 0.1)"
          gap={30}
          size={2}
        />
        <Controls
          className="!bg-[var(--bg-elevated)]/95 !border !border-[var(--border-default)] rounded-lg shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-[var(--bg-elevated)]/95 !border !border-[var(--border-default)] rounded-lg shadow-lg"
          nodeColor="#00d9ff"
          maskColor="rgba(10, 14, 20, 0.9)"
        />
      </ReactFlow>
    </div>
  );
}

export default GraphCanvas;
