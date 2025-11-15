# Required Dependencies

## Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install zustand immer reactflow
```

Or with yarn:

```bash
yarn add zustand immer reactflow
```

Or with pnpm:

```bash
pnpm add zustand immer reactflow
```

## Dependencies Breakdown

### State Management

#### zustand (^4.4.0)
- Lightweight state management library
- Used for graphStore, websocketStore, attackStore
- No Provider needed
- Excellent TypeScript support

#### immer (^10.0.0)
- Immutable state updates with mutable syntax
- Used with Zustand middleware for graph state
- Simplifies complex state updates

### Graph Visualization

#### reactflow (^11.10.0)
- React component library for graph visualization
- Handles node rendering, edges, and interactions
- Built-in support for panning, zooming, and node dragging
- Required types: `Node`, `Edge`, `MarkerType`

## Optional Dependencies

### Development

#### @types/node
```bash
npm install --save-dev @types/node
```

### Testing

```bash
npm install --save-dev @testing-library/react @testing-library/react-hooks
```

### Additional Features

#### lodash (for debounce/throttle)
```bash
npm install lodash
npm install --save-dev @types/lodash
```

## Package.json Example

```json
{
  "name": "redteam-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "immer": "^10.0.0",
    "reactflow": "^11.10.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Vite Configuration

Update `vite.config.ts` for path aliases:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Environment Variables

Create `.env` file:

```env
VITE_WS_URL=ws://localhost:8000/ws
VITE_API_URL=http://localhost:8000
```

## Verify Installation

Run this script to verify all dependencies are installed correctly:

```bash
npm list zustand immer reactflow
```

Expected output:
```
redteam-dashboard@1.0.0
├── immer@10.x.x
├── reactflow@11.x.x
└── zustand@4.x.x
```

## Browser Compatibility

The WebSocket management system requires:
- Modern browsers with WebSocket support
- Chrome 16+
- Firefox 11+
- Safari 7+
- Edge 12+

## Known Issues

### ReactFlow Type Conflicts

If you encounter type conflicts with ReactFlow, ensure you're using compatible versions:

```json
{
  "reactflow": "^11.10.0",
  "react": "^18.2.0"
}
```

### Zustand Persist

If using persist middleware, you may need:

```bash
npm install zustand-persist
```

## Migration Guide

If migrating from older versions:

### Zustand v3 → v4
- No breaking changes for our usage
- Middleware API remains the same

### ReactFlow v10 → v11
- Update imports: `import { Node, Edge } from 'reactflow'`
- MarkerType enum location changed
