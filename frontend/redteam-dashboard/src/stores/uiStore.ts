/**
 * ============================================================================
 * UI STATE STORE
 * ============================================================================
 * Zustand store for managing UI state (panels, modals, selections)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Selected node
  selectedNodeId: string | null;

  // Panel visibility
  configPanelOpen: boolean;
  detailsPanelOpen: boolean;
  statsPanelOpen: boolean;

  // Modal state
  resultsModalOpen: boolean;
  settingsModalOpen: boolean;
  helpModalOpen: boolean;

  // Results modal data
  resultsNodeId: string | null;

  // View preferences
  showLabels: boolean;
  showAnimations: boolean;
  theme: 'light' | 'dark' | 'system';
  zoom: number;

  // Actions - Selection
  selectNode: (nodeId: string | null) => void;
  clearSelection: () => void;

  // Actions - Panels
  toggleConfigPanel: () => void;
  toggleDetailsPanel: () => void;
  toggleStatsPanel: () => void;
  setConfigPanelOpen: (open: boolean) => void;
  setDetailsPanelOpen: (open: boolean) => void;
  setStatsPanelOpen: (open: boolean) => void;

  // Actions - Modals
  openResultsModal: (nodeId: string) => void;
  closeResultsModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openHelpModal: () => void;
  closeHelpModal: () => void;
  closeAllModals: () => void;

  // Actions - View Preferences
  setShowLabels: (show: boolean) => void;
  setShowAnimations: (show: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setZoom: (zoom: number) => void;

  // Utility
  reset: () => void;
}

const initialState = {
  selectedNodeId: null,
  configPanelOpen: true,
  detailsPanelOpen: false,
  statsPanelOpen: true,
  resultsModalOpen: false,
  settingsModalOpen: false,
  helpModalOpen: false,
  resultsNodeId: null,
  showLabels: true,
  showAnimations: true,
  theme: 'system' as const,
  zoom: 1.0,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialState,

      // Selection actions
      selectNode: (nodeId: string | null) => {
        set({
          selectedNodeId: nodeId,
          detailsPanelOpen: nodeId !== null,
        });
      },

      clearSelection: () => {
        set({ selectedNodeId: null });
      },

      // Panel actions
      toggleConfigPanel: () => {
        set((state) => ({ configPanelOpen: !state.configPanelOpen }));
      },

      toggleDetailsPanel: () => {
        set((state) => ({ detailsPanelOpen: !state.detailsPanelOpen }));
      },

      toggleStatsPanel: () => {
        set((state) => ({ statsPanelOpen: !state.statsPanelOpen }));
      },

      setConfigPanelOpen: (open: boolean) => {
        set({ configPanelOpen: open });
      },

      setDetailsPanelOpen: (open: boolean) => {
        set({ detailsPanelOpen: open });
      },

      setStatsPanelOpen: (open: boolean) => {
        set({ statsPanelOpen: open });
      },

      // Modal actions
      openResultsModal: (nodeId: string) => {
        set({
          resultsModalOpen: true,
          resultsNodeId: nodeId,
          selectedNodeId: nodeId,
        });
      },

      closeResultsModal: () => {
        set({
          resultsModalOpen: false,
          resultsNodeId: null,
        });
      },

      openSettingsModal: () => {
        set({ settingsModalOpen: true });
      },

      closeSettingsModal: () => {
        set({ settingsModalOpen: false });
      },

      openHelpModal: () => {
        set({ helpModalOpen: true });
      },

      closeHelpModal: () => {
        set({ helpModalOpen: false });
      },

      closeAllModals: () => {
        set({
          resultsModalOpen: false,
          settingsModalOpen: false,
          helpModalOpen: false,
          resultsNodeId: null,
        });
      },

      // View preference actions
      setShowLabels: (show: boolean) => {
        set({ showLabels: show });
      },

      setShowAnimations: (show: boolean) => {
        set({ showAnimations: show });
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
      },

      setZoom: (zoom: number) => {
        set({ zoom: Math.max(0.1, Math.min(5.0, zoom)) }); // Clamp between 0.1 and 5.0
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        configPanelOpen: state.configPanelOpen,
        statsPanelOpen: state.statsPanelOpen,
        showLabels: state.showLabels,
        showAnimations: state.showAnimations,
        theme: state.theme,
      }),
    }
  )
);
