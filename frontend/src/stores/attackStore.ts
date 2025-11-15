import { create } from 'zustand';
import { useGraphStore } from './graphStore';

/**
 * Attack goal types
 */
export type AttackGoal = 'extract_model' | 'extract_prompt' | 'enumerate_tools';

/**
 * Agent targets
 */
export type AgentTarget = 'Eagle' | 'Fox' | 'Bear' | 'Wolf' | 'Phoenix' | 'Dragon' | 'Tiger';

/**
 * Attack status
 */
export type AttackStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

/**
 * WebSocket connection status
 */
export type WSConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Attack configuration
 */
export interface AttackConfig {
  /** Target agent or endpoint */
  target: string;

  /** Attack goals to achieve */
  goals: AttackGoal[];

  /** Number of seed attacks */
  seedAttackCount: number;

  /** Additional configuration */
  maxGenerations?: number;
  populationSize?: number;
}

/**
 * Attack results summary
 */
export interface AttackResults {
  /** Attack Success Rate */
  asr: number;

  /** Total attacks executed */
  totalAttacks: number;

  /** Successful attacks */
  successfulAttacks: number;

  /** Top successful attacks with details */
  topAttacks: Array<{
    nodeId: string;
    attackType: string;
    summary: string;
    transcript?: string[];
    successScore: number;
  }>;

  /** LLM-generated analysis */
  llmAnalysis?: string;

  /** Timestamp */
  timestamp: number;
}

/**
 * Attack store state and actions
 */
interface AttackStore {
  // Configuration
  config: AttackConfig;
  setTarget: (target: string) => void;
  setGoals: (goals: AttackGoal[]) => void;
  setSeedAttackCount: (count: number) => void;
  updateConfig: (config: Partial<AttackConfig>) => void;

  // Attack control
  attackStatus: AttackStatus;
  attackId: string | null;
  startAttack: () => Promise<void>;
  pauseAttack: () => Promise<void>;
  stopAttack: () => Promise<void>;

  // WebSocket connection
  wsStatus: WSConnectionStatus;
  wsInstance: WebSocket | null;
  connectWebSocket: (attackId: string) => void;
  disconnectWebSocket: () => void;

  // Results
  results: AttackResults | null;
  setResults: (results: AttackResults) => void;
  showResultsModal: boolean;
  setShowResultsModal: (show: boolean) => void;

  // Progress tracking
  currentGeneration: number;
  totalNodes: number;
  setProgress: (generation: number, nodes: number) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
}

/**
 * Default attack configuration
 */
const DEFAULT_CONFIG: AttackConfig = {
  target: '',
  goals: [],
  seedAttackCount: 10,
  maxGenerations: 5,
  populationSize: 20
};

/**
 * Attack store using Zustand
 */
export const useAttackStore = create<AttackStore>((set, get) => ({
  // Initial configuration
  config: DEFAULT_CONFIG,

  setTarget: (target: string) =>
    set((state) => ({
      config: { ...state.config, target }
    })),

  setGoals: (goals: AttackGoal[]) =>
    set((state) => ({
      config: { ...state.config, goals }
    })),

  setSeedAttackCount: (count: number) =>
    set((state) => ({
      config: { ...state.config, seedAttackCount: count }
    })),

  updateConfig: (updates: Partial<AttackConfig>) =>
    set((state) => ({
      config: { ...state.config, ...updates }
    })),

  // Attack control
  attackStatus: 'idle',
  attackId: null,

  startAttack: async () => {
    const { config } = get();

    // Validation
    if (!config.target) {
      set({ error: 'Please select a target agent' });
      return;
    }

    if (config.goals.length === 0) {
      set({ error: 'Please select at least one attack goal' });
      return;
    }

    try {
      set({ attackStatus: 'running', error: null });

      // Call backend API to start attack
      const response = await fetch('/api/v1/start-attack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: config.target,
          goals: config.goals,
          seed_attack_count: config.seedAttackCount,
          max_generations: config.maxGenerations,
          population_size: config.populationSize
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to start attack');
      }

      const data = await response.json();
      const attackId = data.attack_id;

      set({ attackId });

      // Connect WebSocket for real-time updates
      get().connectWebSocket(attackId);

    } catch (error) {
      console.error('Failed to start attack:', error);
      set({
        attackStatus: 'error',
        error: error instanceof Error ? error.message : 'Failed to start attack'
      });
    }
  },

  pauseAttack: async () => {
    try {
      const { attackId } = get();
      if (!attackId) return;

      await fetch(`/api/v1/attacks/${attackId}/pause`, {
        method: 'POST'
      });

      set({ attackStatus: 'paused' });
    } catch (error) {
      console.error('Failed to pause attack:', error);
      set({ error: 'Failed to pause attack' });
    }
  },

  stopAttack: async () => {
    try {
      const { attackId } = get();
      if (!attackId) return;

      await fetch(`/api/v1/attacks/${attackId}/stop`, {
        method: 'POST'
      });

      set({ attackStatus: 'idle', attackId: null });
      get().disconnectWebSocket();
    } catch (error) {
      console.error('Failed to stop attack:', error);
      set({ error: 'Failed to stop attack' });
    }
  },

  // WebSocket management
  wsStatus: 'disconnected',
  wsInstance: null,

  connectWebSocket: (attackId: string) => {
    const { wsInstance } = get();

    // Close existing connection
    if (wsInstance) {
      wsInstance.close();
    }

    set({ wsStatus: 'connecting' });

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/v1/${attackId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      set({ wsStatus: 'connected' });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Forward all events to graphStore for visualization
        useGraphStore.getState().handleEvent(data);

        // Handle specific event types for attack control
        switch (data.type) {
          case 'attack_progress':
            set({
              currentGeneration: data.generation,
              totalNodes: data.total_nodes
            });
            break;

          case 'attack_complete':
            set({
              attackStatus: 'completed',
              results: data.results,
              showResultsModal: true
            });
            break;

          case 'attack_error':
            set({
              attackStatus: 'error',
              error: data.message
            });
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ wsStatus: 'error', error: 'WebSocket connection error' });
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      set({ wsStatus: 'disconnected', wsInstance: null });
    };

    set({ wsInstance: ws });
  },

  disconnectWebSocket: () => {
    const { wsInstance } = get();
    if (wsInstance) {
      wsInstance.close();
      set({ wsInstance: null, wsStatus: 'disconnected' });
    }
  },

  // Results
  results: null,
  setResults: (results: AttackResults) => set({ results }),
  showResultsModal: false,
  setShowResultsModal: (show: boolean) => set({ showResultsModal: show }),

  // Progress tracking
  currentGeneration: 0,
  totalNodes: 0,
  setProgress: (generation: number, nodes: number) =>
    set({ currentGeneration: generation, totalNodes: nodes }),

  // Error handling
  error: null,
  setError: (error: string | null) => set({ error })
}));
