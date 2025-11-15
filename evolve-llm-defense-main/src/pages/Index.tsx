import { useState, useEffect, useRef, useMemo } from "react";
import ConfigPanel from "@/components/ConfigPanel";
import EvolutionCanvas from "@/components/EvolutionCanvas";
import NodeDetailsPanel from "@/components/NodeDetailsPanel";
import ResultsPanel from "@/components/ResultsPanel";
import {
  AttackNode,
  ClusterData,
  NodeAddPayload,
  NodeUpdatePayload,
  ClusterAddPayload,
  AttackCompletePayload,
} from "@/types/evolution";
import { ApiService, WebSocketService } from "@/services/api";
import { toast } from "sonner";

const CLUSTER_COLORS = [
  "hsl(189, 94%, 55%)",
  "hsl(280, 100%, 70%)",
  "hsl(330, 100%, 70%)",
  "hsl(45, 100%, 60%)",
  "hsl(120, 60%, 50%)",
  "hsl(15, 100%, 60%)",
];

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<AttackNode | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [nodes, setNodes] = useState<Map<string, AttackNode>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [attackId, setAttackId] = useState<string | null>(null);
  
  const apiService = useRef(ApiService.getInstance());
  const wsService = useRef<WebSocketService | null>(null);

  const startEvolution = async (config: {
    targetEndpoint: string;
    attackGoals: string[];
    seedAttackCount: number;
  }) => {
    try {
      setIsRunning(true);
      setClusters([]);
      setNodes(new Map());

      toast.loading("Starting evolution...");

      const response = await apiService.current.startAttack({
        targetEndpoint: config.targetEndpoint,
        attackGoals: config.attackGoals,
        seedAttackCount: config.seedAttackCount,
      });

      setAttackId(response.attack_id);
      console.log("[Index] Attack started with ID:", response.attack_id);
      console.log("[Index] WebSocket URL:", response.websocket_url);

      wsService.current = new WebSocketService();
      
      // Set up handlers BEFORE connecting to avoid missing early messages
      setupWebSocketHandlers();
      
      await wsService.current.connect(response.websocket_url);

      toast.dismiss();
      toast.success("Evolution started", {
        description: `Attack ID: ${response.attack_id.slice(0, 8)}...`,
      });
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to start evolution", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setIsRunning(false);
    }
  };

  const setupWebSocketHandlers = () => {
    console.log("[Index] Setting up WebSocket handlers");
    if (!wsService.current) {
      console.error("[Index] wsService.current is null!");
      return;
    }

    wsService.current.on("agent_mapping_update", (data) => {
      console.log("[Index] agent_mapping_update received:", data);
      const payload = data as { message: string };
      toast.info("Agent mapping", {
        description: payload.message,
      });
    });

    wsService.current.on("cluster_add", (data) => {
      console.log("[Index] ⭐ cluster_add received:", data);
      const payload = data as ClusterAddPayload;
      setClusters((prev) => {
        console.log(`[Index] Current cluster count before add: ${prev.length}`);
        const colorIndex = prev.length % CLUSTER_COLORS.length;
        
        // Calculate random position - scattered across the canvas
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 400;
        const centerX = 600 + (Math.random() - 0.5) * 400;
        const centerY = 400 + (Math.random() - 0.5) * 300;
        
        const position = {
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
        };

        const newCluster: ClusterData = {
          cluster_id: payload.cluster_id,
          name: payload.name,
          position_hint: position,
          node_ids: [],
          parent_cluster_ids: [],
          created_at: new Date().toISOString(),
          nodes: [],
          color: CLUSTER_COLORS[colorIndex],
        };
        console.log("[Index] ✅ Adding new cluster:", newCluster);
        const updated = [...prev, newCluster];
        console.log(`[Index] New cluster count: ${updated.length}`);
        return updated;
      });
    });

    wsService.current.on("node_add", (data) => {
      console.log("[Index] 🔵 node_add received:", data);
      const payload = data as NodeAddPayload;
      console.log(`[Index] Looking for cluster: ${payload.cluster_id}`);
      
      // Create the new node first
      const newNode: AttackNode = {
        node_id: payload.node_id,
        cluster_id: payload.cluster_id,
        parent_ids: payload.parent_ids,
        attack_type: payload.attack_type,
        status: payload.status as "pending" | "running" | "success" | "failure" | "error",
        initial_prompt: "",
        response: null,
        num_turns: 1,
        full_transcript: [],
        model_id: null,
        llm_summary: null,
        full_trace: null,
        success: false,
        fitness_score: 0,
        llama_guard_score: 0,
        generation: 0,
        metadata: {},
        created_at: new Date().toISOString(),
        cost_usd: 0,
        latency_ms: 0,
        position: { x: 0, y: 0 }, // Will be updated below
      };
      
      // Add to nodes map first
      setNodes((prevNodes) => {
        const updated = new Map(prevNodes);
        updated.set(payload.node_id, newNode);
        console.log("[Index] Nodes map size after adding:", updated.size);
        return updated;
      });
      
      // Then update clusters
      setClusters((prev) => {
        const cluster = prev.find((c) => c.cluster_id === payload.cluster_id);
        if (!cluster) {
          console.warn(`[Index] Cluster not found: ${payload.cluster_id}`);
          return prev;
        }

        const existingNodes = cluster.node_ids
          .map((id) => nodes.get(id))
          .filter((n): n is AttackNode => n !== undefined);

        let position;
        
        if (payload.parent_ids.length > 0 && existingNodes.length > 0) {
          const parent = existingNodes.find((n) => payload.parent_ids.includes(n.node_id));
          if (parent && parent.position) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 20;
            position = {
              x: parent.position.x + Math.cos(angle) * distance,
              y: parent.position.y + Math.sin(angle) * distance,
            };
          } else {
            const angle = Math.random() * Math.PI * 2;
            const radius = 30 + Math.random() * 50;
            position = {
              x: cluster.position_hint.x + Math.cos(angle) * radius,
              y: cluster.position_hint.y + Math.sin(angle) * radius,
            };
          }
        } else {
          const angle = Math.random() * Math.PI * 2;
          const radius = 30 + Math.random() * 50;
          position = {
            x: cluster.position_hint.x + Math.cos(angle) * radius,
            y: cluster.position_hint.y + Math.sin(angle) * radius,
          };
        }
        
        // Update the node's position in the Map
        setNodes((prevNodes) => {
          const updated = new Map(prevNodes);
          const nodeToUpdate = updated.get(payload.node_id);
          if (nodeToUpdate) {
            updated.set(payload.node_id, { ...nodeToUpdate, position });
            console.log("[Index] Updated node position:", payload.node_id, position);
          }
          return updated;
        });
        
        console.log("[Index] Adding node to cluster:", payload.node_id, "at position:", position);
        return prev.map((c) =>
          c.cluster_id === payload.cluster_id
            ? { ...c, node_ids: [...c.node_ids, payload.node_id] }
            : c
        );
      });
    });

    wsService.current.on("node_update", (data) => {
      console.log("[Index] node_update received:", data);
      const payload = data as NodeUpdatePayload;
      setNodes((prev) => {
        const updated = new Map(prev);
        const existingNode = updated.get(payload.node_id);
        if (existingNode) {
          console.log(`[Index] Updating existing node ${payload.node_id} with status ${payload.status}`);
          updated.set(payload.node_id, {
            ...existingNode,
            status: payload.status as "pending" | "running" | "success" | "failure" | "error",
            model_id: payload.model_id,
            llm_summary: payload.llm_summary,
            full_transcript: payload.full_transcript,
            full_trace: payload.full_trace,
            success: payload.status === "success",
            completed_at: new Date().toISOString(),
          });
        } else {
          console.warn(`[Index] node_update for non-existent node: ${payload.node_id}`);
        }
        return updated;
      });

      if (payload.status === "success") {
        toast.success("Attack succeeded!", {
          description: payload.llm_summary || "Node updated",
        });
      }
    });

    wsService.current.on("attack_complete", (data) => {
      console.log("[Index] attack_complete received:", data);
      const payload = data as AttackCompletePayload;
      toast.success("Evolution complete!", {
        description: payload.message,
      });
      setIsRunning(false);
    });
    
    console.log("[Index] All WebSocket handlers registered");
  };

  const stopEvolution = () => {
    if (wsService.current) {
      wsService.current.disconnect();
      wsService.current = null;
    }
    setIsRunning(false);
    toast.info("Evolution stopped");
  };

  useEffect(() => {
    return () => {
      if (wsService.current) {
        wsService.current.disconnect();
      }
    };
  }, []);

  const clustersWithNodes = useMemo(() => {
    console.log("[Index] Recomputing clustersWithNodes. Clusters:", clusters.length, "Nodes:", nodes.size);
    return clusters.map((cluster) => {
      const clusterNodes = cluster.node_ids
        .map((id) => nodes.get(id))
        .filter((n): n is AttackNode => n !== undefined);
      console.log(`[Index] Cluster ${cluster.name} has ${clusterNodes.length} nodes`);
      return {
        ...cluster,
        nodes: clusterNodes,
      };
    });
  }, [clusters, nodes]);

  return (
    <div className="min-h-screen bg-background mesh-gradient overflow-hidden">
      {/* Header */}
      <header className="glass border-b border-border/50 backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Evolution Red Team
            </h1>
            <p className="text-sm text-muted-foreground">Evolving LLM jailbreak attacks</p>
          </div>
          <button
            onClick={() => setShowResults(!showResults)}
            className="glass px-6 py-2 rounded-lg font-medium text-foreground hover:bg-primary/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
          >
            {showResults ? "Hide Results" : "View Results"}
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Config Panel */}
        <ConfigPanel
          isRunning={isRunning}
          onStart={startEvolution}
          onStop={stopEvolution}
          clusters={clustersWithNodes}
        />

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <EvolutionCanvas
            clusters={clustersWithNodes}
            onNodeSelect={setSelectedNode}
            isRunning={isRunning}
          />
        </div>

        {/* Side Panel - Node Details or Results */}
        {showResults ? (
          <ResultsPanel clusters={clustersWithNodes} attackId={attackId} />
        ) : selectedNode ? (
          <NodeDetailsPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Index;
