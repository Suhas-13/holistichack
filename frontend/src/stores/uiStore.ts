import { create } from 'zustand';

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

interface UiStore {
  // Viewport
  viewport: ViewportState;
  setViewport: (viewport: Partial<ViewportState>) => void;

  // Selection
  selectedNodeId: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;

  // Hover
  hoveredNodeId: string | null;
  setHoveredNodeId: (nodeId: string | null) => void;

  // Panel states
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;

  // Graph settings
  showMiniMap: boolean;
  showControls: boolean;
  showClusterBackgrounds: boolean;
  toggleMiniMap: () => void;
  toggleControls: () => void;
  toggleClusterBackgrounds: () => void;

  // Animation preferences
  animationsEnabled: boolean;
  toggleAnimations: () => void;

  // Filter state
  filterStatus: string[];
  filterAttackTypes: string[];
  setFilterStatus: (statuses: string[]) => void;
  setFilterAttackTypes: (types: string[]) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  // Initial viewport
  viewport: {
    x: 0,
    y: 0,
    zoom: 1
  },
  setViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport }
    })),

  // Selection
  selectedNodeId: null,
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  // Hover
  hoveredNodeId: null,
  setHoveredNodeId: (nodeId) => set({ hoveredNodeId: nodeId }),

  // Panels
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  toggleLeftPanel: () =>
    set((state) => ({ leftPanelCollapsed: !state.leftPanelCollapsed })),
  toggleRightPanel: () =>
    set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),

  // Graph settings
  showMiniMap: true,
  showControls: true,
  showClusterBackgrounds: true,
  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),
  toggleControls: () => set((state) => ({ showControls: !state.showControls })),
  toggleClusterBackgrounds: () =>
    set((state) => ({ showClusterBackgrounds: !state.showClusterBackgrounds })),

  // Animations
  animationsEnabled: true,
  toggleAnimations: () =>
    set((state) => ({ animationsEnabled: !state.animationsEnabled })),

  // Filters
  filterStatus: [],
  filterAttackTypes: [],
  setFilterStatus: (statuses) => set({ filterStatus: statuses }),
  setFilterAttackTypes: (types) => set({ filterAttackTypes: types })
}));
