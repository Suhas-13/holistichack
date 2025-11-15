/**
 * ============================================================================
 * WEBSOCKET STORE - Zustand State Management
 * ============================================================================
 *
 * Manages WebSocket connection state, errors, and reconnection attempts
 */

import { create } from 'zustand';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface WebSocketState {
  // Connection state
  status: ConnectionStatus;
  url: string | null;
  error: string | null;

  // Reconnection
  reconnectAttempts: number;
  maxReconnectAttempts: number;

  // Statistics
  messagesReceived: number;
  lastMessageTimestamp: number | null;
  connectionTimestamp: number | null;

  // Actions
  setStatus: (status: ConnectionStatus) => void;
  setUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  incrementReconnect: () => void;
  resetReconnect: () => void;
  incrementMessages: () => void;
  setLastMessage: (timestamp: number) => void;
  setConnectionTime: (timestamp: number | null) => void;

  // Utility
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  status: 'disconnected' as ConnectionStatus,
  url: null,
  error: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  messagesReceived: 0,
  lastMessageTimestamp: null,
  connectionTimestamp: null
};

// ============================================================================
// STORE
// ============================================================================

export const useWebSocketStore = create<WebSocketState>()((set) => ({
  ...initialState,

  setStatus: (status: ConnectionStatus) => {
    set({ status, error: status === 'error' ? null : undefined } as any);
  },

  setUrl: (url: string | null) => {
    set({ url });
  },

  setError: (error: string | null) => {
    set({ error, status: error ? 'error' : 'disconnected' });
  },

  incrementReconnect: () => {
    set((state) => ({
      reconnectAttempts: state.reconnectAttempts + 1,
      status: 'reconnecting' as ConnectionStatus
    }));
  },

  resetReconnect: () => {
    set({ reconnectAttempts: 0 });
  },

  incrementMessages: () => {
    set((state) => ({
      messagesReceived: state.messagesReceived + 1
    }));
  },

  setLastMessage: (timestamp: number) => {
    set({ lastMessageTimestamp: timestamp });
  },

  setConnectionTime: (timestamp: number | null) => {
    set({ connectionTimestamp: timestamp });
  },

  reset: () => {
    set(initialState);
  }
}));
