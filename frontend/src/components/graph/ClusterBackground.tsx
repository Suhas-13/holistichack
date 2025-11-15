import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GraphCluster, NodeLayout } from '../../types/graph-data-structures';
import { useUiStore } from '../../stores/uiStore';

interface ClusterBackgroundProps {
  cluster: GraphCluster;
  nodeLayouts: NodeLayout[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

export const ClusterBackground = memo(({
  cluster,
  nodeLayouts,
  viewport
}: ClusterBackgroundProps) => {
  const { showClusterBackgrounds, animationsEnabled } = useUiStore();

  // Calculate bounding box for cluster nodes
  const bounds = useMemo(() => {
    if (nodeLayouts.length === 0) {
      return {
        minX: cluster.position_hint.x - 100,
        maxX: cluster.position_hint.x + 100,
        minY: cluster.position_hint.y - 100,
        maxY: cluster.position_hint.y + 100
      };
    }

    const positions = nodeLayouts.map(layout => layout.position);
    const padding = 40;

    return {
      minX: Math.min(...positions.map(p => p.x)) - padding,
      maxX: Math.max(...positions.map(p => p.x)) + padding,
      minY: Math.min(...positions.map(p => p.y)) - padding,
      maxY: Math.max(...positions.map(p => p.y)) + padding
    };
  }, [nodeLayouts, cluster.position_hint]);

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const centerX = bounds.minX + width / 2;
  const centerY = bounds.minY + height / 2;

  if (!showClusterBackgrounds || cluster.collapsed || !cluster.visible) {
    return null;
  }

  return (
    <g transform={`translate(${centerX}, ${centerY})`}>
      {/* Background rectangle with glass morphism */}
      <motion.rect
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={20}
        ry={20}
        fill={`${cluster.color}10`}
        stroke={cluster.color}
        strokeWidth={2}
        strokeOpacity={0.3}
        strokeDasharray="10,5"
        className="pointer-events-none"
      />

      {/* Inner glow */}
      <rect
        x={-width / 2 + 5}
        y={-height / 2 + 5}
        width={width - 10}
        height={height - 10}
        rx={15}
        ry={15}
        fill="none"
        stroke={cluster.color}
        strokeWidth={1}
        strokeOpacity={0.1}
        className="pointer-events-none"
      />

      {/* Animated gradient overlay */}
      {animationsEnabled && (
        <>
          <defs>
            <radialGradient id={`cluster-grad-${cluster.cluster_id}`}>
              <stop offset="0%" stopColor={cluster.color} stopOpacity={0.15}>
                <animate
                  attributeName="stop-opacity"
                  values="0.15;0.25;0.15"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={cluster.color} stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            rx={20}
            ry={20}
            fill={`url(#cluster-grad-${cluster.cluster_id})`}
            className="pointer-events-none"
          />
        </>
      )}

      {/* Cluster label */}
      <motion.g
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Label background */}
        <rect
          x={-width / 2}
          y={-height / 2 - 35}
          width={Math.max(cluster.name.length * 8 + 20, 100)}
          height={24}
          rx={12}
          ry={12}
          fill="#0a0e14"
          stroke={cluster.color}
          strokeWidth={1.5}
          strokeOpacity={0.6}
        />

        {/* Label text */}
        <text
          x={-width / 2 + 10}
          y={-height / 2 - 18}
          fill={cluster.color}
          fontSize={12}
          fontWeight="bold"
          fontFamily="monospace"
          className="uppercase tracking-wider"
        >
          {cluster.name}
        </text>
      </motion.g>

      {/* Stats badge */}
      {(cluster.total_attacks || 0) > 0 && (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <rect
            x={width / 2 - 60}
            y={-height / 2 - 35}
            width={55}
            height={24}
            rx={12}
            ry={12}
            fill="#0a0e14"
            stroke={cluster.color}
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          <text
            x={width / 2 - 52}
            y={-height / 2 - 18}
            fill={cluster.color}
            fontSize={10}
            fontFamily="monospace"
            fontWeight="bold"
          >
            {cluster.successful_attacks || 0}/{cluster.total_attacks || 0}
          </text>
        </motion.g>
      )}

      {/* Corner accents */}
      <g stroke={cluster.color} strokeWidth={2} strokeOpacity={0.4} fill="none">
        {/* Top-left */}
        <path d={`M ${-width/2 + 20} ${-height/2} L ${-width/2} ${-height/2} L ${-width/2} ${-height/2 + 20}`} />
        {/* Top-right */}
        <path d={`M ${width/2 - 20} ${-height/2} L ${width/2} ${-height/2} L ${width/2} ${-height/2 + 20}`} />
        {/* Bottom-left */}
        <path d={`M ${-width/2 + 20} ${height/2} L ${-width/2} ${height/2} L ${-width/2} ${height/2 - 20}`} />
        {/* Bottom-right */}
        <path d={`M ${width/2 - 20} ${height/2} L ${width/2} ${height/2} L ${width/2} ${height/2 - 20}`} />
      </g>

      {/* Animated particles (optional, for extra flair) */}
      {animationsEnabled && cluster.successful_attacks && cluster.successful_attacks > 0 && (
        <>
          {[...Array(3)].map((_, i) => (
            <circle
              key={i}
              r="2"
              fill={cluster.color}
              fillOpacity={0.6}
            >
              <animate
                attributeName="cx"
                values={`${-width/2};${width/2}`}
                dur={`${8 + i * 2}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${-height/2 + i * 20};${height/2 - i * 20}`}
                dur={`${8 + i * 2}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.6;0"
                dur={`${8 + i * 2}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </>
      )}
    </g>
  );
});

ClusterBackground.displayName = 'ClusterBackground';
