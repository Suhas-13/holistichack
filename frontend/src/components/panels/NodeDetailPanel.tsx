import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../../stores/graphStore';
import { useUiStore } from '../../stores/uiStore';
import { NodeStatus, AttackType } from '../../types/graph';

type TabType = 'overview' | 'transcript' | 'raw';

/**
 * Status color mapping
 */
const STATUS_COLORS: Record<NodeStatus, string> = {
  [NodeStatus.PENDING]: 'bg-status-pending',
  [NodeStatus.IN_PROGRESS]: 'bg-status-running',
  [NodeStatus.SUCCESS]: 'bg-status-success',
  [NodeStatus.PARTIAL]: 'bg-primary-purple',
  [NodeStatus.FAILED]: 'bg-status-failure',
  [NodeStatus.ERROR]: 'bg-status-critical'
};

/**
 * Status label mapping
 */
const STATUS_LABELS: Record<NodeStatus, string> = {
  [NodeStatus.PENDING]: 'Pending',
  [NodeStatus.IN_PROGRESS]: 'In Progress',
  [NodeStatus.SUCCESS]: 'Success',
  [NodeStatus.PARTIAL]: 'Partial',
  [NodeStatus.FAILED]: 'Failed',
  [NodeStatus.ERROR]: 'Error'
};

/**
 * Attack type label mapping
 */
const ATTACK_TYPE_LABELS: Record<AttackType, string> = {
  [AttackType.BASE64_ENCODING]: 'Base64 Encoding',
  [AttackType.ROLE_PLAY]: 'Role Play',
  [AttackType.JAILBREAK]: 'Jailbreak',
  [AttackType.PROMPT_INJECTION]: 'Prompt Injection',
  [AttackType.MODEL_EXTRACTION]: 'Model Extraction',
  [AttackType.SYSTEM_PROMPT_LEAK]: 'System Prompt Leak',
  [AttackType.FUNCTION_ENUMERATION]: 'Function Enumeration',
  [AttackType.ERROR_EXPLOITATION]: 'Error Exploitation',
  [AttackType.UNICODE_BYPASS]: 'Unicode Bypass',
  [AttackType.MULTI_TURN]: 'Multi-Turn'
};

/**
 * NodeDetailPanel Component
 *
 * Right sidebar displaying detailed information about selected node
 * Features:
 * - Overview tab: node metadata and summary
 * - Transcript tab: full conversation with syntax highlighting
 * - Raw Data tab: JSON trace data
 * - Smooth slide-in animation
 * - Close button
 */
export function NodeDetailPanel() {
  const selectedNodeId = useUiStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useUiStore((state) => state.setSelectedNodeId);
  const getNodeDetail = useGraphStore((state) => state.getNodeDetail);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [transcriptExpanded, setTranscriptExpanded] = useState(true);
  const [rawDataExpanded, setRawDataExpanded] = useState(false);

  const nodeDetail = selectedNodeId ? getNodeDetail(selectedNodeId) : null;

  const handleClose = () => {
    setSelectedNodeId(null);
  };

  const handleExport = () => {
    if (!nodeDetail) return;

    const data = {
      node_id: nodeDetail.node_id,
      attack_type: nodeDetail.attack_type,
      status: nodeDetail.status,
      cluster: nodeDetail.cluster.name,
      timestamp: nodeDetail.timestamp,
      model_id: nodeDetail.model_id,
      llm_summary: nodeDetail.llm_summary,
      transcript: nodeDetail.full_transcript,
      trace: nodeDetail.full_trace,
      success_score: nodeDetail.success_score
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `node-${nodeDetail.node_id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence mode="wait">
      {nodeDetail ? (
        <motion.div
          key="detail"
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0.0, 0.2, 1]
          }}
          className="w-96 h-full bg-surface border-l border-subtle flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-subtle">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-primary-cyan mb-2">
                  Node Details
                </h2>
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`w-3 h-3 rounded-full ${STATUS_COLORS[nodeDetail.status]}`}
                    animate={nodeDetail.status === NodeStatus.IN_PROGRESS ? {
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="font-mono text-sm text-text-primary font-semibold">
                    {nodeDetail.node_id}
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-elevated rounded-lg transition-colors"
                title="Close panel"
              >
                <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-px glow-divider" />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-subtle px-6">
            {(['overview', 'transcript', 'raw'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium uppercase tracking-wide transition-colors relative ${
                  activeTab === tab
                    ? 'text-primary-cyan'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Status */}
                  <InfoRow
                    label="Status"
                    value={
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        nodeDetail.status === NodeStatus.SUCCESS
                          ? 'bg-status-success/20 text-status-success'
                          : nodeDetail.status === NodeStatus.FAILED
                          ? 'bg-status-failure/20 text-status-failure'
                          : nodeDetail.status === NodeStatus.IN_PROGRESS
                          ? 'bg-status-running/20 text-status-running'
                          : 'bg-status-pending/20 text-status-pending'
                      }`}>
                        {STATUS_LABELS[nodeDetail.status]}
                      </span>
                    }
                  />

                  {/* Attack Type */}
                  <InfoRow
                    label="Attack Type"
                    value={ATTACK_TYPE_LABELS[nodeDetail.attack_type]}
                  />

                  {/* Cluster */}
                  <InfoRow
                    label="Cluster"
                    value={
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: nodeDetail.cluster.color }}
                        />
                        {nodeDetail.cluster.name}
                      </span>
                    }
                  />

                  {/* Timestamp */}
                  <InfoRow
                    label="Timestamp"
                    value={new Date(nodeDetail.timestamp).toLocaleString()}
                  />

                  {/* Model ID */}
                  {nodeDetail.model_id && (
                    <InfoRow
                      label="Model ID"
                      value={<code className="font-mono text-primary-cyan">{nodeDetail.model_id}</code>}
                    />
                  )}

                  {/* Success Score */}
                  {nodeDetail.success_score !== undefined && (
                    <InfoRow
                      label="Success Score"
                      value={
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${nodeDetail.success_score}%` }}
                              className="h-full bg-gradient-to-r from-status-failure via-status-running to-status-success"
                            />
                          </div>
                          <span className="font-mono text-sm">{nodeDetail.success_score}%</span>
                        </div>
                      }
                    />
                  )}

                  {/* Parents & Children */}
                  {nodeDetail.parents.length > 0 && (
                    <InfoRow
                      label="Parent Nodes"
                      value={nodeDetail.parents.map(p => p.node_id).join(', ')}
                    />
                  )}

                  {nodeDetail.children.length > 0 && (
                    <InfoRow
                      label="Child Nodes"
                      value={`${nodeDetail.children.length} nodes`}
                    />
                  )}

                  {/* LLM Summary */}
                  {nodeDetail.llm_summary && (
                    <div className="glass-panel p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-2">
                        Summary
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {nodeDetail.llm_summary}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'transcript' && (
                <motion.div
                  key="transcript"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {nodeDetail.full_transcript && nodeDetail.full_transcript.length > 0 ? (
                    <div className="glass-panel overflow-hidden">
                      <button
                        onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                        className="w-full p-4 flex items-center justify-between hover:bg-elevated/50 transition-colors"
                      >
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                          Full Transcript ({nodeDetail.full_transcript.length} messages)
                        </h3>
                        <svg
                          className={`w-5 h-5 text-text-muted transition-transform ${
                            transcriptExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {transcriptExpanded && (
                        <div className="transcript space-y-3 p-4 border-t border-subtle max-h-[600px]">
                          {nodeDetail.full_transcript.map((message, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className={`text-xs font-semibold ${
                                idx % 2 === 0 ? 'text-primary-cyan' : 'text-primary-purple'
                              }`}>
                                {idx % 2 === 0 ? '> User:' : '< Agent:'}
                              </div>
                              <div className="text-sm text-text-secondary pl-4 leading-relaxed">
                                {message}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="glass-panel p-8 text-center">
                      <svg className="w-12 h-12 mx-auto text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm text-text-muted">No transcript available</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'raw' && (
                <motion.div
                  key="raw"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {nodeDetail.full_trace ? (
                    <div className="glass-panel overflow-hidden">
                      <button
                        onClick={() => setRawDataExpanded(!rawDataExpanded)}
                        className="w-full p-4 flex items-center justify-between hover:bg-elevated/50 transition-colors"
                      >
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                          Raw JSON Trace
                        </h3>
                        <svg
                          className={`w-5 h-5 text-text-muted transition-transform ${
                            rawDataExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {rawDataExpanded && (
                        <pre className="transcript p-4 border-t border-subtle text-xs overflow-x-auto max-h-[600px]">
                          {JSON.stringify(nodeDetail.full_trace, null, 2)}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="glass-panel p-8 text-center">
                      <svg className="w-12 h-12 mx-auto text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-text-muted">No trace data available</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-subtle">
            <button
              onClick={handleExport}
              className="w-full cyber-button-primary py-3 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Export Data
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-96 h-full bg-surface border-l border-subtle flex items-center justify-center p-8"
        >
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-text-muted/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-text-muted">
              Select a node to view details
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * InfoRow component for displaying key-value pairs
 */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-text-muted flex-shrink-0">{label}:</span>
      <span className="text-sm text-text-primary font-mono text-right flex-1">
        {value}
      </span>
    </div>
  );
}
