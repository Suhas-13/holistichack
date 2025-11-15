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
import { DebugPanel } from './components/DebugPanel';

// Hooks & API
import { useWebSocket } from './hooks/useWebSocket';
import { apiClient } from './api/client';
import { useGraphStore } from './stores/graphStore';

// Types
import { AttackStatus } from './types';
import type {
  StartAttackRequest,
  GraphState,
  GraphNode,
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

  // Graph store (Zustand)
  const {
    addCluster,
    addNode,
    updateNode,
    addEdge,
    getGraphData,
    nodes,
    clusters,
    links,
    getNode,
  } = useGraphStore();

  // Attack state
  const [attackStatus, setAttackStatus] = useState<AttackStatus | null>(null);
  const [attackId, setAttackId] = useState<string | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState(0);

  // Graph state
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

    // Handle both formats: {type, data} and {event_type, payload}
    const eventType = (message as any).type || (message as any).event_type;
    const payload = (message as any).data || (message as any).payload;

    switch (eventType) {
      case 'cluster_add':
        console.log('[App] Cluster added:', payload);
        addCluster({
          cluster_id: payload.cluster_id,
          name: payload.name || `Cluster ${payload.cluster_id}`,
          color: payload.color || '#FF6B6B',
          position_hint: payload.position_hint || { x: 0, y: 0 },
          total_attacks: 0,
          successful_attacks: 0,
          collapsed: false,
          visible: true,
        });
        break;

      case 'node_add':
        console.log('[App] Node added:', payload);
        addNode({
          node_id: payload.node_id,
          cluster_id: payload.cluster_id,
          parent_ids: payload.parent_ids || [],
          attack_type: payload.attack_type || 'unknown',
          status: payload.status || 'pending',
          timestamp: payload.created_at || payload.timestamp || Date.now(),
          position: payload.position || { x: Math.random() * 500, y: Math.random() * 500 },
        } as any);
        break;

      case 'node_update':
        console.log('[App] Node updated:', payload);
        updateNode(payload.node_id, {
          status: payload.status,
          llm_summary: payload.llm_summary,
          full_transcript: payload.full_transcript,
          model_id: payload.model_id,
        });
        break;

      case 'evolution_link_add':
        console.log('[App] Evolution link added:', payload);
        addEdge({
          link_id: payload.link_id,
          source_node_ids: payload.source_node_ids || [],
          target_node_id: payload.target_node_id,
          evolution_type: payload.evolution_type || 'mutation',
          timestamp: payload.timestamp || Date.now(),
        });
        break;

      case 'agent_mapping_update':
        console.log('[App] Agent mapping updated:', payload);
        break;

      case 'attack_complete':
        setAttackStatus(AttackStatus.COMPLETED);
        setAttackSummary(payload.summary || payload);
        setShowResultsModal(true);
        console.log('[App] Attack complete:', payload);
        break;

      default:
        console.log('[App] Unknown event type:', eventType, payload);
    }
  }, [addCluster, addNode, updateNode, addEdge]);

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
      console.log('[App] Starting attack with config:', config);
      const response = await apiClient.startAttack(config);
      console.log('[App] API response:', response);

      if (response.success && response.data) {
        const newAttackId = response.data.attack_id;
        console.log('[App] Attack started successfully!');
        console.log('[App] Attack ID:', newAttackId);
        console.log('[App] WebSocket URL will be:', `ws://localhost:5173/ws/v1/${newAttackId}`);
        setAttackId(newAttackId);
        setAttackStatus(AttackStatus.RUNNING);
        setCurrentGeneration(0);
      } else {
        console.error('[App] Attack start failed:', response.error);
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
    if (!selectedNodeId) return null;
    const node = getNode(selectedNodeId);
    if (!node) return null;

    const cluster = clusters.get(node.cluster_id);
    if (!cluster) return null;

    // Get parent nodes
    const parents = node.parent_ids
      .map(id => getNode(id))
      .filter((n): n is GraphNode => n !== undefined);

    // Get child nodes
    const children = Array.from(nodes.values())
      .filter(n => n.parent_ids.includes(node.node_id));

    // Get evolution links
    const incomingLinks = Array.from(links.values())
      .filter(link => link.target_node_id === node.node_id);

    const outgoingLinks = Array.from(links.values())
      .filter(link => link.source_node_ids.includes(node.node_id));

    return {
      ...node,
      cluster,
      parents,
      children,
      incoming_links: incomingLinks,
      outgoing_links: outgoingLinks,
      layout: {
        node_id: node.node_id,
        position: { x: 0, y: 0 },
        velocity: { vx: 0, vy: 0 },
        fixed: false,
        radius: 10,
        highlight: false,
      }
    } as NodeDetail;
  }, [selectedNodeId, getNode, clusters, nodes, links]);

  const stats = useMemo(() => {
    const nodeArray = Array.from(nodes.values());
    const successfulNodes = nodeArray.filter((n) => n.status === 'success');
    const successRate = nodeArray.length > 0 ? successfulNodes.length / nodeArray.length : 0;
    const avgFitness =
      nodeArray.reduce((sum, n) => sum + ((n as any).success_score || 0), 0) / (nodeArray.length || 1) / 100;

    return {
      nodeCount: nodeArray.length,
      successRate,
      avgFitness,
    };
  }, [nodes]);

  // Create graphState for ResultsModal
  const graphState: GraphState | null = useMemo(() => {
    if (nodes.size === 0 && clusters.size === 0) {
      return null;
    }
    return {
      nodes,
      clusters,
      links,
    } as GraphState;
  }, [nodes, clusters, links]);

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
                  ? 'bg-[var(--status-running)]'
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
      {/* <MockModeToggle /> */}

      {/* Debug Panel */}
      {/* {import.meta.env.DEV && attackId && <DebugPanel />} */}
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
