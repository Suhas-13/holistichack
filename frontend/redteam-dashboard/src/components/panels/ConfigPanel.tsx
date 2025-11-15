/**
 * Configuration panel component (left sidebar)
 */

import { useState } from 'react';
import type { StartAttackRequest } from '../../types';

interface ConfigPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onStartAttack: (config: StartAttackRequest) => void;
  isLoading: boolean;
  disabled: boolean;
}

export function ConfigPanel({
  isCollapsed,
  onToggle,
  onStartAttack,
  isLoading,
  disabled,
}: ConfigPanelProps) {
  const [config, setConfig] = useState<StartAttackRequest>({
    targets: [],
    max_generations: 10,
    population_size: 20,
    mutation_rate: 0.3,
    crossover_rate: 0.7,
  });

  const handleStart = () => {
    onStartAttack(config);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-[var(--bg-elevated)] rounded transition-colors"
          title="Expand panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col animate-slide-in-left">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <h2 className="font-semibold text-lg">Attack Configuration</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-[var(--bg-elevated)] rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Max Generations</label>
          <input
            type="number"
            value={config.max_generations}
            onChange={(e) => setConfig({ ...config, max_generations: parseInt(e.target.value) })}
            className="input"
            min="1"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Population Size</label>
          <input
            type="number"
            value={config.population_size}
            onChange={(e) => setConfig({ ...config, population_size: parseInt(e.target.value) })}
            className="input"
            min="5"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mutation Rate</label>
          <input
            type="range"
            value={config.mutation_rate}
            onChange={(e) => setConfig({ ...config, mutation_rate: parseFloat(e.target.value) })}
            className="w-full"
            min="0"
            max="1"
            step="0.1"
          />
          <div className="text-xs text-[var(--text-muted)] mt-1">{config.mutation_rate}</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Crossover Rate</label>
          <input
            type="range"
            value={config.crossover_rate}
            onChange={(e) => setConfig({ ...config, crossover_rate: parseFloat(e.target.value) })}
            className="w-full"
            min="0"
            max="1"
            step="0.1"
          />
          <div className="text-xs text-[var(--text-muted)] mt-1">{config.crossover_rate}</div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={handleStart}
          disabled={disabled || isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? 'Starting...' : 'Start Attack'}
        </button>
      </div>
    </div>
  );
}

export default ConfigPanel;
