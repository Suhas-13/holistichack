import { memo, useMemo, useEffect, useState } from "react";
import { ClusterData } from "@/types/evolution";
import { ApiService, AttackResults as ApiAttackResults } from "@/services/api";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Target, Zap, X } from "lucide-react";

interface ResultsPanelProps {
  clusters: ClusterData[];
  attackId: string | null;
  onClose?: () => void;
}

const ResultsPanel = memo(({ clusters, attackId, onClose }: ResultsPanelProps) => {
  const [apiResults, setApiResults] = useState<ApiAttackResults | null>(null);
  const apiService = ApiService.getInstance();

  useEffect(() => {
    if (attackId) {
      apiService.getAttackResults(attackId).then(setApiResults).catch(console.error);
    }
  }, [attackId]);

  const stats = useMemo(() => {
    const totalNodes = clusters.reduce((sum, c) => sum + (c.nodes?.length || 0), 0);
    const successfulNodes = clusters.reduce(
      (sum, c) => sum + (c.nodes?.filter((n) => n.success).length || 0),
      0
    );
    const successRate = totalNodes > 0 ? (successfulNodes / totalNodes) * 100 : 0;

    const topAttacks = clusters
      .flatMap((c) => c.nodes || [])
      .filter((n) => n.success)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    return { totalNodes, successfulNodes, successRate, topAttacks };
  }, [clusters]);

  return (
    <div className="w-full h-full glass border border-border/50 rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Results Summary</h2>
            <p className="text-sm text-muted-foreground">Evolution insights and successful attacks</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-border/50 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-4 rounded-lg space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Attacks</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalNodes}</p>
          </div>

          <div className="glass p-4 rounded-lg space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Successful</span>
            </div>
            <p className="text-2xl font-bold text-success">{stats.successfulNodes}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            {stats.successRate > 50 ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{stats.successRate.toFixed(1)}%</p>
          </div>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500"
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Attacks */}
      <div className="flex-1 p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Top Successful Attacks</h3>
        <ScrollArea className="h-full">
          <div className="space-y-3">
            {stats.topAttacks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No successful attacks yet
              </p>
            ) : (
              stats.topAttacks.map((node) => (
                <div
                  key={node.node_id}
                  className="glass p-4 rounded-lg space-y-2 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="text-xs">
                      {node.attack_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {node.num_turns} turns
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    {node.llm_summary || node.initial_prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{node.model_id || "Unknown"}</span>
                    <span>{new Date(node.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
});

ResultsPanel.displayName = "ResultsPanel";

export default ResultsPanel;
