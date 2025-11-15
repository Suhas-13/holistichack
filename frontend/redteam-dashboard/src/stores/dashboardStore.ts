import { create } from 'zustand';
import type { Agent, Attack } from '../types';

interface DashboardStore {
  agents: Agent[];
  attacks: Attack[];
  selectedAgent: Agent | null;
  addAgent: (agent: Agent) => void;
  removeAgent: (agentId: string) => void;
  updateAgent: (agentId: string, agent: Partial<Agent>) => void;
  addAttack: (attack: Attack) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  clearAttacks: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  agents: [],
  attacks: [],
  selectedAgent: null,

  addAgent: (agent: Agent) =>
    set((state: DashboardStore) => ({
      ...state,
      agents: [...state.agents, agent],
    })),

  removeAgent: (agentId: string) =>
    set((state: DashboardStore) => ({
      ...state,
      agents: state.agents.filter((a: Agent) => a.id !== agentId),
    })),

  updateAgent: (agentId: string, updates: Partial<Agent>) =>
    set((state: DashboardStore) => ({
      ...state,
      agents: state.agents.map((a: Agent) =>
        a.id === agentId ? { ...a, ...updates } : a
      ),
    })),

  addAttack: (attack: Attack) =>
    set((state: DashboardStore) => ({
      ...state,
      attacks: [attack, ...state.attacks],
    })),

  setSelectedAgent: (agent: Agent | null) =>
    set(() => ({
      selectedAgent: agent,
    })),

  clearAttacks: () =>
    set(() => ({
      attacks: [],
    })),
}));
