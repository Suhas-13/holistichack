/**
 * ============================================================================
 * MAIN APP COMPONENT - RED-TEAMING EVOLUTION DASHBOARD
 * ============================================================================
 * Layout structure with all panels and WebSocket integration
 */

import { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

// Components
import TopBar from './components/layout/TopBar';
import ConfigPanel from './components/panels/ConfigPanel';
import GraphCanvas from './components/graph/GraphCanvas';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { ResultsModal } from './components/ResultsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MockModeToggle } from './components/MockModeToggle';

// Hooks & API
import { useWebSocket } from './hooks/useWebSocket';
import { apiClient } from './api/client';

// Types
import type {
  AttackStatus,
  StartAttackRequest,
  GraphState,
  NodeDetail,
  AttackSummary,
  WebSocketMessage,
} from './types';

// Styles
import './styles/globals.css';

function AppContent() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Attack state
  const [attackStatus, setAttackStatus] = useState<AttackStatus | null>(null);
  const [attackId, setAttackId] = useState<string | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState(0);

  // Graph state
  const [graphState] = useState<GraphState | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // UI state
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Loading & errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attackSummary, setAttackSummary] = useState<AttackSummary | null>(null);

  // ============================================================================
  // WEBSOCKET INTEGRATION
  // ============================================================================

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('[App] WebSocket message:', message);

    const event = message.event;
    switch (event.type) {
      case 'node_add':
        console.log('[App] New node created:', event.node);
        // Update graph state with new node
        break;

      case 'node_update':
        console.log('[App] Node updated:', event.node);
        break;

      case 'attack_complete':
        setAttackStatus(AttackStatus.COMPLETED);
        setAttackSummary(event.summary);
        setShowResultsModal(true);
        console.log('[App] Attack complete:', event.summary);
        break;
    }
  }, []);

  const { isConnected, isConnecting } = useWebSocket({
    attackId,
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log('[App] WebSocket connected'),
    onDisconnect: () => console.log('[App] WebSocket disconnected'),
    onError: (err) => console.error('[App] WebSocket error:', err),
  });

  // ============================================================================
  // API HANDLERS
  // ============================================================================

  const handleStartAttack = useCallback(async (config: StartAttackRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.startAttack(config);

      if (response.success && response.data) {
        setAttackId(response.data.attack_id);
        setAttackStatus(AttackStatus.RUNNING);
        setCurrentGeneration(0);
        console.log('[App] Attack started:', response.data.attack_id);
      } else {
        setError(response.error?.message || 'Failed to start attack');
        setAttackStatus(AttackStatus.FAILED);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAttackStatus(AttackStatus.FAILED);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId && rightPanelCollapsed) {
      setRightPanelCollapsed(false);
    }
  }, [rightPanelCollapsed]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const nodeDetails: NodeDetail | null = useMemo(() => {
    if (!selectedNodeId || !graphState) return null;

    // Use graphState.getNodeDetail if available
    return null;
  }, [selectedNodeId, graphState]);

  const stats = useMemo(() => {
    if (!graphState) {
      return { nodeCount: 0, successRate: 0, avgFitness: 0 };
    }

    const nodes = Array.from(graphState.nodes.values());
    const successfulNodes = nodes.filter((n) => n.status === 'success');
    const successRate = nodes.length > 0 ? successfulNodes.length / nodes.length : 0;
    const avgFitness =
      nodes.reduce((sum, n) => sum + (n.success_score || 0), 0) / (nodes.length || 1) / 100;

    return {
      nodeCount: nodes.length,
      successRate,
      avgFitness,
    };
  }, [graphState]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="dashboard-layout">
      {/* Top Bar */}
      <TopBar
        attackStatus={attackStatus}
        generation={currentGeneration}
        nodeCount={stats.nodeCount}
        successRate={stats.successRate}
        avgFitness={stats.avgFitness}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel - Configuration */}
        <ConfigPanel
          isCollapsed={leftPanelCollapsed}
          onToggle={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          onStartAttack={handleStartAttack}
          isLoading={isLoading}
          disabled={attackStatus === AttackStatus.RUNNING}
        />

        {/* Center - Graph Canvas */}
        <ReactFlowProvider>
          <GraphCanvas
            graphState={graphState}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
            isLoading={isLoading}
          />
        </ReactFlowProvider>

        {/* Right Panel - Node Details */}
        <NodeDetailPanel
          nodeDetails={nodeDetails}
          isCollapsed={rightPanelCollapsed}
          onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      {/* Results Modal */}
      <ResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        summary={attackSummary}
        graphState={graphState}
      />

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 z-[var(--z-toast)] glass-card p-4 max-w-md animate-slide-in-right">
          <div className="flex items-start gap-3">
            <div className="text-[var(--status-failure)] text-xl">⚠️</div>
            <div className="flex-1">
              <div className="font-semibold text-[var(--status-failure)] mb-1">Error</div>
              <div className="text-sm text-[var(--text-secondary)]">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-[var(--bg-elevated)] rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* WebSocket Status Indicator (Development) */}
      {import.meta.env.DEV && attackId && (
        <div className="fixed bottom-4 left-4 z-[var(--z-toast)] glass-card px-3 py-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div
              className={
                'w-2 h-2 rounded-full ' +
                (isConnected
                  ? 'bg-[var(--status-success)]'
                  : isConnecting
                  ? 'bg-[var(--status-running)] animate-pulse'
                  : 'bg-[var(--status-failure)]')
              }
            />
            <span className="text-[var(--text-secondary)]">
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      )}

      {/* Mock Mode Toggle */}
      <MockModeToggle />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
