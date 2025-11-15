import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { GraphNode, NodeStatus, AttackType } from '../../types/graph-data-structures';
import { useUiStore } from '../../stores/uiStore';
import { cn } from '../../utils/cn';

// Node data type for ReactFlow
export interface AttackNodeData extends GraphNode {
  label?: string;
}

// Status color mapping
const STATUS_COLORS = {
  [NodeStatus.PENDING]: {
    bg: 'bg-gray-700',
    border: 'border-gray-500',
    glow: 'shadow-gray-500/20',
    text: 'text-gray-400'
  },
  [NodeStatus.IN_PROGRESS]: {
    bg: 'bg-cyan-900/40',
    border: 'border-cyan-400',
    glow: 'shadow-cyan-400/50',
    text: 'text-cyan-400',
    pulse: true
  },
  [NodeStatus.SUCCESS]: {
    bg: 'bg-green-900/40',
    border: 'border-green-400',
    glow: 'shadow-green-400/60',
    text: 'text-green-400'
  },
  [NodeStatus.PARTIAL]: {
    bg: 'bg-yellow-900/40',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-400/50',
    text: 'text-yellow-400'
  },
  [NodeStatus.FAILED]: {
    bg: 'bg-red-900/40',
    border: 'border-red-500',
    glow: 'shadow-red-500/40',
    text: 'text-red-400'
  },
  [NodeStatus.ERROR]: {
    bg: 'bg-purple-900/40',
    border: 'border-purple-500',
    glow: 'shadow-purple-500/40',
    text: 'text-purple-400'
  }
};

// Attack type icons
const ATTACK_TYPE_ICONS: Record<AttackType, string> = {
  [AttackType.BASE64_ENCODING]: '🔐',
  [AttackType.ROLE_PLAY]: '🎭',
  [AttackType.JAILBREAK]: '⚡',
  [AttackType.PROMPT_INJECTION]: '💉',
  [AttackType.MODEL_EXTRACTION]: '📤',
  [AttackType.SYSTEM_PROMPT_LEAK]: '🔓',
  [AttackType.FUNCTION_ENUMERATION]: '🔍',
  [AttackType.ERROR_EXPLOITATION]: '💥',
  [AttackType.UNICODE_BYPASS]: '🌐',
  [AttackType.MULTI_TURN]: '🔄'
};

// Attack type short labels
const ATTACK_TYPE_LABELS: Record<AttackType, string> = {
  [AttackType.BASE64_ENCODING]: 'B64',
  [AttackType.ROLE_PLAY]: 'ROLE',
  [AttackType.JAILBREAK]: 'JAIL',
  [AttackType.PROMPT_INJECTION]: 'INJ',
  [AttackType.MODEL_EXTRACTION]: 'EXTR',
  [AttackType.SYSTEM_PROMPT_LEAK]: 'LEAK',
  [AttackType.FUNCTION_ENUMERATION]: 'ENUM',
  [AttackType.ERROR_EXPLOITATION]: 'ERR',
  [AttackType.UNICODE_BYPASS]: 'UNI',
  [AttackType.MULTI_TURN]: 'TURN'
};

export const AttackNode = memo(({ data, selected }: NodeProps<AttackNodeData>) => {
  const { hoveredNodeId, setHoveredNodeId, selectedNodeId, setSelectedNodeId, animationsEnabled } = useUiStore();

  const isHovered = hoveredNodeId === data.node_id;
  const isSelected = selectedNodeId === data.node_id || selected;

  const statusStyle = STATUS_COLORS[data.status];
  const icon = ATTACK_TYPE_ICONS[data.attack_type];
  const label = ATTACK_TYPE_LABELS[data.attack_type];

  // Calculate node size based on success score
  const nodeSize = useMemo(() => {
    const baseSize = 60;
    const successMultiplier = data.success_score ? 1 + (data.success_score / 200) : 1;
    return baseSize * successMultiplier;
  }, [data.success_score]);

  // Animation variants
  const nodeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    selected: {
      scale: 1.15,
      transition: { duration: 0.2 }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const glowVariants = {
    glow: {
      boxShadow: [
        `0 0 20px ${statusStyle.glow}`,
        `0 0 40px ${statusStyle.glow}`,
        `0 0 20px ${statusStyle.glow}`
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-cyan-400/50 !border-2 !border-cyan-400"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-cyan-400/50 !border-2 !border-cyan-400"
        style={{ bottom: -6 }}
      />

      {/* Node Container */}
      <motion.div
        variants={animationsEnabled ? nodeVariants : {}}
        initial="initial"
        animate={
          isSelected
            ? 'selected'
            : isHovered
            ? 'hover'
            : data.status === NodeStatus.IN_PROGRESS && animationsEnabled
            ? 'pulse'
            : 'animate'
        }
        onHoverStart={() => setHoveredNodeId(data.node_id)}
        onHoverEnd={() => setHoveredNodeId(null)}
        onClick={() => setSelectedNodeId(data.node_id)}
        className={cn(
          'relative rounded-xl border-2 cursor-pointer transition-all duration-300',
          'backdrop-blur-sm',
          statusStyle.bg,
          statusStyle.border,
          isSelected && 'ring-4 ring-cyan-400/50',
          isHovered && 'ring-2 ring-white/30'
        )}
        style={{
          width: nodeSize,
          height: nodeSize,
          boxShadow: statusStyle.glow
        }}
      >
        {/* Glow effect for success */}
        {data.status === NodeStatus.SUCCESS && animationsEnabled && (
          <motion.div
            variants={glowVariants}
            animate="glow"
            className="absolute inset-0 rounded-xl"
          />
        )}

        {/* Pulse effect for running */}
        {data.status === NodeStatus.IN_PROGRESS && animationsEnabled && (
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            className="absolute inset-0 rounded-xl bg-cyan-400/20"
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-2">
          {/* Icon */}
          <div className="text-2xl mb-1">{icon}</div>

          {/* Attack Type Label */}
          <div
            className={cn(
              'text-xs font-mono font-bold tracking-wider',
              statusStyle.text
            )}
          >
            {label}
          </div>

          {/* Success Score */}
          {data.success_score !== undefined && data.success_score > 0 && (
            <div className="text-[10px] font-mono text-white/60 mt-1">
              {data.success_score}%
            </div>
          )}

          {/* Status Indicator Dot */}
          <div className="absolute top-1 right-1">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                statusStyle.border.replace('border-', 'bg-')
              )}
            />
          </div>

          {/* Model ID Badge (if extracted) */}
          {data.model_id && (
            <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[8px] font-mono px-1.5 py-0.5 rounded-full border border-purple-400">
              {data.model_id.split('-')[0]}
            </div>
          )}
        </div>

        {/* Node ID (on hover) */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap"
          >
            {data.node_id.slice(0, 8)}
          </motion.div>
        )}
      </motion.div>
    </>
  );
});

AttackNode.displayName = 'AttackNode';
