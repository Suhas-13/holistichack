import { useState, useEffect, useRef, useMemo } from "react";
import ConfigPanel from "@/components/ConfigPanel";
import EvolutionCanvas from "@/components/EvolutionCanvas";
import NodeDetailsPanel from "@/components/NodeDetailsPanel";
import ResultsPanel from "@/components/ResultsPanel";
import AgentProfilePanel from "@/components/AgentProfilePanel";
import JailbreaksPanel from "@/components/JailbreaksPanel";
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
import { Eye, BarChart3 } from "lucide-react";

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
  const [showAgentProfile, setShowAgentProfile] = useState(false);
  const [showJailbreaks, setShowJailbreaks] = useState(false);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [nodes, setNodes] = useState<Map<string, AttackNode>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [attackId, setAttackId] = useState<string | null>(null);
  
  const apiService = useRef(ApiService.getInstance());
  const wsService = useRef<WebSocketService | null>(null);

  const handleNodeSelect = (node: AttackNode | null) => {
    setSelectedNode(node);
    if (node) {
      // Close other panels when selecting a node
      setShowResults(false);
      setShowJailbreaks(false);
    }
  };

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
        
        // Smart cluster positioning with space-finding algorithm
        const minDistance = 350;
        const minX = 220;
        const maxX = 1220;
        const minY = 200;
        const maxY = 700;
        
        // Generate candidate positions in a grid pattern with randomness
        const findBestPosition = () => {
          if (prev.length === 0) {
            // First cluster goes in the center with slight randomness
            return {
              x: 800 + (Math.random() - 0.5) * 100,
              y: 450 + (Math.random() - 0.5) * 100,
            };
          }
          
          // Create a grid of potential positions
          const gridStep = minDistance * 0.8;
          const candidates: Array<{ x: number; y: number; score: number }> = [];
          
          for (let x = minX; x <= maxX; x += gridStep) {
            for (let y = minY; y <= maxY; y += gridStep) {
              // Add randomness to grid position
              const candidateX = x + (Math.random() - 0.5) * gridStep * 0.5;
              const candidateY = y + (Math.random() - 0.5) * gridStep * 0.5;
              
              // Check if this position is valid (far enough from all clusters)
              let minDistToCluster = Infinity;
              let isValid = true;
              
              for (const cluster of prev) {
                const dx = cluster.position_hint.x - candidateX;
                const dy = cluster.position_hint.y - candidateY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < minDistance) {
                  isValid = false;
                  break;
                }
                
                minDistToCluster = Math.min(minDistToCluster, dist);
              }
              
              if (isValid) {
                // Score based on distance from other clusters (prefer middle distances)
                // and distance from edges
                const edgeDistX = Math.min(candidateX - minX, maxX - candidateX);
                const edgeDistY = Math.min(candidateY - minY, maxY - candidateY);
                const edgeDist = Math.min(edgeDistX, edgeDistY);
                
                // Prefer positions that are well-spaced but not too far from center
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                const distFromCenter = Math.sqrt(
                  Math.pow(candidateX - centerX, 2) + Math.pow(candidateY - centerY, 2)
                );
                
                const score = minDistToCluster * 0.5 + edgeDist * 0.3 - distFromCenter * 0.2;
                
                candidates.push({ x: candidateX, y: candidateY, score });
              }
            }
          }
          
          if (candidates.length === 0) {
            // Fallback: find the position furthest from all clusters
            let bestPos = { x: 800, y: 450 };
            let maxMinDist = 0;
            
            for (let i = 0; i < 100; i++) {
              const x = minX + Math.random() * (maxX - minX);
              const y = minY + Math.random() * (maxY - minY);
              
              const minDist = Math.min(
                ...prev.map(cluster => {
                  const dx = cluster.position_hint.x - x;
                  const dy = cluster.position_hint.y - y;
                  return Math.sqrt(dx * dx + dy * dy);
                })
              );
              
              if (minDist > maxMinDist) {
                maxMinDist = minDist;
                bestPos = { x, y };
              }
            }
            
            return bestPos;
          }
          
          // Sort by score and pick from top candidates with randomness
          candidates.sort((a, b) => b.score - a.score);
          const topCandidates = candidates.slice(0, Math.min(5, candidates.length));
          const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];
          
          return { x: chosen.x, y: chosen.y };
        };
        
        const position = findBestPosition();

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
        generation: payload.generation || 0,
        metadata: payload.metadata || {},
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
          // Extract raw LLM judge score (1-10) from trace metadata
          const judgeScore = payload.full_trace?.verification_metadata?.raw_judge_score || 0;
          
          updated.set(payload.node_id, {
            ...existingNode,
            status: payload.status as "pending" | "running" | "success" | "failure" | "error",
            model_id: payload.model_id,
            llm_summary: payload.llm_summary,
            initial_prompt: payload.initial_prompt || existingNode.initial_prompt,
            response: payload.response !== undefined ? payload.response : existingNode.response,
            full_transcript: payload.full_transcript,
            full_trace: payload.full_trace,
            success: payload.status === "success",
            completed_at: new Date().toISOString(),
            generation: payload.generation !== undefined ? payload.generation : existingNode.generation,
            // Preserve existing metadata and merge with any new metadata
            metadata: { ...existingNode.metadata, ...(payload as any).metadata },
            // Add the raw judge score for color determination
            judgeScore: judgeScore,
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

    // Profile analysis events
    wsService.current.on("profile_analysis_start", (data) => {
      console.log("[Index] profile_analysis_start received:", data);
      const payload = data as { phase: string; total_attacks: number; message: string };
      toast.info("🔬 Agent Profiling", {
        description: payload.message,
        duration: 3000,
      });
    });

    wsService.current.on("profile_analysis_progress", (data) => {
      console.log("[Index] profile_analysis_progress received:", data);
      const payload = data as { phase: string; progress: number; message: string };
      const percentage = Math.round(payload.progress * 100);
      toast.info(`🔬 Profiling (${percentage}%)`, {
        description: payload.message,
        duration: 2000,
      });
    });

    wsService.current.on("profile_analysis_complete", (data) => {
      console.log("[Index] profile_analysis_complete received:", data);
      const payload = data as any;
      toast.success("🔬 Agent Profile Complete!", {
        description: `${payload.behavior_patterns_count} behaviors, ${payload.failure_modes_count} vulnerabilities, ${payload.tools_analyzed} tools analyzed`,
        duration: 5000,
      });
    });

    wsService.current.on("advanced_analytics_complete", (data) => {
      console.log("[Index] advanced_analytics_complete received:", data);
      const payload = data as any;
      const riskEmoji = payload.risk_category === "critical" ? "🔴" :
                        payload.risk_category === "high" ? "🟠" :
                        payload.risk_category === "medium" ? "🟡" : "🟢";
      toast.info(`${riskEmoji} Advanced Analytics Complete`, {
        description: `Risk: ${payload.risk_category.toUpperCase()} (${Math.round(payload.overall_risk)}/100) - ${payload.exploitable_vectors} exploitable vectors found`,
        duration: 6000,
      });
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

          {/* Center Analysis Tools */}
          <div className="flex gap-2.5">
            <button
              onClick={() => {
                setShowAgentProfile(!showAgentProfile);
                setShowResults(false);
                setSelectedNode(null);
                setShowJailbreaks(false);
              }}
              disabled={!attackId || isRunning}
              className={`group relative px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-500 overflow-hidden ${
                !attackId || isRunning ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
              }`}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/20 to-primary/30 backdrop-blur-xl transition-all duration-500 ${
                showAgentProfile
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}></div>

              {/* Glass layer */}
              <div className="absolute inset-0 glass-intense border border-primary/30 rounded-lg"></div>

              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-lg transition-all duration-500 ${
                showAgentProfile
                  ? "shadow-[0_0_25px_rgba(139,92,246,0.4)] border border-primary/60"
                  : "group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              }`}></div>

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>

              <span className="relative z-10 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>Agent Glass Box</span>
              </span>
            </button>

            <button
              onClick={() => {
                setShowResults(!showResults);
                setShowAgentProfile(false);
                setSelectedNode(null);
                setShowJailbreaks(false);
              }}
              className="group relative px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-500 overflow-hidden hover:scale-105 active:scale-95"
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br from-accent/30 via-blue-500/20 to-accent/30 backdrop-blur-xl transition-all duration-500 ${
                showResults
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}></div>

              {/* Glass layer */}
              <div className="absolute inset-0 glass-intense border border-accent/30 rounded-lg"></div>

              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-lg transition-all duration-500 ${
                showResults
                  ? "shadow-[0_0_25px_rgba(59,130,246,0.4)] border border-accent/60"
                  : "group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              }`}></div>

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>

              <span className="relative z-10 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                <span>{showResults ? "Hide" : "View"} Results</span>
              </span>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowJailbreaks(!showJailbreaks)}
              className={`glass px-6 py-2 rounded-lg font-medium text-foreground transition-all duration-300 ${
                showJailbreaks
                  ? "bg-accent/20 border border-accent/50 shadow-lg shadow-accent/20"
                  : "hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/20"
              }`}
            >
              📚 Jailbreaks
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Config Panel */}
        <ConfigPanel
          isRunning={isRunning}
          onStart={startEvolution}
          onStop={stopEvolution}
          clusters={clustersWithNodes}
          attackId={attackId}
          onShowAgentProfile={() => {
            setShowAgentProfile(!showAgentProfile);
            setShowResults(false);
            setSelectedNode(null);
            setShowJailbreaks(false);
          }}
          onShowResults={() => {
            setShowResults(!showResults);
            setShowAgentProfile(false);
            setSelectedNode(null);
            setShowJailbreaks(false);
          }}
          showAgentProfile={showAgentProfile}
          showResults={showResults}
        />

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <EvolutionCanvas
            clusters={clustersWithNodes}
            onNodeSelect={handleNodeSelect}
            selectedNode={selectedNode}
            isRunning={isRunning}
          />
        </div>

        {/* Right Side Panel - Jailbreaks, Results, or Node Details */}
        {showJailbreaks ? (
          <JailbreaksPanel onClose={() => setShowJailbreaks(false)} />
        ) : showResults ? (
          <ResultsPanel
            clusters={clustersWithNodes}
            attackId={attackId}
            onClose={() => setShowResults(false)}
          />
        ) : selectedNode ? (
          <NodeDetailsPanel
            node={selectedNode}
            allClusters={clusters}
            onClose={() => setSelectedNode(null)}
            onNodeSelect={setSelectedNode}
          />
        ) : null}
      </div>

      {/* Centered Modal Overlay - Only Agent Profile */}
      {showAgentProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAgentProfile(false)}
        >
          <div
            className="w-full max-w-5xl h-[90vh] animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <AgentProfilePanel
              attackId={attackId}
              onClose={() => setShowAgentProfile(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
