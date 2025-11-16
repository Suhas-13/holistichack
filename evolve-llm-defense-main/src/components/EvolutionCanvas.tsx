import { useRef, useState, useCallback, memo } from "react";
import { AttackNode, ClusterData } from "@/types/evolution";
import ClusterVisualization from "./ClusterVisualization";
import { ZoomIn, ZoomOut, Maximize2, Filter } from "lucide-react";
import { Button } from "./ui/button";

interface EvolutionCanvasProps {
  clusters: ClusterData[];
  onNodeSelect: (node: AttackNode) => void;
  isRunning: boolean;
}

const EvolutionCanvas = memo(({ clusters, onNodeSelect, isRunning }: EvolutionCanvasProps) => {
  console.log("[EvolutionCanvas] Rendering with", clusters.length, "clusters");
  const canvasRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showSuccessfulOnly, setShowSuccessfulOnly] = useState(false);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(0.5, prev.scale + delta), 3),
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform.x, transform.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    }));
  }, [isPanning, panStart.x, panStart.y]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.min(3, prev.scale + 0.2) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.2) }));
  }, []);

  const toggleSuccessfulOnly = useCallback(() => {
    setShowSuccessfulOnly(prev => !prev);
  }, []);

  // Filter clusters to show successful (green) and warning (yellow) nodes if toggle is active
  const filteredClusters = showSuccessfulOnly
    ? clusters.map(cluster => ({
        ...cluster,
        nodes: cluster.nodes?.filter(node => 
          node.judgeScore && node.judgeScore >= 3
        ) || []
      })).filter(cluster => cluster.nodes && cluster.nodes.length > 0)
    : clusters;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Controls */}
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <Button
          size="icon"
          onClick={handleZoomIn}
          className="glass hover:bg-primary/10"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </Button>
        <Button
          size="icon"
          onClick={handleZoomOut}
          className="glass hover:bg-primary/10"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </Button>
        <Button
          size="icon"
          onClick={resetView}
          className="glass hover:bg-primary/10"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </Button>
        <Button
          size="icon"
          onClick={toggleSuccessfulOnly}
          className={`glass hover:bg-primary/10 ${showSuccessfulOnly ? 'bg-success/20 border-success/50' : ''}`}
          title={showSuccessfulOnly ? "Show all nodes" : "Show only successful & partial results"}
        >
          <Filter className="w-4 h-4 text-white" />
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.3s ease-out',
          }}
          className="w-full h-full"
        >
          {filteredClusters.length === 0 && !isRunning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 animate-fade-in">
                <div className="w-24 h-24 mx-auto rounded-full glass-intense flex items-center justify-center animate-pulse-glow">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Evolve</h3>
                  <p className="text-muted-foreground">Configure your parameters and start the evolution</p>
                </div>
              </div>
            </div>
          )}

          <ClusterVisualization
            clusters={filteredClusters}
            onNodeSelect={onNodeSelect}
          />
        </div>
      </div>
    </div>
  );
});

EvolutionCanvas.displayName = "EvolutionCanvas";

export default EvolutionCanvas;
