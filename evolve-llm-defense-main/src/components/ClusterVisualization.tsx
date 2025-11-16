import { memo, useMemo } from "react";
import { AttackNode, ClusterData } from "@/types/evolution";
import AttackNodeComponent from "./AttackNodeComponent";

interface ClusterVisualizationProps {
  clusters: ClusterData[];
  onNodeSelect: (node: AttackNode) => void;
}

const ClusterVisualization = memo(({ clusters, onNodeSelect }: ClusterVisualizationProps) => {
  console.log("[ClusterVisualization] Rendering with clusters:", clusters.length);
  clusters.forEach((c) => {
    console.log(`[ClusterVisualization] Cluster ${c.name}: ${c.nodes?.length || 0} nodes`);
  });
  
  const connectionLines = useMemo(() => {
    return clusters.flatMap((cluster) =>
      (cluster.nodes || []).flatMap((node) =>
        node.parent_ids.map((parentId) => {
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
          };
        }).filter(Boolean)
      )
    );
  }, [clusters]);
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
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Render connection lines between parent-child nodes */}
      {connectionLines.map((line) => line && (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="url(#link-gradient)"
          strokeWidth="2"
          style={{ filter: "url(#glow)" }}
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
            r={80}
            fill={cluster.color || "hsl(189, 94%, 55%)"}
            opacity="0.1"
            pointerEvents="none"
          />
          
          {/* Cluster label */}
          <text
            x={cluster.position_hint.x}
            y={cluster.position_hint.y - 95}
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
