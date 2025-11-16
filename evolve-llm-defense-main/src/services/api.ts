import { AttackNode, ClusterData, WebSocketEventType } from "@/types/evolution";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface StartAttackConfig {
    targetEndpoint: string;
    attackGoals?: string[];
    seedAttackCount?: number;
    maxEvolutionSteps?: number;
}

export interface StartAttackResponse {
    attack_id: string;
    websocket_url: string;
}

export interface AttackStatus {
    attack_id: string;
    status: string;
    target_endpoint: string;
    total_nodes: number;
    successful_nodes: number;
    failed_nodes: number;
    started_at: string;
    completed_at: string | null;
}

export interface AttackResults {
    attack_id: string;
    status: string;
    target_endpoint: string;
    metrics: {
        attack_success_rate_asr: number;
        total_attacks_run: number;
        successful_attacks_count: number;
        total_cost_usd: number;
        avg_latency_ms: number;
    };
    analysis: {
        llm_summary_what_worked: string;
        llm_summary_what_failed: string;
        llm_summary_agent_learnings: string;
    };
    successful_attack_traces: Array<{
        node_id: string;
        cluster_id: string;
        attack_type: string;
        llm_summary: string;
        full_transcript: Array<{
            role: "attacker" | "model";
            content: string;
            timestamp: string;
        }>;
    }>;
    session?: {
        metadata?: {
            target_agent_profile?: any;
            batch_insights?: any;
            meta_analysis?: any;
        };
    };
}

export class ApiService {
    private static instance: ApiService;

    private constructor() { }

    static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    async startAttack(config: StartAttackConfig): Promise<StartAttackResponse> {
        const response = await fetch(`${API_BASE_URL}/api/v1/start-attack`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                target_endpoint: config.targetEndpoint,
                attack_goals: config.attackGoals || [],
                seed_attack_count: config.seedAttackCount || 20,
                max_evolution_steps: config.maxEvolutionSteps || 100,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to start attack: ${response.statusText}`);
        }

        return response.json();
    }

    async getAttackStatus(attackId: string): Promise<AttackStatus> {
        const response = await fetch(`${API_BASE_URL}/api/v1/status/${attackId}`);

        if (!response.ok) {
            throw new Error(`Failed to get attack status: ${response.statusText}`);
        }

        return response.json();
    }

    async getAttackResults(attackId: string): Promise<AttackResults> {
        const response = await fetch(`${API_BASE_URL}/api/v1/results/${attackId}`);

        if (!response.ok) {
            throw new Error(`Failed to get attack results: ${response.statusText}`);
        }

        return response.json();
    }

    async getJailbreaks(limit: number = 50): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/api/v1/jailbreaks?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`Failed to get jailbreaks: ${response.statusText}`);
        }

        return response.json();
    }

    async discoverJailbreaks(maxResultsPerQuery: number = 3): Promise<any> {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/jailbreaks/discover?max_results_per_query=${maxResultsPerQuery}`,
            {
                method: "POST",
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to start jailbreak discovery: ${response.statusText}`);
        }

        return response.json();
    }

    async getDiscoveryStatus(discoveryId: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/api/v1/jailbreaks/status/${discoveryId}`);

        if (!response.ok) {
            throw new Error(`Failed to get discovery status: ${response.statusText}`);
        }

        return response.json();
    }
}

type EventHandler = (data: unknown) => void;

export class WebSocketService {
    private ws: WebSocket | null = null;
    private eventHandlers: Map<WebSocketEventType, EventHandler[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    connect(websocketUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(websocketUrl);

                this.ws.onopen = () => {
                    console.log("[WebSocket] Connected successfully to:", websocketUrl);
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    console.log("[WebSocket] Raw message received:", event.data);
                    try {
                        const message = JSON.parse(event.data);
                        console.log("[WebSocket] Parsed message:", message);
                        this.handleEvent(message);
                    } catch (error) {
                        console.error("[WebSocket] Failed to parse message:", error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log("WebSocket closed");
                    this.attemptReconnect(websocketUrl);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private attemptReconnect(websocketUrl: string): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

            setTimeout(() => {
                this.connect(websocketUrl).catch((error) => {
                    console.error("Reconnection failed:", error);
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    private handleEvent(event: { type: WebSocketEventType; data: unknown }): void {
        console.log(`[WebSocket] Handling event type: ${event.type}`, event.data);
        const handlers = this.eventHandlers.get(event.type);
        if (handlers && handlers.length > 0) {
            console.log(`[WebSocket] Found ${handlers.length} handler(s) for event type: ${event.type}`);
            handlers.forEach((handler) => handler(event.data));
        } else {
            console.warn(`[WebSocket] No handlers registered for event type: ${event.type}`);
        }
    }

    on(eventType: WebSocketEventType, handler: EventHandler): void {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType)!.push(handler);
        console.log(`[WebSocket] Registered handler for event type: ${eventType}. Total handlers: ${this.eventHandlers.get(eventType)!.length}`);
    }

    off(eventType: WebSocketEventType, handler: EventHandler): void {
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.eventHandlers.clear();
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}
