import { memo } from "react";
import { AttackNode } from "@/types/evolution";
import { CheckCircle2, XCircle, HelpCircle, AlertCircle } from "lucide-react";

interface AttackNodeComponentProps {
  node: AttackNode;
  onClick: (node: AttackNode) => void;
}

const AttackNodeComponent = memo(({ node, onClick }: AttackNodeComponentProps) => {
  if (!node.position) {
    console.warn("[AttackNodeComponent] Node has no position:", node.node_id);
    return null;
  }

  const { x, y } = node.position;
  const radius = 20;
  console.log("[AttackNodeComponent] Rendering node:", node.node_id, "at", x, y);

  // Determine node appearance based on status and judge score
  const isRunning = node.status === "running";
  const judgeScore = node.judgeScore || 0;
  
  const strokeColor = isRunning 
    ? "hsl(var(--muted-foreground))"  // Gray/white for running
    : judgeScore > 5
      ? "hsl(var(--success))"         // Green for score > 5
      : judgeScore >= 3
        ? "hsl(var(--warning))"       // Yellow for score 3-5
        : "hsl(var(--destructive))";  // Red for score < 3

  return (
    <g
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick(node);
      }}
      style={{ pointerEvents: 'all' }}
    >
      {/* Node glow effect */}
      <circle
        cx={x}
        cy={y}
        r={radius + 5}
        fill={strokeColor}
        opacity="0.2"
        pointerEvents="none"
      />
      
      {/* Node body */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="hsl(var(--card))"
        stroke={strokeColor}
        strokeWidth="2"
        className="drop-shadow-lg"
      />

      {/* Success/Warning/Failure/Running icon */}
      <foreignObject x={x - 8} y={y - 8} width="16" height="16">
        {isRunning ? (
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        ) : judgeScore > 5 ? (
          <CheckCircle2 className="w-4 h-4 text-success" />
        ) : judgeScore >= 3 ? (
          <AlertCircle className="w-4 h-4" style={{color: "hsl(var(--warning))"}} />
        ) : (
          <XCircle className="w-4 h-4 text-destructive" />
        )}
      </foreignObject>

      {/* Turn count badge */}
      <circle
        cx={x + 15}
        cy={y - 15}
        r="8"
        fill="hsl(var(--primary))"
        className="drop-shadow"
      />
      <text
        x={x + 15}
        y={y - 15}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[10px] font-bold fill-primary-foreground"
      >
        {node.num_turns}
      </text>
    </g>
  );
});

AttackNodeComponent.displayName = "AttackNodeComponent";

export default AttackNodeComponent;
