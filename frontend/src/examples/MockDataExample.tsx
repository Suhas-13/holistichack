/**
 * Mock Data Example
 *
 * This file demonstrates how to populate the graph with mock data
 * for testing and development purposes.
 */

import { useEffect } from 'react';
import { useGraphStore } from '../stores/graphStore';
import {
  NodeStatus,
  AttackType,
  EvolutionType
} from '../types/graph-data-structures';

export function useMockData() {
  const { handleEvent } = useGraphStore();

  useEffect(() => {
    // Clear existing data
    useGraphStore.getState().reset();

    // Add clusters (AI agents)
    const clusters = [
      {
        cluster_id: 'eagle',
        name: 'Eagle',
        position_hint: { x: 200, y: 200 },
        color: '#FF6B6B'
      },
      {
        cluster_id: 'wolf',
        name: 'Wolf',
        position_hint: { x: 600, y: 200 },
        color: '#4ECDC4'
      },
      {
        cluster_id: 'hawk',
        name: 'Hawk',
        position_hint: { x: 400, y: 400 },
        color: '#45B7D1'
      }
    ];

    clusters.forEach(cluster => {
      handleEvent({
        type: 'cluster_add',
        data: cluster
      });
    });

    // Add initial nodes
    const nodes = [
      // Eagle cluster
      {
        node_id: 'eagle_001',
        cluster_id: 'eagle',
        parent_ids: [],
        attack_type: AttackType.JAILBREAK,
        status: NodeStatus.SUCCESS,
        timestamp: Date.now() - 10000,
        model_id: 'gpt-3.5',
        success_score: 85
      },
      {
        node_id: 'eagle_002',
        cluster_id: 'eagle',
        parent_ids: ['eagle_001'],
        attack_type: AttackType.PROMPT_INJECTION,
        status: NodeStatus.SUCCESS,
        timestamp: Date.now() - 8000,
        success_score: 92
      },
      {
        node_id: 'eagle_003',
        cluster_id: 'eagle',
        parent_ids: ['eagle_002'],
        attack_type: AttackType.SYSTEM_PROMPT_LEAK,
        status: NodeStatus.IN_PROGRESS,
        timestamp: Date.now() - 5000
      },

      // Wolf cluster
      {
        node_id: 'wolf_001',
        cluster_id: 'wolf',
        parent_ids: [],
        attack_type: AttackType.BASE64_ENCODING,
        status: NodeStatus.SUCCESS,
        timestamp: Date.now() - 9000,
        success_score: 78
      },
      {
        node_id: 'wolf_002',
        cluster_id: 'wolf',
        parent_ids: ['wolf_001'],
        attack_type: AttackType.ROLE_PLAY,
        status: NodeStatus.FAILED,
        timestamp: Date.now() - 7000
      },
      {
        node_id: 'wolf_003',
        cluster_id: 'wolf',
        parent_ids: ['wolf_001'],
        attack_type: AttackType.UNICODE_BYPASS,
        status: NodeStatus.PENDING,
        timestamp: Date.now() - 4000
      },

      // Hawk cluster
      {
        node_id: 'hawk_001',
        cluster_id: 'hawk',
        parent_ids: [],
        attack_type: AttackType.MODEL_EXTRACTION,
        status: NodeStatus.SUCCESS,
        timestamp: Date.now() - 9500,
        model_id: 'claude-2',
        success_score: 95
      },
      {
        node_id: 'hawk_002',
        cluster_id: 'hawk',
        parent_ids: ['hawk_001'],
        attack_type: AttackType.FUNCTION_ENUMERATION,
        status: NodeStatus.PARTIAL,
        timestamp: Date.now() - 6000,
        success_score: 60
      },
      {
        node_id: 'hawk_003',
        cluster_id: 'hawk',
        parent_ids: ['hawk_002'],
        attack_type: AttackType.ERROR_EXPLOITATION,
        status: NodeStatus.IN_PROGRESS,
        timestamp: Date.now() - 3000
      },
      {
        node_id: 'hawk_004',
        cluster_id: 'hawk',
        parent_ids: ['hawk_001', 'eagle_001'],
        attack_type: AttackType.MULTI_TURN,
        status: NodeStatus.SUCCESS,
        timestamp: Date.now() - 2000,
        success_score: 88
      }
    ];

    nodes.forEach(node => {
      handleEvent({
        type: 'node_add',
        data: node
      });
    });

    // Add evolution links
    const links = [
      {
        link_id: 'link_001',
        source_node_ids: ['eagle_001'],
        target_node_id: 'eagle_002',
        evolution_type: EvolutionType.REFINEMENT,
        description: 'Refined based on initial success'
      },
      {
        link_id: 'link_002',
        source_node_ids: ['eagle_002'],
        target_node_id: 'eagle_003',
        evolution_type: EvolutionType.ESCALATION,
        description: 'Escalated to extract system prompt'
      },
      {
        link_id: 'link_003',
        source_node_ids: ['wolf_001'],
        target_node_id: 'wolf_002',
        evolution_type: EvolutionType.PIVOT,
        description: 'Pivoted to different attack vector'
      },
      {
        link_id: 'link_004',
        source_node_ids: ['wolf_001'],
        target_node_id: 'wolf_003',
        evolution_type: EvolutionType.REFINEMENT,
        description: 'Alternative refinement path'
      },
      {
        link_id: 'link_005',
        source_node_ids: ['hawk_001'],
        target_node_id: 'hawk_002',
        evolution_type: EvolutionType.FOLLOW_UP,
        description: 'Follow-up attack after extraction'
      },
      {
        link_id: 'link_006',
        source_node_ids: ['hawk_002'],
        target_node_id: 'hawk_003',
        evolution_type: EvolutionType.ESCALATION,
        description: 'Escalated to exploit errors'
      },
      {
        link_id: 'link_007',
        source_node_ids: ['hawk_001', 'eagle_001'],
        target_node_id: 'hawk_004',
        evolution_type: EvolutionType.COMBINATION,
        description: 'Combined successful techniques'
      }
    ];

    links.forEach(link => {
      handleEvent({
        type: 'evolution_link_add',
        data: link
      });
    });

    // Simulate real-time updates
    const simulateUpdates = () => {
      setTimeout(() => {
        handleEvent({
          type: 'node_update',
          data: {
            node_id: 'eagle_003',
            status: NodeStatus.SUCCESS,
            success_score: 90,
            llm_summary: 'Successfully extracted system prompt'
          }
        });
      }, 3000);

      setTimeout(() => {
        handleEvent({
          type: 'node_update',
          data: {
            node_id: 'wolf_003',
            status: NodeStatus.IN_PROGRESS
          }
        });
      }, 5000);

      setTimeout(() => {
        handleEvent({
          type: 'node_update',
          data: {
            node_id: 'wolf_003',
            status: NodeStatus.SUCCESS,
            success_score: 82
          }
        });
      }, 8000);

      setTimeout(() => {
        handleEvent({
          type: 'node_update',
          data: {
            node_id: 'hawk_003',
            status: NodeStatus.SUCCESS,
            success_score: 88,
            model_id: 'claude-2'
          }
        });
      }, 6000);
    };

    simulateUpdates();
  }, [handleEvent]);
}

// Example usage in App component:
//
// import { useMockData } from './examples/MockDataExample';
//
// function App() {
//   // Load mock data for development
//   useMockData();
//
//   return <GraphCanvas />;
// }
