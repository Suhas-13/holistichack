/**
 * Node detail panel component (right sidebar)
 */

import type { NodeDetail } from '../types';

interface NodeDetailPanelProps {
  nodeDetails: NodeDetail | null;
  isCollapsed: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function NodeDetailPanel({
  nodeDetails,
  isCollapsed,
  onToggle,
  onClose,
}: NodeDetailPanelProps) {
  if (isCollapsed || !nodeDetails) {
    return (
      <div className="w-12 bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col items-center py-4">
        {nodeDetails && !isCollapsed && (
          <button
            onClick={onToggle}
            className="p-2 hover:bg-[var(--bg-elevated)] rounded transition-colors"
            title="Expand panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  const { node, cluster } = nodeDetails;

  // Calculate simple metrics
  const metrics = {
    generation: 0,
    depth: node.parent_ids.length,
    descendants: 0,
    successRate: node.success_score ? node.success_score / 100 : 0,
  };

  return (
    <div className="w-96 bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <h2 className="font-semibold text-lg">Node Details</h2>
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-[var(--bg-elevated)] rounded transition-colors"
            title="Collapse"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-elevated)] rounded transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">NODE ID</h3>
          <p className="font-mono text-sm">{node.node_id}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">CLUSTER</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cluster.color }} />
            <p className="font-medium">{cluster.name}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">STATUS</h3>
          <span className={'status-badge status-' + node.status}>{node.status}</span>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">ATTACK TYPE</h3>
          <p className="capitalize">{node.attack_type.replace(/_/g, ' ')}</p>
        </div>

        {node.success_score !== undefined && (
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">SUCCESS SCORE</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--status-success)]"
                  style={{ width: node.success_score + '%' }}
                />
              </div>
              <span className="text-sm font-mono">{node.success_score}%</span>
            </div>
          </div>
        )}

        {node.llm_summary && (
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">SUMMARY</h3>
            <p className="text-sm">{node.llm_summary}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">METRICS</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-elevated)] p-3 rounded">
              <div className="text-xs text-[var(--text-muted)]">Generation</div>
              <div className="text-lg font-semibold">{metrics.generation}</div>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded">
              <div className="text-xs text-[var(--text-muted)]">Depth</div>
              <div className="text-lg font-semibold">{metrics.depth}</div>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded">
              <div className="text-xs text-[var(--text-muted)]">Descendants</div>
              <div className="text-lg font-semibold">{metrics.descendants}</div>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded">
              <div className="text-xs text-[var(--text-muted)]">Success Rate</div>
              <div className="text-lg font-semibold">{(metrics.successRate * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {node.full_transcript && Array.isArray(node.full_transcript) && node.full_transcript.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">TRANSCRIPT</h3>
            <div className="bg-[var(--bg-elevated)] rounded p-3 font-mono text-xs space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {node.full_transcript.map((line: string, i: number) => (
                <div key={i} className="text-[var(--text-secondary)]">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NodeDetailPanel;
