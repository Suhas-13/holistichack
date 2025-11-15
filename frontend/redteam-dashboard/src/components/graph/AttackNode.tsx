/**
 * Custom Attack Node Component for ReactFlow
 * Displays attack nodes with status-based styling and animations
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { formatAttackTypeName, getNodeStatusColor } from '../../utils/graphTransforms';

interface AttackNodeData {
  node_id: string;
  cluster_id: string;
  attack_type: string;
  status: 'pending' | 'running' | 'success' | 'failure';
  success_score?: number;
  clusterName?: string;
  clusterColor?: string;
}

export const AttackNode = memo(({ data, selected }: NodeProps<AttackNodeData>) => {
  const statusColor = getNodeStatusColor(data.status);
  const isRunning = data.status === 'running';
  const isSuccess = data.status === 'success';

  return (
    <div
      className={`
        relative px-3 py-2 rounded-lg border-2 bg-[var(--bg-panel)]
        transition-all duration-200
        ${selected ? 'ring-2 ring-[var(--primary-cyan)] ring-offset-2 ring-offset-[var(--bg-void)]' : ''}
        ${isRunning ? 'animate-pulse-glow' : ''}
        ${isSuccess ? 'animate-shimmer' : ''}
      `}
      style={{
        borderColor: statusColor,
        minWidth: '120px',
        maxWidth: '150px',
      }}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />

      {/* Node Content */}
      <div className="flex flex-col gap-1">
        {/* Attack Type */}
        <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
          {formatAttackTypeName(data.attack_type)}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span
            className={`
              text-[10px] px-1.5 py-0.5 rounded
              ${data.status === 'running' ? 'badge-running' : ''}
              ${data.status === 'success' ? 'badge-success' : ''}
              ${data.status === 'failure' ? 'badge-failure' : ''}
              ${data.status === 'pending' ? 'badge-pending' : ''}
            `}
          >
            {data.status}
          </span>

          {/* Success Score */}
          {data.success_score !== undefined && (
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {Math.round(data.success_score * 100)}%
            </span>
          )}
        </div>

        {/* Cluster Indicator */}
        {data.clusterName && (
          <div className="text-[10px] text-[var(--text-dim)] truncate">
            {data.clusterName}
          </div>
        )}
      </div>

      {/* Running Indicator */}
      {isRunning && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--status-running)] animate-ping" />
      )}
    </div>
  );
});

AttackNode.displayName = 'AttackNode';

export default AttackNode;
