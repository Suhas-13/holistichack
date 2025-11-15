/**
 * Top navigation bar component
 */

import type { AttackStatus } from '../../types';

interface TopBarProps {
  attackStatus: AttackStatus;
  generation?: number;
  nodeCount?: number;
  successRate?: number;
  avgFitness?: number;
}

export function TopBar({
  attackStatus,
  generation = 0,
  nodeCount = 0,
  successRate = 0,
  avgFitness = 0,
}: TopBarProps) {
  const statusColor =
    attackStatus === 'active'
      ? 'bg-[var(--status-running)] animate-pulse-glow'
      : attackStatus === 'completed'
      ? 'bg-[var(--status-success)]'
      : 'bg-[var(--status-pending)]';

  return (
    <header className="h-16 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-[var(--primary-cyan)] to-[var(--primary-purple)] flex items-center justify-center font-bold text-[var(--bg-void)]">
          R
        </div>
        <div className="font-mono">
          <div className="text-lg font-bold text-[var(--primary-cyan)] tracking-wide">
            REDTEAM EVOLUTION
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            Attack Visualization Dashboard
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-medium)]">
          <div className={'w-2.5 h-2.5 rounded-full ' + statusColor} />
          <span className="text-sm font-medium capitalize">{attackStatus}</span>
        </div>

        <div className="flex items-center gap-6 font-mono text-sm">
          <div className="text-center">
            <div className="text-[var(--text-muted)] text-xs">Generation</div>
            <div className="text-[var(--text-primary)] font-semibold">{generation}</div>
          </div>
          <div className="text-center">
            <div className="text-[var(--text-muted)] text-xs">Nodes</div>
            <div className="text-[var(--text-primary)] font-semibold">{nodeCount}</div>
          </div>
          <div className="text-center">
            <div className="text-[var(--text-muted)] text-xs">Success</div>
            <div className="text-[var(--status-success)] font-semibold">
              {(successRate * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-[var(--text-muted)] text-xs">Avg Fitness</div>
            <div className="text-[var(--text-primary)] font-semibold">
              {avgFitness.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
