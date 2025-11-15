import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  OnEdgesChange,
  Connection,
  addEdge,
  Panel,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';

import { AttackNode, AttackNodeData } from './AttackNode';
import { EvolutionEdge, EvolutionEdgeData } from './EvolutionEdge';
import { ClusterBackground } from './ClusterBackground';

import { useGraphStore } from '../../stores/graphStore';
import { useUiStore } from '../../stores/uiStore';
import { GraphNode, EvolutionLink, NodeLayout } from '../../types/graph-data-structures';

// Custom node types
const nodeTypes: NodeTypes = {
  attackNode: AttackNode
};

// Custom edge types
const edgeTypes: EdgeTypes = {
  evolutionEdge: EvolutionEdge
};

// Convert graph data to ReactFlow format
function convertNodesToReactFlow(
  nodes: Map<string, GraphNode>,
  layouts: Map<string, NodeLayout>
): Node<AttackNodeData>[] {
  return Array.from(nodes.values()).map(node => {
    const layout = layouts.get(node.node_id);
    return {
      id: node.node_id,
      type: 'attackNode',
      position: layout
        ? { x: layout.position.x, y: layout.position.y }
        : { x: 0, y: 0 },
      data: {
        ...node,
        label: node.node_id
      },
      draggable: true
    };
  });
}

function convertEdgesToReactFlow(
  links: Map<string, EvolutionLink>
): Edge<EvolutionEdgeData>[] {
  const edges: Edge<EvolutionEdgeData>[] = [];

  links.forEach(link => {
    // Handle multiple sources (for combination attacks)
    link.source_node_ids.forEach(sourceId => {
      edges.push({
        id: `${link.link_id}-${sourceId}`,
        source: sourceId,
        target: link.target_node_id,
        type: 'evolutionEdge',
        data: {
          evolution_type: link.evolution_type,
          animated: link.animated,
          strength: link.strength,
          description: link.description
        },
        animated: link.animated || false
      });
    });
  });

  return edges;
}

export const GraphCanvas: React.FC = () => {
  // Get state from stores
  const {
    nodes: graphNodes,
    links,
    layout: nodeLayouts,
    clusters,
    selectNode,
    selectedNodeId
  } = useGraphStore();

  const {
    setSelectedNodeId,
    showMiniMap,
    showControls,
    viewport,
    setViewport
  } = useUiStore();

  // Convert to ReactFlow format
  const initialNodes = useMemo(
    () => convertNodesToReactFlow(graphNodes, nodeLayouts),
    [graphNodes, nodeLayouts]
  );

  const initialEdges = useMemo(
    () => convertEdgesToReactFlow(links),
    [links]
  );

  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when graph store changes
  useEffect(() => {
    setNodes(convertNodesToReactFlow(graphNodes, nodeLayouts));
  }, [graphNodes, nodeLayouts, setNodes]);

  // Update edges when links change
  useEffect(() => {
    setEdges(convertEdgesToReactFlow(links));
  }, [links, setEdges]);

  // Handle node click
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      selectNode(node.id);
    },
    [setSelectedNodeId, selectNode]
  );

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    selectNode(null);
  }, [setSelectedNodeId, selectNode]);

  // Handle viewport change
  const onMoveEnd = useCallback(
    (_event: any, viewport: { x: number; y: number; zoom: number }) => {
      setViewport(viewport);
    },
    [setViewport]
  );

  // Get cluster nodes for backgrounds
  const clusterBackgrounds = useMemo(() => {
    const backgrounds: Array<{
      cluster: any;
      nodeLayouts: NodeLayout[];
    }> = [];

    clusters.forEach(cluster => {
      const clusterNodes = Array.from(graphNodes.values()).filter(
        node => node.cluster_id === cluster.cluster_id
      );

      const clusterLayouts = clusterNodes
        .map(node => nodeLayouts.get(node.node_id))
        .filter(Boolean) as NodeLayout[];

      backgrounds.push({
        cluster,
        nodeLayouts: clusterLayouts
      });
    });

    return backgrounds;
  }, [clusters, graphNodes, nodeLayouts]);

  return (
    <div className="w-full h-full relative bg-[#0a0e14]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          maxZoom: 1.5
        }}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{
          x: viewport.x,
          y: viewport.y,
          zoom: viewport.zoom
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-[#0a0e14]"
      >
        {/* Cluster backgrounds (rendered before nodes) */}
        <svg className="react-flow__background absolute inset-0 pointer-events-none z-0">
          {clusterBackgrounds.map(({ cluster, nodeLayouts }) => (
            <ClusterBackground
              key={cluster.cluster_id}
              cluster={cluster}
              nodeLayouts={nodeLayouts}
              viewport={viewport}
            />
          ))}
        </svg>

        {/* Background Grid */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1f2937"
          className="opacity-30"
        />

        {/* Controls */}
        {showControls && (
          <Controls
            className="!bg-gray-900/90 !border-gray-700 !backdrop-blur-sm"
            showInteractive={false}
          />
        )}

        {/* MiniMap */}
        {showMiniMap && (
          <MiniMap
            className="!bg-gray-900/90 !border-gray-700 !backdrop-blur-sm"
            nodeColor={(node) => {
              const data = node.data as AttackNodeData;
              switch (data.status) {
                case 'success':
                  return '#10b981';
                case 'failed':
                  return '#ef4444';
                case 'in_progress':
                  return '#00d9ff';
                case 'pending':
                  return '#6b7280';
                default:
                  return '#9ca3af';
              }
            }}
            maskColor="#0a0e1480"
            pannable
            zoomable
          />
        )}

        {/* Info Panel */}
        <Panel position="top-left" className="m-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-[200px]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Nodes</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {graphNodes.size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Links</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {links.size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Clusters</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {clusters.size}
                </span>
              </div>
            </div>
          </motion.div>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-right" className="m-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4"
          >
            <h3 className="text-white font-mono font-bold text-sm mb-3">
              STATUS
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-700" />
                <span className="text-gray-400">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-gray-400">Running</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-gray-400">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-400">Failed</span>
              </div>
            </div>
          </motion.div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
