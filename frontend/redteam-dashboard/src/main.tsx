/**
 * ============================================================================
 * MAIN ENTRY POINT - RED-TEAMING EVOLUTION DASHBOARD
 * ============================================================================
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global styles are imported in App.tsx
// This ensures proper loading order with Tailwind

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
