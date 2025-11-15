import { motion, AnimatePresence } from 'framer-motion';
import { useAttackStore } from '../../stores/attackStore';

/**
 * ResultsModal Component
 *
 * Modal dialog shown when attack completes
 * Features:
 * - Success rate (ASR) display
 * - Total attack statistics
 * - Top successful attacks with transcripts
 * - LLM analysis summary
 * - Download report button
 * - Close button
 * - Beautiful backdrop blur effect
 * - Smooth animations
 */
export function ResultsModal() {
  const { results, showResultsModal, setShowResultsModal } = useAttackStore();

  const handleClose = () => {
    setShowResultsModal(false);
  };

  const handleDownload = () => {
    if (!results) return;

    const report = {
      timestamp: results.timestamp,
      attack_success_rate: results.asr,
      total_attacks: results.totalAttacks,
      successful_attacks: results.successfulAttacks,
      top_attacks: results.topAttacks,
      llm_analysis: results.llmAnalysis
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attack-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {showResultsModal && results && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-void/80 backdrop-blur-md z-40 flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-panel max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto shadow-2xl border-2 border-primary-cyan/30">
              {/* Header */}
              <div className="p-6 border-b border-subtle bg-gradient-to-r from-primary-cyan/10 to-primary-purple/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-primary-cyan mb-2">
                      Attack Results
                    </h2>
                    <p className="text-sm text-text-muted">
                      Completed {new Date(results.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-elevated rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Summary Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* ASR Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-6 text-center border-2 border-primary-cyan/30"
                  >
                    <div className="text-4xl font-bold font-mono text-primary-cyan mb-2">
                      {Math.round(results.asr)}%
                    </div>
                    <div className="text-xs uppercase tracking-wide text-text-muted">
                      Attack Success Rate
                    </div>
                    <div className="mt-3 h-2 bg-elevated rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${results.asr}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-primary-cyan to-primary-purple"
                      />
                    </div>
                  </motion.div>

                  {/* Total Attacks Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-6 text-center"
                  >
                    <div className="text-4xl font-bold font-mono text-text-primary mb-2">
                      {results.totalAttacks}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-text-muted">
                      Total Attacks
                    </div>
                  </motion.div>

                  {/* Successful Attacks Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel p-6 text-center"
                  >
                    <div className="text-4xl font-bold font-mono text-status-success mb-2">
                      {results.successfulAttacks}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-text-muted">
                      Successful
                    </div>
                  </motion.div>
                </div>

                {/* LLM Analysis */}
                {results.llmAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-6 mb-6 bg-gradient-to-br from-primary-cyan/5 to-primary-purple/5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-primary-purple" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-purple">
                        AI Analysis
                      </h3>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {results.llmAnalysis}
                    </p>
                  </motion.div>
                )}

                {/* Top Successful Attacks */}
                {results.topAttacks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-status-success" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Top Successful Attacks
                    </h3>

                    <div className="space-y-4">
                      {results.topAttacks.map((attack, index) => (
                        <motion.div
                          key={attack.nodeId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="glass-panel p-4 hover:border-primary-cyan/50 transition-colors"
                        >
                          {/* Attack Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-status-success/20 text-status-success font-bold text-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <div className="font-mono text-sm text-primary-cyan">
                                  {attack.nodeId}
                                </div>
                                <div className="text-xs text-text-muted">
                                  {attack.attackType}
                                </div>
                              </div>
                            </div>
                            <div className="px-2 py-1 rounded bg-status-success/20 text-status-success text-xs font-semibold">
                              {attack.successScore}% Success
                            </div>
                          </div>

                          {/* Summary */}
                          <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                            {attack.summary}
                          </p>

                          {/* Transcript Preview */}
                          {attack.transcript && attack.transcript.length > 0 && (
                            <details className="group">
                              <summary className="text-xs text-primary-cyan cursor-pointer hover:text-primary-purple transition-colors flex items-center gap-1">
                                <svg className="w-4 h-4 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                View Transcript ({attack.transcript.length} messages)
                              </summary>
                              <div className="mt-3 transcript max-h-40 space-y-2 p-3">
                                {attack.transcript.slice(0, 4).map((msg, idx) => (
                                  <div key={idx} className="text-xs">
                                    <span className={idx % 2 === 0 ? 'text-primary-cyan' : 'text-primary-purple'}>
                                      {idx % 2 === 0 ? '>' : '<'}
                                    </span>{' '}
                                    <span className="text-text-secondary">{msg}</span>
                                  </div>
                                ))}
                                {attack.transcript.length > 4 && (
                                  <div className="text-xs text-text-muted italic">
                                    ...and {attack.transcript.length - 4} more messages
                                  </div>
                                )}
                              </div>
                            </details>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-subtle bg-elevated/50 flex items-center justify-between">
                <div className="text-xs text-text-muted">
                  This report contains sensitive security findings
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="cyber-button px-6 py-2"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDownload}
                    className="cyber-button-primary px-6 py-2 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
