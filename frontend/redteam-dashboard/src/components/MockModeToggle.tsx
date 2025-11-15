/**
 * Mock Mode Toggle Component
 * Allows switching between real backend and mock simulation
 */

import { useState } from 'react';
import { useMockMode } from '../hooks/useMockMode';
import { Settings, Play, Info, X } from 'lucide-react';

export function MockModeToggle() {
  const {
    isEnabled,
    toggle,
    config,
    updateConfig,
  } = useMockMode();

  const [showConfig, setShowConfig] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <div
        className={`
          fixed bottom-4 right-4 z-50
          flex items-center gap-2 px-4 py-2 rounded-lg
          font-medium text-sm transition-all cursor-pointer
          ${
            isEnabled
              ? 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white shadow-lg'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]'
          }
          hover:scale-105 active:scale-95
        `}
        title={isEnabled ? 'Using Mock Data' : 'Using Real Backend'}
      >
        <div onClick={toggle} className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          <span>{isEnabled ? 'DEMO MODE' : 'Real Mode'}</span>
        </div>
        {isEnabled && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowConfig(!showConfig);
            }}
            className="ml-1 p-1 rounded hover:bg-white/20 cursor-pointer"
            title="Configure demo settings"
          >
            <Settings className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Configuration Panel */}
      {showConfig && isEnabled && (
        <div className="fixed bottom-20 right-4 z-50 w-80 glass-strong rounded-lg p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Demo Configuration
            </h3>
            <button
              onClick={() => setShowConfig(false)}
              className="p-1 rounded hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Clusters */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">
                Clusters
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={config.numClusters}
                onChange={(e) => updateConfig({ numClusters: parseInt(e.target.value) })}
                className="input text-sm"
              />
            </div>

            {/* Generations */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">
                Generations
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.generations}
                onChange={(e) => updateConfig({ generations: parseInt(e.target.value) })}
                className="input text-sm"
              />
            </div>

            {/* Event Delay */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">
                Event Delay (ms)
              </label>
              <input
                type="number"
                min="100"
                max="3000"
                step="100"
                value={config.eventDelay}
                onChange={(e) => updateConfig({ eventDelay: parseInt(e.target.value) })}
                className="input text-sm"
              />
            </div>

            {/* Success Rate */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">
                Success Rate ({Math.round(config.successRate * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.successRate * 100}
                onChange={(e) => updateConfig({ successRate: parseInt(e.target.value) / 100 })}
                className="w-full"
              />
            </div>

            {/* Info */}
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-start gap-2 text-xs text-[var(--text-dim)]">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Demo mode simulates the backend with mock data. Perfect for testing
                  and presentations without a real backend connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MockModeToggle;
