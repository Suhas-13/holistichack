/**
 * API client for backend communication
 * Supports both real API and mock mode for testing
 */

import type {
  StartAttackRequest,
  StartAttackResponse,
  AttackStatusResponse,
  ApiError,
} from '../types';
import { mockApiResponses } from '../utils/mockWebSocket';
import { isMockModeFromEnv } from '../hooks/useMockMode';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';
const BASE_URL = `${API_BASE_URL}${API_VERSION}`;

export class APIClientError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}

async function parseErrorResponse(response: Response): Promise<APIClientError> {
  try {
    const errorData = await response.json();
    return new APIClientError(
      errorData.message || errorData.detail || 'An error occurred',
      errorData.code,
      response.status,
      errorData.details
    );
  } catch {
    return new APIClientError(
      `HTTP ${response.status}: ${response.statusText}`,
      'UNKNOWN_ERROR',
      response.status
    );
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await parseErrorResponse(response);
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
        timestamp: Date.now(),
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data as T,
      timestamp: Date.now(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';

    return {
      success: false,
      error: {
        message,
        code: 'NETWORK_ERROR',
      },
      timestamp: Date.now(),
    };
  }
}

export async function startAttack(
  config: StartAttackRequest
): Promise<APIResponse<StartAttackResponse>> {
  // Mock mode disabled - always use real API
  console.log('[API] Using REAL backend API');

  // Convert frontend config to backend format
  const backendConfig = {
    target_endpoint: config.targets?.[0]?.endpoint || 'https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/wolf',
    attack_goals: ['reveal_system_prompt', 'extract_data'],
    seed_attack_count: config.population_size || 20
  };

  return fetchAPI<StartAttackResponse>('/start-attack', {
    method: 'POST',
    body: JSON.stringify(backendConfig),
  });
}

export async function getAttackStatus(
  attackId: string
): Promise<APIResponse<AttackStatusResponse>> {
  return fetchAPI<AttackStatusResponse>(`/status/${attackId}`, {
    method: 'GET',
  });
}

export async function stopAttack(
  attackId: string
): Promise<APIResponse<{ status: string; message: string }>> {
  return fetchAPI(`/attacks/${attackId}/stop`, {
    method: 'POST',
  });
}

export async function getAvailableAgents(): Promise<
  APIResponse<{ agents: Array<{ id: string; name: string; type: string }> }>
> {
  return fetchAPI('/agents', {
    method: 'GET',
  });
}

export async function healthCheck(): Promise<
  APIResponse<{ status: string; version: string }>
> {
  return fetchAPI('/health', {
    method: 'GET',
  });
}

export function getWebSocketURL(attackId: string): string {
  // Use relative path to leverage Vite proxy
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = window.location.host; // This will be localhost:5173
  return `${wsProtocol}//${wsHost}/ws/v1/${attackId}`;
}

export const apiClient = {
  startAttack,
  getAttackStatus,
  stopAttack,
  getAvailableAgents,
  healthCheck,
  getWebSocketURL,
};

export default apiClient;
