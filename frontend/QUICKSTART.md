# Quick Start Guide

Get the graph visualization running in under 2 minutes!

## 1. Install Dependencies

```bash
cd /home/user/holistichack/frontend
npm install
```

## 2. Run Development Server

```bash
npm run dev
```

This will start the dev server at http://localhost:3000

## 3. See the Graph in Action

The graph is currently empty. To see it with sample data:

### Option A: Use Mock Data (Recommended for testing)

Edit `/src/App.tsx`:

```tsx
import React from 'react';
import { GraphCanvas } from './components/graph';
import { useMockData } from './examples/MockDataExample';
import './styles/globals.css';

function App() {
  // Load sample data
  useMockData();

  return (
    <div className="w-screen h-screen bg-void">
      <GraphCanvas />
    </div>
  );
}

export default App;
```

### Option B: Connect to WebSocket Backend

Edit `/src/App.tsx`:

```tsx
import React, { useEffect } from 'react';
import { GraphCanvas } from './components/graph';
import { useGraphStore } from './stores/graphStore';
import './styles/globals.css';

function App() {
  const handleEvent = useGraphStore(state => state.handleEvent);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/evolution');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleEvent(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, [handleEvent]);

  return (
    <div className="w-screen h-screen bg-void">
      <GraphCanvas />
    </div>
  );
}

export default App;
```

## 4. Build for Production

```bash
npm run build
```

Output will be in `/dist` folder.

## 5. Preview Production Build

```bash
npm run preview
```

## What You'll See

- **Dark cyber-themed graph** with nodes and edges
- **Animated nodes** that pulse when running, glow when successful
- **Cluster backgrounds** grouping related attacks
- **MiniMap** in bottom-right for navigation
- **Controls** in bottom-left for zoom/pan
- **Info panel** in top-left showing stats
- **Legend** in bottom-right showing status colors

## Interactions

- **Click** a node to select it
- **Hover** over nodes for tooltips
- **Drag** nodes to reposition
- **Scroll** to zoom in/out
- **Click background** to deselect

## Customization

### Change Colors

Edit `/tailwind.config.js`:

```js
colors: {
  'primary-cyan': '#00d9ff',  // Change to your color
  // ...
}
```

### Toggle Features

Use the UI store:

```tsx
import { useUiStore } from './stores/uiStore';

function MyComponent() {
  const { toggleMiniMap, toggleControls } = useUiStore();

  return (
    <div>
      <button onClick={toggleMiniMap}>Toggle MiniMap</button>
      <button onClick={toggleControls}>Toggle Controls</button>
    </div>
  );
}
```

### Add Custom Nodes

Create a new node type in `/src/components/graph/CustomNode.tsx` and register it in `GraphCanvas.tsx`:

```tsx
const nodeTypes = {
  attackNode: AttackNode,
  customNode: CustomNode  // Add your custom node
};
```

## Troubleshooting

### Port already in use
```bash
# Change port in vite.config.ts
server: {
  port: 3001  // or any other port
}
```

### WebSocket connection failed
- Ensure backend is running on port 8000
- Check CORS settings
- Verify WebSocket endpoint

### Animations not working
- Check browser console for errors
- Ensure Framer Motion is installed
- Check `animationsEnabled` in uiStore

### Blank screen
- Check browser console for errors
- Verify all imports are correct
- Try clearing node_modules and reinstalling

## Need Help?

- Read `/src/components/graph/README.md` for full API documentation
- Check `/GRAPH_COMPONENTS_SUMMARY.md` for architecture overview
- Review `/src/examples/MockDataExample.tsx` for data format examples

## Next Steps

1. **Integrate with Backend**: Connect to your WebSocket server
2. **Add UI Panels**: Create top bar, side panels for controls and details
3. **Implement Features**: Add search, filters, export functionality
4. **Customize Styling**: Adjust colors, animations, layouts to your liking
5. **Deploy**: Build and deploy to your hosting platform

---

Happy hacking! 🚀
