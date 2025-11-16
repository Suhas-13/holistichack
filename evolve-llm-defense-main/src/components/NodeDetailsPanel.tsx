import { memo } from "react";
import { AttackNode } from "@/types/evolution";
import { X, Clock, Hash, MessageSquare, Brain, Target, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface NodeDetailsPanelProps {
  node: AttackNode;
  onClose: () => void;
}

const NodeDetailsPanel = memo(({ node, onClose }: NodeDetailsPanelProps) => {
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
          {/* Assigned Goal */}
          {node.assigned_goal && (
            <div className="glass p-3 rounded-lg border border-primary/30 mb-6">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-primary mb-1">
                    Attack Goal
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {node.assigned_goal.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {node.assigned_goal.description}
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* Parents */}
          {node.parent_ids.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Parent Nodes
              </h3>
              <div className="flex flex-wrap gap-2">
                {node.parent_ids.map((parentId) => (
                  <Badge key={parentId} variant="secondary" className="glass">
                    {parentId.slice(0, 8)}...
                  </Badge>
                ))}
              </div>
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
