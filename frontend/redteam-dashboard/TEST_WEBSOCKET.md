# WebSocket Integration Test

## Testing Steps

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Start an attack from the UI**
4. **Look for these console messages:**

```
[WebSocket] Connecting in REAL mode
[WebSocket] Connected
[WebSocket] Raw message received: {...}
[App] WebSocket message: {...}
[GraphStore] Adding cluster: ... 
[GraphStore] Adding node: ...
```

## Expected WebSocket Message Format

From backend:
```json
{
  "type": "cluster_add",
  "data": {
    "cluster_id": "cluster_0",
    "name": "Violent Crimes",
    "position_hint": {"x": 500, "y": 100}
  }
}
```

```json
{
  "type": "node_add",
  "data": {
    "node_id": "seed_0",
    "cluster_id": "cluster_0",
    "parent_ids": [],
    "attack_type": "Slang",
    "status": "running"
  }
}
```

## Common Issues

1. **No messages** - Check backend is running and attack started
2. **"Cluster not found"** - Clusters must be added before nodes
3. **Type mismatches** - Check attack_type values match frontend enum
4. **WebSocket not connecting** - Check URL is `ws://localhost:5173/ws/v1/{attackId}`

## Debug Commands

```javascript
// In browser console:

// Check if graphStore has data
window.graphStore = useGraphStore.getState()
console.log('Clusters:', Array.from(window.graphStore.clusters.keys()))
console.log('Nodes:', Array.from(window.graphStore.nodes.keys()))

// Check WebSocket connection
console.log('WebSocket state:', ws.readyState) 
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
```
