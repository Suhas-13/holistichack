import { useEffect } from 'react';
import { useGraphStore } from '../stores/graphStore';

export function DebugPanel() {
  const { nodes, clusters, links } = useGraphStore();

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('📊 Graph Store State:', {
        clusters: Array.from(clusters.keys()),
        nodes: Array.from(nodes.keys()),
        links: Array.from(links.keys())
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [clusters, nodes, links]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#0f0',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '4px',
        zIndex: 9999,
        maxWidth: '300px',
      }}
    >
      <div>🔍 Debug Panel</div>
      <div>Clusters: {clusters.size}</div>
      <div>Nodes: {nodes.size}</div>
      <div>Links: {links.size}</div>
      <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.7 }}>
        Check console for WebSocket logs
      </div>
    </div>
  );
}
