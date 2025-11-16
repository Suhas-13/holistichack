import { memo, useMemo, useState } from "react";
import { AttackNode, ClusterData } from "@/types/evolution";
import AttackNodeComponent from "./AttackNodeComponent";

interface ClusterVisualizationProps {
  clusters: ClusterData[];
  onNodeSelect: (node: AttackNode) => void;
  selectedNode?: AttackNode | null;
}

const ClusterVisualization = memo(({ clusters, onNodeSelect, selectedNode }: ClusterVisualizationProps) => {
  console.log("[ClusterVisualization] Rendering with clusters:", clusters.length);
  clusters.forEach((c) => {
    console.log(`[ClusterVisualization] Cluster ${c.name}: ${c.nodes?.length || 0} nodes`);
  });
  
  // Helper function to get all ancestors of a node
  const getAncestors = (nodeId: string, visited = new Set()): string[] => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    
    const node = clusters.flatMap(c => c.nodes || []).find(n => n.node_id === nodeId);
    if (!node || !node.parent_ids.length) return [];
    
    return [
      ...node.parent_ids,
      ...node.parent_ids.flatMap(parentId => getAncestors(parentId, visited))
    ];
  };

  // Helper function to get all descendants of a node  
  const getDescendants = (nodeId: string, visited = new Set()): string[] => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    
    const children = clusters.flatMap(c => c.nodes || [])
      .filter(n => n.parent_ids.includes(nodeId))
      .map(n => n.node_id);
    
    return [
      ...children,
      ...children.flatMap(childId => getDescendants(childId, visited))
    ];
  };

  const connectionLines = useMemo(() => {
    if (!selectedNode) return []; // Hide all connections when no node is selected

    const relevantNodeIds = new Set([
      selectedNode.node_id,
      ...getAncestors(selectedNode.node_id),
      ...getDescendants(selectedNode.node_id)
    ]);

    return clusters.flatMap((cluster) =>
      (cluster.nodes || []).flatMap((node) => {
        if (!relevantNodeIds.has(node.node_id)) return [];
        
        return node.parent_ids.map((parentId) => {
          if (!relevantNodeIds.has(parentId)) return null;
          
          const parentNode = clusters
            .flatMap((c) => c.nodes || [])
            .find((n) => n.node_id === parentId);
          
          if (!parentNode || !node.position || !parentNode.position) return null;

          return {
            key: `${parentId}-${node.node_id}`,
            x1: parentNode.position.x,
            y1: parentNode.position.y,
            x2: node.position.x,
            y2: node.position.y,
            isSelectedPath: node.node_id === selectedNode.node_id || parentId === selectedNode.node_id
          };
        }).filter(Boolean);
      })
    );
  }, [clusters, selectedNode]);
  return (
    <svg width="3000" height="2000" className="absolute inset-0" style={{ minWidth: '3000px', minHeight: '2000px' }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        <linearGradient id="link-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
        </linearGradient>

        {/* Arrow marker for connection lines */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#3b82f6"
            opacity="0.8"
          />
        </marker>

      </defs>

      {/* Render connection lines between parent-child nodes */}
      {connectionLines.map((line) => line && (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#3b82f6"
          strokeWidth="2"
          strokeOpacity="0.6"
          markerEnd="url(#arrowhead)"
          pointerEvents="none"
        />
      ))}

      {/* Render clusters */}
      {clusters.filter((cluster) => (cluster.nodes || []).length > 0).map((cluster) => (
        <g key={cluster.cluster_id}>
          {/* Cluster background */}
          <circle
            cx={cluster.position_hint.x}
            cy={cluster.position_hint.y}
            r={110}
            fill={cluster.color || "hsl(189, 94%, 55%)"}
            opacity="0.1"
            pointerEvents="none"
          />
          
          {/* Cluster label */}
          <text
            x={cluster.position_hint.x}
            y={cluster.position_hint.y - 135}
            fill="currentColor"
            fontSize="14"
            fontWeight="600"
            textAnchor="middle"
            opacity="0.8"
            pointerEvents="none"
          >
            {cluster.name}
          </text>
          
          {/* Cluster nodes */}
          {(cluster.nodes || []).map((node) => (
            <AttackNodeComponent
              key={node.node_id}
              node={node}
              onClick={onNodeSelect}
            />
          ))}
        </g>
      ))}
    </svg>
  );
});

ClusterVisualization.displayName = "ClusterVisualization";

export default ClusterVisualization;
