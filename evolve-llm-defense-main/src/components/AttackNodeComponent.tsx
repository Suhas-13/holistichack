import { memo } from "react";
import { AttackNode } from "@/types/evolution";
import { CheckCircle2, XCircle } from "lucide-react";

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
        fill={node.success ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        opacity="0.2"
        pointerEvents="none"
      />
      
      {/* Node body */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="hsl(var(--card))"
        stroke={node.success ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        strokeWidth="2"
        className="drop-shadow-lg"
      />

      {/* Success/Failure icon */}
      <foreignObject x={x - 8} y={y - 8} width="16" height="16">
        {node.success ? (
          <CheckCircle2 className="w-4 h-4 text-success" />
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
