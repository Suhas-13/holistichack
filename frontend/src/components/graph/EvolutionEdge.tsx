import React, { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import { motion } from 'framer-motion';
import { EvolutionType } from '../../types/graph-data-structures';
import { useUiStore } from '../../stores/uiStore';

// Edge data type
export interface EvolutionEdgeData {
  evolution_type: EvolutionType;
  animated?: boolean;
  strength?: number;
  description?: string;
}

// Evolution type colors and styles
const EVOLUTION_STYLES: Record<EvolutionType, {
  color: string;
  strokeDasharray?: string;
  strokeWidth: number;
  animated: boolean;
}> = {
  [EvolutionType.REFINEMENT]: {
    color: '#00d9ff', // Cyan
    strokeWidth: 2,
    animated: true
  },
  [EvolutionType.ESCALATION]: {
    color: '#ff0055', // Red/Magenta
    strokeWidth: 3,
    animated: true
  },
  [EvolutionType.COMBINATION]: {
    color: '#a78bfa', // Purple
    strokeWidth: 2.5,
    strokeDasharray: '5,5',
    animated: true
  },
  [EvolutionType.PIVOT]: {
    color: '#fbbf24', // Yellow
    strokeWidth: 2,
    strokeDasharray: '8,4',
    animated: false
  },
  [EvolutionType.FOLLOW_UP]: {
    color: '#00ff88', // Green
    strokeWidth: 2,
    animated: true
  }
};

// Evolution type labels
const EVOLUTION_LABELS: Record<EvolutionType, string> = {
  [EvolutionType.REFINEMENT]: 'REFINE',
  [EvolutionType.ESCALATION]: 'ESC',
  [EvolutionType.COMBINATION]: 'COMBO',
  [EvolutionType.PIVOT]: 'PIVOT',
  [EvolutionType.FOLLOW_UP]: 'FOLLOW'
};

export const EvolutionEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd
}: EdgeProps<EvolutionEdgeData>) => {
  const { animationsEnabled } = useUiStore();

  const evolutionType = data?.evolution_type || EvolutionType.REFINEMENT;
  const style = EVOLUTION_STYLES[evolutionType];
  const label = EVOLUTION_LABELS[evolutionType];

  // Calculate the bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  // Gradient ID for this edge
  const gradientId = `evolution-gradient-${id}`;

  return (
    <>
      <defs>
        {/* Animated gradient */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={style.color} stopOpacity={0.2}>
            {animationsEnabled && style.animated && (
              <animate
                attributeName="stop-opacity"
                values="0.2;0.8;0.2"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="50%" stopColor={style.color} stopOpacity={0.8}>
            {animationsEnabled && style.animated && (
              <animate
                attributeName="stop-opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor={style.color} stopOpacity={0.2}>
            {animationsEnabled && style.animated && (
              <animate
                attributeName="stop-opacity"
                values="0.2;0.8;0.2"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>

        {/* Glow filter */}
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Arrow marker */}
        <marker
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={style.color}
            fillOpacity={0.8}
          />
        </marker>
      </defs>

      {/* Background glow path */}
      <path
        d={edgePath}
        stroke={style.color}
        strokeWidth={style.strokeWidth + 4}
        strokeOpacity={0.2}
        fill="none"
        strokeDasharray={style.strokeDasharray}
        filter={`url(#glow-${id})`}
      />

      {/* Main edge path */}
      <BaseEdge
        path={edgePath}
        markerEnd={`url(#arrow-${id})`}
        style={{
          stroke: `url(#${gradientId})`,
          strokeWidth: style.strokeWidth,
          strokeDasharray: style.strokeDasharray
        }}
      />

      {/* Animated flow particles */}
      {animationsEnabled && style.animated && (
        <>
          <circle r="3" fill={style.color} fillOpacity={0.8}>
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3" fill={style.color} fillOpacity={0.8}>
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
              begin="0.5s"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="2s"
              repeatCount="indefinite"
              begin="0.5s"
            />
          </circle>
        </>
      )}

      {/* Edge Label */}
      <EdgeLabelRenderer>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`
          }}
        >
          <div
            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold backdrop-blur-sm border"
            style={{
              backgroundColor: `${style.color}20`,
              borderColor: style.color,
              color: style.color
            }}
          >
            {label}
          </div>
        </motion.div>
      </EdgeLabelRenderer>
    </>
  );
});

EvolutionEdge.displayName = 'EvolutionEdge';
