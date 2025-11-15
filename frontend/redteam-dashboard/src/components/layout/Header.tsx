import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="glass-dark border-b border-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <h1 className="text-2xl font-bold text-neon-blue">
          Red-Team Dashboard
        </h1>
      </div>
    </header>
  );
};
