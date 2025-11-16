import { memo } from "react";
import { AttackNode, ClusterData } from "@/types/evolution";
import { X, Clock, Hash, MessageSquare, Brain, Target, Shield, GitBranch, Zap, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface NodeDetailsPanelProps {
  node: AttackNode;
  allClusters?: ClusterData[];
  onClose: () => void;
  onNodeSelect?: (node: AttackNode) => void;
}

const NodeDetailsPanel = memo(({ node, allClusters = [], onClose, onNodeSelect }: NodeDetailsPanelProps) => {
  // Helper function to find a node by ID
  const findNodeById = (nodeId: string): AttackNode | undefined => {
    return allClusters.flatMap(c => c.nodes || []).find(n => n.node_id === nodeId);
  };

  // Build mutation history chain
  const buildMutationChain = (currentNode: AttackNode): Array<{node: AttackNode, mutationStyle?: string}> => {
    const chain: Array<{node: AttackNode, mutationStyle?: string}> = [];
    let current = currentNode;
    
    while (current) {
      chain.push({
        node: current,
        mutationStyle: current.metadata?.mutation_style || current.attack_style
      });
      
      // Get the first parent (for simplicity)
      const parentId = current.parent_ids[0];
      if (!parentId) break;
      
      const parent = findNodeById(parentId);
      if (!parent) break;
      
      current = parent;
    }
    
    return chain.reverse(); // Return from root to current
  };

  const mutationChain = buildMutationChain(node);
  return (
    <aside className="w-[550px] glass-intense border-l border-border/50 flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Attack Details</h2>
            <p className="text-sm text-muted-foreground">Node {node.node_id}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={node.success ? "default" : "destructive"}
            className="font-medium"
          >
            {node.success ? "Success" : "Failed"}
          </Badge>
          <Badge variant="outline" className="glass">
            {node.attack_type}
          </Badge>
          <Badge variant="secondary" className="glass">
            {node.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Hash className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Turns:</span>
              <span className="font-medium text-foreground">{node.num_turns}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium text-foreground">
                {new Date(node.created_at).toLocaleString()}
              </span>
            </div>
            {node.model_id && (
              <div className="flex items-center gap-3 text-sm">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium text-foreground">{node.model_id}</span>
              </div>
            )}
          </div>

          {/* Evolution History */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              Evolution History
            </h3>
            
            {/* Parent History */}
            {node.generation === 0 ? (
              <div className="glass p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">This is a seed node (Generation 1)</div>
              </div>
            ) : node.metadata?.parent_history && node.metadata.parent_history.length > 0 ? (
              <div className="glass p-3 rounded-lg">
                <div className="text-xs font-medium text-foreground mb-2">Parent Nodes:</div>
                <div className="flex flex-wrap gap-1">
                  {node.metadata.parent_history.map((parentId: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {parentId}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">No parent history available</div>
              </div>
            )}

            {/* Mutation History */}
            {node.generation > 0 && (
              node.metadata?.mutation_history && node.metadata.mutation_history.length > 0 ? (
                <div className="glass p-3 rounded-lg">
                  <div className="text-xs font-medium text-foreground mb-2">
                    Mutations Applied ({node.metadata.mutation_history.length}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {node.metadata.mutation_history.map((mutation: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs bg-accent/10">
                        {index + 1}. {mutation}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">No mutation history available</div>
                </div>
              )
            )}
          </div>

          {/* Mutation Tree */}
          {mutationChain.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                Mutation Chain ({mutationChain.length} generations)
              </h3>
              <div className="space-y-3">
                {mutationChain.map((entry, index) => (
                  <div key={entry.node.node_id} className="flex items-center gap-3">
                    {/* Generation indicator */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    
                    {/* Node info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => onNodeSelect?.(entry.node)}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate"
                          title={`Click to select ${entry.node.node_id}`}
                        >
                          {entry.node.node_id.slice(0, 12)}...
                        </button>
                        <Badge 
                          variant={entry.node.success ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {entry.node.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      
                      {/* Mutation applied */}
                      {entry.mutationStyle && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3" />
                          <span>Style: {entry.mutationStyle}</span>
                          {entry.node.metadata?.parent_fitness && (
                            <span className="ml-2">
                              Parent fitness: {(entry.node.metadata.parent_fitness * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Arrow to next */}
                    {index < mutationChain.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Current mutation info */}
              {node.attack_style && (
                <div className="mt-3 p-3 glass rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Current Mutation</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {node.attack_style}
                    </Badge>
                    {node.generation >= 0 && (
                      <span className="text-xs text-muted-foreground">
                        Generation {node.generation + 1}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LLM Summary */}
          {node.llm_summary && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              <div className="glass p-4 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {node.llm_summary}
                </p>
              </div>
            </div>
          )}

          {/* Prompt */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Attack Prompt</h3>
            <div className="glass p-4 rounded-lg">
              <p className="text-sm text-foreground whitespace-pre-wrap font-mono">
                {node.initial_prompt}
              </p>
            </div>
          </div>

          {/* Transcript - Chat Bubble UI */}
          {node.full_transcript.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Conversation ({node.full_transcript.length} turns)
              </h3>
              <div className="space-y-3">
                {node.full_transcript.map((turn, idx) => {
                  const isAttacker = turn.role === "attacker";
                  return (
                    <div
                      key={idx}
                      className={`flex ${isAttacker ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${isAttacker ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isAttacker
                            ? "bg-red-500/10 border border-red-500/30"
                            : "bg-green-500/10 border border-green-500/30"
                        }`}>
                          {isAttacker ? (
                            <Target className="w-4 h-4 text-red-500" />
                          ) : (
                            <Shield className="w-4 h-4 text-green-500" />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex flex-col ${isAttacker ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              isAttacker ? "text-red-500" : "text-green-500"
                            }`}>
                              {isAttacker ? "Attacker" : "Agent"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Turn {idx + 1}
                            </span>
                          </div>
                          <div className={`rounded-2xl px-4 py-3 ${
                            isAttacker
                              ? "bg-red-500/10 border border-red-500/20 rounded-tr-sm"
                              : "bg-green-500/10 border border-green-500/20 rounded-tl-sm"
                          }`}>
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                              {turn.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
});

NodeDetailsPanel.displayName = "NodeDetailsPanel";

export default NodeDetailsPanel;
