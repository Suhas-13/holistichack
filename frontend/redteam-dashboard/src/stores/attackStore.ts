/**
 * ============================================================================
 * ATTACK STORE - Zustand State Management
 * ============================================================================
 *
 * Manages attack configuration, status, and results data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export type AttackStatus = 'idle' | 'running' | 'completed' | 'error';

interface AttackConfig {
  targetAgents: string[];
  attackTypes: string[];
  maxIterations: number;
  concurrency: number;
}

interface AttackResult {
  attack_id: string;
  timestamp: number;
  total_nodes: number;
  total_clusters: number;
  successful_attacks: number;
  failed_attacks: number;
  status: 'success' | 'failed' | 'partial';
}

interface AttackState {
  // Configuration
  config: AttackConfig;
  websocketUrl: string;

  // Status
  status: AttackStatus;
  currentAttackId: string | null;
  startTime: number | null;
  endTime: number | null;

  // Results
  results: AttackResult | null;
  error: string | null;

  // Actions - Configuration
  setConfig: (config: Partial<AttackConfig>) => void;
  setWebSocketUrl: (url: string) => void;

  // Actions - Attack Control
  startAttack: (attackId: string) => void;
  completeAttack: (result: AttackResult) => void;
  failAttack: (error: string) => void;
  cancelAttack: () => void;

  // Utility
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialConfig: AttackConfig = {
  targetAgents: [],
  attackTypes: [],
  maxIterations: 100,
  concurrency: 5
};

const initialState = {
  config: initialConfig,
  websocketUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
  status: 'idle' as AttackStatus,
  currentAttackId: null,
  startTime: null,
  endTime: null,
  results: null,
  error: null
};

// ============================================================================
// STORE
// ============================================================================

export const useAttackStore = create<AttackState>()(
  persist(
    (set) => ({
      ...initialState,

      // Configuration actions
      setConfig: (config: Partial<AttackConfig>) => {
        set((state) => ({
          config: { ...state.config, ...config }
        }));
      },

      setWebSocketUrl: (url: string) => {
        set({ websocketUrl: url });
      },

      // Attack control actions
      startAttack: (attackId: string) => {
        set({
          status: 'running',
          currentAttackId: attackId,
          startTime: Date.now(),
          endTime: null,
          results: null,
          error: null
        });
      },

      completeAttack: (result: AttackResult) => {
        set({
          status: 'completed',
          endTime: Date.now(),
          results: result,
          error: null
        });
      },

      failAttack: (error: string) => {
        set({
          status: 'error',
          endTime: Date.now(),
          error
        });
      },

      cancelAttack: () => {
        set({
          status: 'idle',
          currentAttackId: null,
          endTime: Date.now()
        });
      },

      // Reset
      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'attack-storage',
      partialize: (state) => ({
        config: state.config,
        websocketUrl: state.websocketUrl
      })
    }
  )
);
