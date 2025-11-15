/**
 * Mock mode hook for demo/testing without backend
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MockModeState {
  /** Whether mock mode is enabled */
  isEnabled: boolean;

  /** Mock configuration */
  config: {
    numClusters: number;
    nodesPerCluster: number;
    generations: number;
    eventDelay: number;
    successRate: number;
  };

  /** Enable mock mode */
  enable: () => void;

  /** Disable mock mode */
  disable: () => void;

  /** Toggle mock mode */
  toggle: () => void;

  /** Update mock configuration */
  updateConfig: (config: Partial<MockModeState['config']>) => void;
}

// Check environment variable at module load time
const envMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

// Log mock mode status on module load
console.log('[MockMode] Environment variable VITE_MOCK_MODE:', import.meta.env.VITE_MOCK_MODE);
console.log('[MockMode] Mock mode enabled:', envMockMode);

export const useMockMode = create<MockModeState>()(
  persist(
    (set) => ({
      // Force mock mode OFF for real backend integration
      isEnabled: false,

      config: {
        numClusters: 4,
        nodesPerCluster: 8,
        generations: 5,
        eventDelay: 600,
        successRate: 0.65,
      },

      enable: () => set({ isEnabled: true }),

      disable: () => set({ isEnabled: false }),

      toggle: () => {
        // Don't allow toggling if env var is set
        if (envMockMode) {
          console.log('[MockMode] Cannot toggle - forced by VITE_MOCK_MODE env var');
          return;
        }
        set((state) => ({ isEnabled: !state.isEnabled }));
      },

      updateConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config },
        })),
    }),
    {
      name: 'redteam-mock-mode',
      // Skip persistence if env var is set
      skipHydration: envMockMode,
    }
  )
);

/**
 * Check if mock mode is enabled via environment variable
 */
export function isMockModeFromEnv(): boolean {
  return import.meta.env.VITE_MOCK_MODE === 'true';
}

/**
 * Get mock API base URL
 */
export function getMockApiUrl(): string {
  return 'mock://localhost:8000';
}
