import { motion } from 'framer-motion';
import { useAttackStore } from '../../stores/attackStore';
import { useGraphStore } from '../../stores/graphStore';

/**
 * TopBar Component
 *
 * Top navigation bar displaying:
 * - Logo and title
 * - Live WebSocket connection status
 * - Attack progress (generation, node count)
 * - Real-time metrics (success rate, etc.)
 * - Minimal, clean design
 */
export function TopBar() {
  const { attackStatus, wsStatus, currentGeneration, totalNodes } = useAttackStore();
  const getStats = useGraphStore((state) => state.getStats);

  const stats = getStats();
  const isActive = attackStatus === 'running';
  const isConnected = wsStatus === 'connected';

  return (
    <header className="h-16 bg-surface border-b border-subtle flex items-center justify-between px-6 backdrop-blur-sm">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <div className="font-mono">
          <div className="text-xl font-bold tracking-wide text-primary-cyan leading-none">
            REDTEAM
          </div>
          <div className="text-xs text-text-secondary tracking-widest">
            EVOLUTION
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-3 px-4 py-2 bg-elevated rounded-lg border border-subtle">
        {/* Connection Status Dot */}
        <motion.div
          className={`w-3 h-3 rounded-full ${
            isConnected
              ? 'bg-status-success'
              : wsStatus === 'connecting'
              ? 'bg-status-running'
              : wsStatus === 'error'
              ? 'bg-status-failure'
              : 'bg-text-muted'
          }`}
          animate={
            isActive && isConnected
              ? {
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Status Text */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium uppercase tracking-wide text-text-primary">
            {attackStatus === 'running'
              ? 'Active'
              : attackStatus === 'paused'
              ? 'Paused'
              : attackStatus === 'completed'
              ? 'Completed'
              : attackStatus === 'error'
              ? 'Error'
              : 'Idle'}
          </span>

          {isActive && (
            <>
              <span className="text-text-muted">|</span>
              <span className="text-xs text-text-muted font-mono">
                Gen {currentGeneration}
              </span>
              <span className="text-text-muted">|</span>
              <span className="text-xs text-text-muted font-mono">
                {totalNodes} nodes
              </span>
            </>
          )}
        </div>
      </div>

      {/* Metrics Ticker */}
      {stats.total_nodes > 0 && (
        <div className="flex-1 flex items-center justify-center gap-8 font-mono text-sm">
          <Metric
            label="Success Rate"
            value={`${Math.round(stats.success_rate)}%`}
            trend={stats.success_rate > 50 ? 'up' : stats.success_rate > 0 ? 'neutral' : undefined}
            color={stats.success_rate > 50 ? 'text-status-success' : 'text-primary-cyan'}
          />

          <Metric
            label="Total Nodes"
            value={stats.total_nodes.toString()}
            color="text-primary-cyan"
          />

          <Metric
            label="Clusters"
            value={stats.total_clusters.toString()}
            color="text-primary-purple"
          />

          {stats.avg_evolution_depth > 0 && (
            <Metric
              label="Avg Depth"
              value={stats.avg_evolution_depth.toFixed(1)}
              color="text-primary-cyan"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* WebSocket Connection Indicator */}
        <div
          className="px-3 py-1.5 rounded-lg border border-subtle bg-elevated/50 flex items-center gap-2"
          title={`WebSocket: ${wsStatus}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-status-success'
                : wsStatus === 'connecting'
                ? 'bg-status-running animate-pulse'
                : 'bg-text-muted'
            }`}
          />
          <span className="text-xs font-mono text-text-muted uppercase">
            {isConnected ? 'Live' : wsStatus === 'connecting' ? 'Connecting' : 'Offline'}
          </span>
        </div>

        {/* Settings Button (optional) */}
        <button
          className="p-2 hover:bg-elevated rounded-lg transition-colors"
          title="Settings"
        >
          <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

/**
 * Metric display component
 */
interface MetricProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

function Metric({ label, value, trend, color = 'text-primary-cyan' }: MetricProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-muted whitespace-nowrap">{label}:</span>
      <span className={`font-semibold ${color} whitespace-nowrap`}>{value}</span>
      {trend && (
        <span
          className={
            trend === 'up'
              ? 'text-status-success'
              : trend === 'down'
              ? 'text-status-failure'
              : 'text-text-muted'
          }
        >
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
        </span>
      )}
    </div>
  );
}
