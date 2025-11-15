import { memo } from "react";
import { AttackNode } from "@/types/evolution";
import { X, Clock, Hash, MessageSquare, Brain } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface NodeDetailsPanelProps {
  node: AttackNode;
  onClose: () => void;
}

const NodeDetailsPanel = memo(({ node, onClose }: NodeDetailsPanelProps) => {
  return (
    <aside className="w-96 glass-intense border-l border-border/50 flex flex-col animate-slide-in">
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

          {/* Transcript */}
          {node.full_transcript.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Full Transcript</h3>
              <div className="space-y-2">
                {node.full_transcript.map((turn, idx) => (
                  <div key={idx} className="glass p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      {turn.role === "attacker" ? "Attacker" : "Model"}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {turn.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response */}
          {node.response && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Model Response</h3>
              <div className="glass p-4 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {node.response}
                </p>
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
