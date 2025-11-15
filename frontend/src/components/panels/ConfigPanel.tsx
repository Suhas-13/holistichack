import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAttackStore, AttackGoal, AgentTarget } from '../../stores/attackStore';
import { useUiStore } from '../../stores/uiStore';

/**
 * Available agent targets
 */
const AGENT_TARGETS: AgentTarget[] = [
  'Eagle',
  'Fox',
  'Bear',
  'Wolf',
  'Phoenix',
  'Dragon',
  'Tiger'
];

/**
 * Available attack goals
 */
const ATTACK_GOALS: { value: AttackGoal; label: string; description: string }[] = [
  {
    value: 'extract_model',
    label: 'Extract Model',
    description: 'Attempt to extract model information (name, version, provider)'
  },
  {
    value: 'extract_prompt',
    label: 'Extract System Prompt',
    description: 'Attempt to extract the system prompt or instructions'
  },
  {
    value: 'enumerate_tools',
    label: 'Enumerate Tools',
    description: 'Attempt to discover available tools and functions'
  }
];

/**
 * ConfigPanel Component
 *
 * Left sidebar for attack configuration
 * - Target agent selection
 * - Attack goals checkboxes
 * - Seed attack count slider
 * - Start/Stop attack controls
 * - Collapsible when attack is running
 */
export function ConfigPanel() {
  const leftPanelCollapsed = useUiStore((state) => state.leftPanelCollapsed);
  const toggleLeftPanel = useUiStore((state) => state.toggleLeftPanel);

  const {
    config,
    setTarget,
    setGoals,
    setSeedAttackCount,
    startAttack,
    stopAttack,
    pauseAttack,
    attackStatus,
    error,
    setError
  } = useAttackStore();

  const [localGoals, setLocalGoals] = useState<AttackGoal[]>(config.goals);
  const [localTarget, setLocalTarget] = useState<string>(config.target);
  const [localSeedCount, setLocalSeedCount] = useState<number>(config.seedAttackCount);

  const isRunning = attackStatus === 'running';
  const isPaused = attackStatus === 'paused';
  const canStart = !isRunning && !isPaused;

  /**
   * Toggle attack goal
   */
  const toggleGoal = (goal: AttackGoal) => {
    const newGoals = localGoals.includes(goal)
      ? localGoals.filter((g) => g !== goal)
      : [...localGoals, goal];

    setLocalGoals(newGoals);
    setGoals(newGoals);
  };

  /**
   * Handle target change
   */
  const handleTargetChange = (target: string) => {
    setLocalTarget(target);
    setTarget(target);
  };

  /**
   * Handle seed count change
   */
  const handleSeedCountChange = (count: number) => {
    setLocalSeedCount(count);
    setSeedAttackCount(count);
  };

  /**
   * Handle start attack
   */
  const handleStartAttack = async () => {
    setError(null);
    await startAttack();
  };

  return (
    <motion.div
      className="h-full bg-surface border-r border-subtle flex flex-col overflow-hidden"
      initial={false}
      animate={{
        width: leftPanelCollapsed ? 48 : 300
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }}
    >
      {/* Collapsed View */}
      <AnimatePresence mode="wait">
        {leftPanelCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-6 gap-4"
          >
            {/* Expand Button */}
            <button
              onClick={toggleLeftPanel}
              className="p-2 hover:bg-elevated rounded-lg transition-colors"
              title="Expand panel"
            >
              <svg className="w-6 h-6 text-primary-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>

            {/* Config Icon */}
            <div className="p-2 rounded-lg bg-elevated">
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>

            {/* Status Indicator */}
            {isRunning && (
              <motion.div
                className="w-3 h-3 bg-status-running rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full p-6 gap-6 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-cyan flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Configuration
              </h2>
              <button
                onClick={toggleLeftPanel}
                className="p-1 hover:bg-elevated rounded transition-colors"
                title="Collapse panel"
              >
                <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="h-px glow-divider" />

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-status-failure/10 border border-status-failure/30 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-status-failure flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-status-failure">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Target Agent Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text-secondary uppercase tracking-wide">
                Target Agent
              </label>
              <select
                value={localTarget}
                onChange={(e) => handleTargetChange(e.target.value)}
                disabled={isRunning || isPaused}
                className="w-full px-3 py-2 bg-elevated border border-subtle rounded-lg text-text-primary focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select agent...</option>
                {AGENT_TARGETS.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent} Agent
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-muted">
                Or enter custom endpoint URL
              </p>
            </div>

            {/* Attack Goals */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text-secondary uppercase tracking-wide">
                Attack Goals
              </label>
              <div className="space-y-2">
                {ATTACK_GOALS.map((goal) => (
                  <label
                    key={goal.value}
                    className="flex items-start gap-3 p-3 bg-elevated/50 rounded-lg cursor-pointer hover:bg-elevated transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={localGoals.includes(goal.value)}
                      onChange={() => toggleGoal(goal.value)}
                      disabled={isRunning || isPaused}
                      className="mt-0.5 w-4 h-4 text-primary-cyan bg-surface border-subtle rounded focus:ring-primary-cyan focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary group-hover:text-primary-cyan transition-colors">
                        {goal.label}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {goal.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Seed Attack Count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                  Seed Attacks
                </label>
                <span className="text-lg font-mono text-primary-cyan font-semibold">
                  {localSeedCount}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={localSeedCount}
                onChange={(e) => handleSeedCountChange(parseInt(e.target.value))}
                disabled={isRunning || isPaused}
                className="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer accent-primary-cyan disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-text-muted">
                <span>1</span>
                <span>50</span>
              </div>
              <p className="text-xs text-text-muted">
                Initial attack variants to generate
              </p>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Control Buttons */}
            <div className="space-y-3 pt-4 border-t border-subtle">
              {/* Start Button */}
              {canStart && (
                <button
                  onClick={handleStartAttack}
                  disabled={!localTarget || localGoals.length === 0}
                  className="w-full cyber-button-primary py-3 font-semibold uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start Attack
                </button>
              )}

              {/* Pause/Resume and Stop Buttons */}
              {(isRunning || isPaused) && (
                <div className="flex gap-2">
                  <button
                    onClick={pauseAttack}
                    className="flex-1 cyber-button py-2 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={stopAttack}
                    className="flex-1 cyber-button py-2 flex items-center justify-center gap-2 border-status-failure/30 text-status-failure hover:bg-status-failure/10"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    Stop
                  </button>
                </div>
              )}
            </div>

            {/* Status Info */}
            {(isRunning || isPaused) && (
              <div className="p-3 bg-elevated rounded-lg border border-subtle">
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`w-2 h-2 rounded-full ${
                      isRunning ? 'bg-status-running' : 'bg-status-pending'
                    }`}
                    animate={isRunning ? {
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    {attackStatus}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
