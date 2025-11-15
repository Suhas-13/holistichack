/**
 * Enhanced Node Detail Panel - Glass Box Observability
 * Shows comprehensive attack information with full transcripts and relationships
 */

import type { NodeDetail } from '../types';
import { formatAttackTypeName } from '../utils/graphTransforms';

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

  const { cluster, parents, children, incoming_links, outgoing_links } = nodeDetails;

  // Calculate metrics
  const generation = parents.length;
  const descendants = children.length;
  const successScore = nodeDetails.success_score || 0;

  // Format timestamp
  const formattedTime = nodeDetails.timestamp
    ? new Date(nodeDetails.timestamp).toLocaleTimeString()
    : 'N/A';

  return (
    <div className="w-[480px] bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: cluster.color }}
          />
          <h2 className="font-semibold text-lg">Attack Details</h2>
        </div>
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
        {/* Status Section */}
        <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wide">Status</h3>
            <span className={`status-badge status-${nodeDetails.status} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
              {nodeDetails.status}
            </span>
          </div>
          {nodeDetails.status === 'success' && successScore > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-muted)]">Attack Success Rate</span>
                <span className="text-sm font-mono font-bold text-green-400">{successScore}%</span>
              </div>
              <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${successScore}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Core Info */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">ATTACK TYPE</h3>
            <p className="font-semibold text-lg">{formatAttackTypeName(nodeDetails.attack_type)}</p>
          </div>

          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">CLUSTER</h3>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cluster.color }} />
              <p className="font-medium">{cluster.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-medium text-[var(--text-muted)] mb-1">NODE ID</h3>
              <p className="font-mono text-xs truncate">{nodeDetails.node_id}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-[var(--text-muted)] mb-1">TIME</h3>
              <p className="font-mono text-xs">{formattedTime}</p>
            </div>
          </div>

          {nodeDetails.model_id && (
            <div>
              <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">TARGET MODEL</h3>
              <p className="font-mono text-sm bg-cyan-500/10 px-3 py-2 rounded border border-cyan-500/30 text-cyan-300">
                {nodeDetails.model_id}
              </p>
            </div>
          )}
        </div>

        {/* Evolution Metrics */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30">
          <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wide mb-3">Evolution Metrics</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{generation}</div>
              <div className="text-xs text-[var(--text-muted)]">Generation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">{descendants}</div>
              <div className="text-xs text-[var(--text-muted)]">Children</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{incoming_links.length + outgoing_links.length}</div>
              <div className="text-xs text-[var(--text-muted)]">Links</div>
            </div>
          </div>
        </div>

        {/* LLM Summary */}
        {nodeDetails.llm_summary && (
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">LLM SUMMARY</h3>
            <div className="bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border-subtle)]">
              <p className="text-sm leading-relaxed">{nodeDetails.llm_summary}</p>
            </div>
          </div>
        )}

        {/* Parent Nodes */}
        {parents.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">PARENT ATTACKS ({parents.length})</h3>
            <div className="space-y-2">
              {parents.map((parent) => (
                <div
                  key={parent.node_id}
                  className="bg-[var(--bg-elevated)] rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-purple-300 truncate flex-1">
                      {parent.node_id}
                    </span>
                    <span className={`status-badge status-${parent.status} text-xs px-2 py-0.5 rounded`}>
                      {parent.status}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {formatAttackTypeName(parent.attack_type)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Child Nodes */}
        {children.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">CHILD ATTACKS ({children.length})</h3>
            <div className="space-y-2">
              {children.map((child) => (
                <div
                  key={child.node_id}
                  className="bg-[var(--bg-elevated)] rounded-lg p-3 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-cyan-300 truncate flex-1">
                      {child.node_id}
                    </span>
                    <span className={`status-badge status-${child.status} text-xs px-2 py-0.5 rounded`}>
                      {child.status}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {formatAttackTypeName(child.attack_type)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evolution Links */}
        {(incoming_links.length > 0 || outgoing_links.length > 0) && (
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">EVOLUTION LINKS</h3>
            <div className="space-y-2">
              {incoming_links.map((link) => (
                <div
                  key={link.link_id}
                  className="bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg p-3 border border-purple-500/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 rounded text-purple-300 font-mono">
                      ← IN
                    </span>
                    <span className="text-xs font-semibold text-purple-300 uppercase">
                      {link.evolution_type}
                    </span>
                  </div>
                  {link.description && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">{link.description}</p>
                  )}
                </div>
              ))}
              {outgoing_links.map((link) => (
                <div
                  key={link.link_id}
                  className="bg-gradient-to-r from-cyan-500/10 to-transparent rounded-lg p-3 border border-cyan-500/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-cyan-500/20 rounded text-cyan-300 font-mono">
                      OUT →
                    </span>
                    <span className="text-xs font-semibold text-cyan-300 uppercase">
                      {link.evolution_type}
                    </span>
                  </div>
                  {link.description && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">{link.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Transcript - Glass Box */}
        {nodeDetails.full_transcript && Array.isArray(nodeDetails.full_transcript) && nodeDetails.full_transcript.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2 flex items-center gap-2">
              <span>FULL TRANSCRIPT</span>
              <span className="text-xs px-2 py-0.5 bg-green-500/20 rounded text-green-300">
                Glass Box
              </span>
            </h3>
            <div className="bg-black/50 rounded-lg p-4 border border-green-500/30 font-mono text-xs space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {nodeDetails.full_transcript.map((message: string, i: number) => {
                const isUser = i % 2 === 0;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded ${
                      isUser
                        ? 'bg-blue-500/10 border-l-2 border-blue-400'
                        : 'bg-purple-500/10 border-l-2 border-purple-400'
                    }`}
                  >
                    <div className={`text-xs mb-1 font-bold ${isUser ? 'text-blue-300' : 'text-purple-300'}`}>
                      {isUser ? '👤 User' : '🤖 Assistant'}
                    </div>
                    <div className="text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                      {message}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Raw Trace Data */}
        {nodeDetails.full_trace && (
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">RAW TRACE DATA</h3>
            <details className="bg-black/50 rounded-lg border border-[var(--border-subtle)]">
              <summary className="p-3 cursor-pointer hover:bg-white/5 transition-colors text-xs font-mono">
                View Raw JSON
              </summary>
              <pre className="p-4 text-xs overflow-x-auto custom-scrollbar">
                {JSON.stringify(nodeDetails.full_trace, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default NodeDetailPanel;
