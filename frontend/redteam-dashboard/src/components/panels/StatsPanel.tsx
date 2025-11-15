import React from 'react';

export const StatsPanel: React.FC = () => {
  return (
    <div className="glass rounded-lg p-6">
      <h3 className="text-lg font-semibold text-neon-green mb-4">Statistics</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-dark-400">Active Agents:</span>
          <span className="text-neon-blue font-bold">0</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-400">Total Attacks:</span>
          <span className="text-neon-pink font-bold">0</span>
        </div>
      </div>
    </div>
  );
};
