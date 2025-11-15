/**
 * Cluster Group Node - Clean circular visual container for attack clusters
 * Sharp, modern design with geometric patterns
 */

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';

interface ClusterNodeData {
  label: string;
  color: string;
  cluster_id: string;
}

export const ClusterNode = memo(({ data }: NodeProps<ClusterNodeData>) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-visible">
      {/* Outer circle with sharp gradient */}
      <div
        className="absolute inset-0 rounded-full border-[3px] transition-all"
        style={{
          borderColor: `${data.color}50`,
          background: `conic-gradient(from 0deg at 50% 50%, ${data.color}08 0deg, transparent 90deg, ${data.color}08 180deg, transparent 270deg, ${data.color}08 360deg)`,
        }}
      />

      {/* Middle circle - stronger border */}
      <div
        className="absolute inset-8 rounded-full border-2"
        style={{
          borderColor: `${data.color}70`,
          background: `radial-gradient(circle at 50% 50%, ${data.color}05 0%, transparent 70%)`,
        }}
      />

      {/* Inner circle - accent */}
      <div
        className="absolute inset-16 rounded-full border"
        style={{
          borderColor: `${data.color}40`,
        }}
      />

      {/* Corner decorative dots - sharp, no blur */}
      <div
        className="absolute top-4 right-4 w-3 h-3 rounded-full"
        style={{ backgroundColor: `${data.color}80` }}
      />
      <div
        className="absolute bottom-4 left-4 w-3 h-3 rounded-full"
        style={{ backgroundColor: `${data.color}80` }}
      />
      <div
        className="absolute top-4 left-4 w-2 h-2 rounded-full"
        style={{ backgroundColor: `${data.color}60` }}
      />
      <div
        className="absolute bottom-4 right-4 w-2 h-2 rounded-full"
        style={{ backgroundColor: `${data.color}60` }}
      />

      {/* Cluster Label - Clean, centered */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div
          className="px-10 py-4 rounded-xl font-bold text-2xl border-2"
          style={{
            backgroundColor: `${data.color}20`,
            borderColor: `${data.color}`,
            color: '#ffffff',
            boxShadow: `0 4px 20px ${data.color}30`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-transparent"
              style={{
                backgroundColor: data.color,
                ringColor: `${data.color}50`,
              }}
            />
            <span className="tracking-wide">{data.label}</span>
          </div>
        </div>
      </div>

      {/* Grid pattern overlay - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`grid-${data.cluster_id}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={data.color} strokeWidth="0.5" />
          </pattern>
        </defs>
        <circle cx="50%" cy="50%" r="45%" fill={`url(#grid-${data.cluster_id})`} />
      </svg>
    </div>
  );
});

ClusterNode.displayName = 'ClusterNode';

export default ClusterNode;
