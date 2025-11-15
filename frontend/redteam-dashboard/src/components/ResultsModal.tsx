/**
 * Results modal component
 */

import type { AttackSummary, GraphState } from '../types';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: AttackSummary | null;
  graphState: GraphState | null;
}

export function ResultsModal({
  isOpen,
  onClose,
  summary,
}: ResultsModalProps) {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <h2 className="text-2xl font-bold text-gradient-cyan">Attack Complete</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-elevated)] rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-medium)]">
              <div className="text-sm text-[var(--text-muted)] mb-1">Total Attempts</div>
              <div className="text-3xl font-bold text-[var(--primary-cyan)]">
                {summary.total_attempts}
              </div>
            </div>

            <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-medium)]">
              <div className="text-sm text-[var(--text-muted)] mb-1">Successful</div>
              <div className="text-3xl font-bold text-[var(--status-success)]">
                {summary.successful_attempts}
              </div>
            </div>

            <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-medium)]">
              <div className="text-sm text-[var(--text-muted)] mb-1">Failed</div>
              <div className="text-3xl font-bold text-[var(--status-failure)]">
                {summary.failed_attempts}
              </div>
            </div>

            <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-medium)]">
              <div className="text-sm text-[var(--text-muted)] mb-1">Avg Score</div>
              <div className="text-3xl font-bold text-[var(--primary-purple)]">
                {summary.avg_success_score.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-medium)]">
            <div className="text-sm text-[var(--text-muted)] mb-2">Success Rate</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-[var(--bg-void)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--status-success)] to-[var(--primary-cyan)] glow-success"
                  style={{
                    width: ((summary.successful_attempts / summary.total_attempts) * 100) + '%',
                  }}
                />
              </div>
              <span className="text-lg font-bold text-[var(--status-success)]">
                {((summary.successful_attempts / summary.total_attempts) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-medium)]">
            <div className="text-sm text-[var(--text-muted)] mb-2">Duration</div>
            <div className="text-xl font-mono">
              {Math.floor(summary.elapsed_time_seconds / 60)}m {summary.elapsed_time_seconds % 60}s
            </div>
          </div>

          {summary.best_attack && (
            <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-medium)]">
              <div className="text-sm text-[var(--text-muted)] mb-2">Best Attack</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Node ID:</span>
                  <span className="font-mono text-sm">{summary.best_attack.node_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Attack Type:</span>
                  <span className="capitalize">{summary.best_attack.attack_type.replace(/_/g, ' ')}</span>
                </div>
                {summary.best_attack.success_score && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Score:</span>
                    <span className="font-bold text-[var(--status-success)]">
                      {summary.best_attack.success_score}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[var(--border-subtle)]">
          <button onClick={onClose} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsModal;
