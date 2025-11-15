/**
 * Custom Attack Node Component for ReactFlow
 * Stunning hackathon-quality visualization for red-teaming attacks
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { formatAttackTypeName } from '../../utils/graphTransforms';

interface AttackNodeData {
  node_id: string;
  cluster_id: string;
  attack_type: string;
  status: 'pending' | 'running' | 'success' | 'failure';
  success_score?: number;
  clusterName?: string;
  clusterColor?: string;
  llm_summary?: string;
  parent_ids?: string[];
  timestamp?: number;
  model_id?: string;
}

export const AttackNode = memo(({ data, selected }: NodeProps<AttackNodeData>) => {
  const isRunning = data.status === 'running';
  const isSuccess = data.status === 'success';
  const isFailure = data.status === 'failure';
  const isPending = data.status === 'pending';

  // Get status styling
  const getStatusGradient = () => {
    if (isSuccess) return 'from-green-500/20 to-emerald-500/20 border-green-400';
    if (isFailure) return 'from-red-500/20 to-pink-500/20 border-red-400';
    if (isRunning) return 'from-cyan-500/20 to-blue-500/20 border-cyan-400';
    return 'from-gray-500/20 to-slate-500/20 border-gray-500';
  };

  const getStatusIcon = () => {
    if (isSuccess) return '✓';
    if (isFailure) return '✗';
    if (isRunning) return '⚡';
    return '○';
  };

  return (
    <div
      className={`
        relative rounded-lg overflow-hidden
        bg-gradient-to-br ${getStatusGradient()}
        border-2
        transition-all duration-300 ease-out
        ${selected ? 'ring-4 ring-cyan-400/70 scale-110 shadow-xl' : 'shadow-md'}
        ${isRunning ? 'animate-pulse' : ''}
        hover:scale-105 hover:shadow-lg cursor-pointer
        group
      `}
      style={{
        width: '200px',
        height: '140px',
        background: `linear-gradient(135deg, ${data.clusterColor}12 0%, rgba(10, 14, 20, 0.95) 100%)`,
        borderColor: `${data.clusterColor}60`,
      }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-cyan-400 border-2 border-cyan-300"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-purple-400 border-2 border-purple-300"
        style={{ bottom: -6 }}
      />

      {/* Glowing border animation for running */}
      {isRunning && (
        <div className="absolute inset-0 border-2 border-cyan-400 rounded-xl animate-pulse" />
      )}

      {/* Success glow */}
      {isSuccess && (
        <div className="absolute inset-0 bg-green-400/10 animate-pulse" />
      )}

      {/* Node Content */}
      <div className="relative h-full p-3 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          {/* Status Icon */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold
            ${isSuccess ? 'bg-green-500/30 text-green-300' : ''}
            ${isFailure ? 'bg-red-500/30 text-red-300' : ''}
            ${isRunning ? 'bg-cyan-500/30 text-cyan-300 animate-pulse' : ''}
            ${isPending ? 'bg-gray-500/30 text-gray-400' : ''}
          `}>
            {getStatusIcon()}
          </div>

          {/* Attack Type & Metadata */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-white truncate leading-tight">
              {formatAttackTypeName(data.attack_type)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {data.parent_ids && data.parent_ids.length > 0 && (
                <span className="text-[9px] text-purple-300 font-mono">
                  Gen {data.parent_ids.length}
                </span>
              )}
              {data.model_id && (
                <span className="text-[9px] text-cyan-300 truncate max-w-[80px]">
                  {data.model_id}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Glass Box: LLM Summary Preview */}
        {data.llm_summary && (
          <div className="my-1 px-2 py-1.5 bg-black/30 rounded text-[9px] text-gray-300 line-clamp-2 leading-snug">
            {data.llm_summary}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-end justify-between gap-2">
          {/* Status Badge */}
          <div className={`
            px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide
            ${isSuccess ? 'bg-green-500/40 text-green-200' : ''}
            ${isFailure ? 'bg-red-500/40 text-red-200' : ''}
            ${isRunning ? 'bg-cyan-500/40 text-cyan-200' : ''}
            ${isPending ? 'bg-gray-500/40 text-gray-300' : ''}
          `}>
            {data.status}
          </div>

          {/* Success Score */}
          {data.success_score !== undefined && isSuccess && (
            <div className="text-right">
              <div className="text-xl font-bold text-green-300 leading-none font-mono">
                {Math.round(data.success_score * 100)}%
              </div>
              <div className="text-[8px] text-gray-400 uppercase tracking-wide">ASR</div>
            </div>
          )}
        </div>

        {/* Running pulse indicator */}
        {isRunning && (
          <>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
          </>
        )}

        {/* Success indicator - clean corner accent */}
        {isSuccess && (
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-green-400/30 border-r-transparent" />
        )}
      </div>
    </div>
  );
});

AttackNode.displayName = 'AttackNode';

export default AttackNode;
