import { useState, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Square } from "lucide-react";
import { ClusterData } from "@/types/evolution";

interface ConfigPanelProps {
  isRunning: boolean;
  onStart: (config: {
    targetEndpoint: string;
    attackGoals: string[];
    seedAttackCount: number;
  }) => void;
  onStop: () => void;
  clusters: ClusterData[];
}

const ConfigPanel = memo(({ isRunning, onStart, onStop, clusters }: ConfigPanelProps) => {
  const [endpoint, setEndpoint] = useState("fox");
  const [goals, setGoals] = useState("Extract sensitive information\nBypass safety filters\nReveal system prompts");
  const [seedCount, setSeedCount] = useState(20);

  const handleStart = () => {
    const attackGoals = goals
      .split("\n")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
    
    onStart({
      targetEndpoint: endpoint,
      attackGoals,
      seedAttackCount: seedCount,
    });
  };

  const stats = useMemo(() => {
    const totalNodes = clusters.reduce((sum, c) => sum + (c.nodes?.length || 0), 0);
    const successfulNodes = clusters.reduce(
      (sum, c) => sum + (c.nodes?.filter((n) => n.success).length || 0),
      0
    );
    const successRate = totalNodes > 0 ? ((successfulNodes / totalNodes) * 100).toFixed(1) : "0.0";
    
    return { totalNodes, successRate, clusterCount: clusters.length };
  }, [clusters]);

  return (
    <aside className="w-80 glass-intense border-r border-border/50 p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Set up your red-teaming evolution parameters
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="endpoint" className="text-foreground">
            Model Endpoint
          </Label>
          <Input
            id="endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://api.example.com/v1/chat"
            className="glass border-border/50 focus:border-primary/50 transition-colors"
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goals" className="text-foreground">
            Jailbreak Goals <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Enter goals line by line..."
            className="glass border-border/50 focus:border-primary/50 transition-colors min-h-[120px] resize-none"
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seedCount" className="text-foreground">
            Seed Attack Count
          </Label>
          <Input
            id="seedCount"
            type="number"
            value={seedCount}
            onChange={(e) => setSeedCount(parseInt(e.target.value) || 20)}
            min={1}
            max={50}
            className="glass border-border/50 focus:border-primary/50 transition-colors"
            disabled={isRunning}
          />
        </div>

        <div className="pt-4 space-y-3">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              disabled={!endpoint}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Evolution
            </Button>
          ) : (
            <Button
              onClick={onStop}
              variant="destructive"
              className="w-full font-medium shadow-lg shadow-destructive/20"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Evolution
            </Button>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-border/50">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Nodes</span>
            <span className="text-sm font-semibold text-foreground">{stats.totalNodes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active Clusters</span>
            <span className="text-sm font-semibold text-foreground">{stats.clusterCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="text-sm font-semibold text-success">{stats.successRate}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
});

ConfigPanel.displayName = "ConfigPanel";

export default ConfigPanel;
