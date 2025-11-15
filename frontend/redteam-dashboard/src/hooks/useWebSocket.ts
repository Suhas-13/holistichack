/**
 * WebSocket hook for real-time updates
 * Supports both real WebSocket and mock mode for testing
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketURL } from '../api/client';
import type { WebSocketMessage } from '../types';
import { createMockWebSocket, type MockWebSocket } from '../utils/mockWebSocket';
import { useMockMode } from './useMockMode';

export interface UseWebSocketOptions {
  attackId: string | null;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  send: (data: unknown) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useWebSocket({
  attackId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoReconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | MockWebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldConnectRef = useRef(true);

  const mockModeStore = useMockMode();
  const isMockModeRef = useRef(mockModeStore.isEnabled);
  const mockConfigRef = useRef(mockModeStore.config);

  // Store callbacks in refs to avoid recreation
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  // Create refs for connect/disconnect (will be assigned later)
  const connectRef = useRef<() => void>(() => {});
  const disconnectRef = useRef<() => void>(() => {});

  // Update all refs when values change (but don't trigger re-renders)
  useEffect(() => {
    isMockModeRef.current = mockModeStore.isEnabled;
    mockConfigRef.current = mockModeStore.config;
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [mockModeStore.isEnabled, mockModeStore.config, onMessage, onConnect, onDisconnect, onError]);

  const connect = useCallback(() => {
    if (!attackId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const isMockMode = isMockModeRef.current;
      const mockConfig = mockConfigRef.current;

      console.log('[WebSocket] Connecting in', isMockMode ? 'MOCK' : 'REAL', 'mode');

      const wsUrl = isMockMode ? 'mock://localhost:8000' : getWebSocketURL(attackId);
      const ws = isMockMode
        ? createMockWebSocket(wsUrl, mockConfig)
        : new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnectRef.current?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessageRef.current?.(message);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        // Don't auto-reconnect in mock mode - something is wrong
        if (isMockModeRef.current) {
          setError('Mock WebSocket error - check console');
          shouldConnectRef.current = false;
        } else {
          setError('WebSocket connection error');
        }
        onErrorRef.current?.(event);
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;
        onDisconnectRef.current?.();

        // Don't auto-reconnect in mock mode
        const shouldReconnect = !isMockModeRef.current &&
          shouldConnectRef.current &&
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts;

        if (shouldReconnect) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `[WebSocket] Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval) as unknown as number;
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Failed to connect:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  }, [attackId, autoReconnect, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnectRef.current();
    shouldConnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    connectRef.current();
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send data: not connected');
    }
  }, []);

  // Update connect/disconnect refs when they change
  useEffect(() => {
    connectRef.current = connect;
    disconnectRef.current = disconnect;
  }, [connect, disconnect]);

  useEffect(() => {
    if (attackId) {
      shouldConnectRef.current = true;
      connectRef.current();
    }

    return () => {
      shouldConnectRef.current = false;
      disconnectRef.current();
    };
  }, [attackId]);

  return {
    isConnected,
    isConnecting,
    error,
    send,
    disconnect,
    reconnect,
  };
}

export default useWebSocket;
