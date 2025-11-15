# Quick Reference: Graph Data Structures

## Core State Structure

```typescript
GraphState {
  nodes: Map<id, GraphNode>              // O(1) lookup
  clusters: Map<id, GraphCluster>        // O(1) lookup
  links: Map<id, EvolutionLink>          // O(1) lookup

  // Indices for fast queries
  nodesByCluster: Map<cluster_id, Set<node_ids>>
  nodesByParent: Map<parent_id, Set<child_ids>>
  linksBySource: Map<node_id, Set<link_ids>>
  linksByTarget: Map<node_id, Set<link_ids>>

  // Layout (separate from data)
  layout: Map<node_id, NodeLayout>

  // UI state
  selectedNodeId: string | null
  hoveredNodeId: string | null
}
```

## Key Operations

- **Add Node:** O(N + P) where P = parent count
- **Get Node:** O(1) - direct Map lookup
- **Get Children:** O(1) lookup + O(C) iteration
- **Query Nodes:** O(N) with filters
- **All operations < 5ms for 200-300 nodes**

## Library Recommendation

**React Flow + D3-Force**
- React Flow for rendering
- D3-Force for physics simulation
- Best balance of ease and power

## Performance Tips

1. Batch WebSocket updates (100ms intervals)
2. Memoize React components
3. Use viewport culling
4. Debounce layout updates (16ms = 60 FPS)
5. Immutable state updates

## Files

- `graph-data-structures.ts` - TypeScript interfaces
- `graph-state-management.ts` - Event handlers
- `example-graph-state.ts` - Sample data
- `GRAPH_LIBRARY_RECOMMENDATIONS.md` - Library comparison
- `DATA_STRUCTURES_DESIGN_SUMMARY.md` - Complete design doc

All files: `/home/user/holistichack/`
