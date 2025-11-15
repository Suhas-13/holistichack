# Frontend Directory Structure

Complete file structure for the RedTeam Evolution Dashboard graph visualization system.

```
/home/user/holistichack/frontend/
│
├── 📄 Configuration Files
│   ├── package.json                  # Dependencies & scripts
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── tsconfig.node.json            # TypeScript config for Node
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── .eslintrc.cjs                 # ESLint configuration
│   └── .gitignore                    # Git ignore rules
│
├── 📚 Documentation
│   ├── README.md                     # Main documentation (if needed)
│   ├── QUICKSTART.md                 # Quick start guide
│   ├── GRAPH_COMPONENTS_SUMMARY.md   # Complete implementation summary
│   └── DIRECTORY_STRUCTURE.md        # This file
│
├── 🌐 Entry Point
│   └── index.html                    # HTML entry point
│
└── src/
    │
    ├── 📱 Application
    │   ├── main.tsx                  # React entry point
    │   └── App.tsx                   # Main app component
    │
    ├── 🎨 Components
    │   │
    │   ├── graph/                    # Graph visualization components
    │   │   ├── GraphCanvas.tsx       # Main ReactFlow container ⭐
    │   │   ├── AttackNode.tsx        # Custom node component ⭐
    │   │   ├── EvolutionEdge.tsx     # Custom edge component ⭐
    │   │   ├── ClusterBackground.tsx # Cluster visual grouping ⭐
    │   │   ├── index.ts              # Barrel exports
    │   │   └── README.md             # Graph components API docs
    │   │
    │   └── panels/                   # UI Panel components (if created)
    │       ├── TopBar.tsx
    │       ├── NodeDetailPanel.tsx
    │       ├── ConfigPanel.tsx
    │       ├── ResultsModal.tsx
    │       ├── index.ts
    │       └── README.md
    │
    ├── 🏪 State Management
    │   ├── graphStore.ts             # Graph data store (Zustand) ⭐
    │   ├── uiStore.ts                # UI state store (Zustand) ⭐
    │   └── attackStore.ts            # Attack execution store
    │
    ├── 📐 Type Definitions
    │   ├── graph-data-structures.ts  # Core data types ⭐
    │   ├── graph-state-management.ts # State management functions ⭐
    │   ├── graph.ts                  # Graph-specific types
    │   ├── api.ts                    # API types
    │   ├── websocket.ts              # WebSocket event types
    │   ├── index.ts                  # Type exports
    │   ├── README.md                 # Types documentation
    │   └── QUICK_START.md            # Quick reference
    │
    ├── 🛠️ Utilities
    │   └── cn.ts                     # Tailwind class merger ⭐
    │
    ├── 💅 Styling
    │   └── globals.css               # Global styles & Tailwind ⭐
    │
    └── 📝 Examples
        └── MockDataExample.tsx       # Mock data for testing ⭐

⭐ = Core graph visualization files (11 total)
```

## File Counts

- **Core Graph Components**: 11 files
  - GraphCanvas.tsx
  - AttackNode.tsx
  - EvolutionEdge.tsx
  - ClusterBackground.tsx
  - graphStore.ts
  - uiStore.ts
  - graph-data-structures.ts
  - graph-state-management.ts
  - cn.ts
  - globals.css
  - MockDataExample.tsx

- **Configuration**: 8 files
- **Documentation**: 4 files
- **Additional Types**: 5 files
- **Additional Components**: 6 files (panels)

**Total Files Created**: ~34 files

## Key Directories

### `/src/components/graph/`
The heart of the visualization system. Contains all ReactFlow-based graph components.

### `/src/stores/`
Zustand stores for state management. Handles graph data, UI state, and attack execution.

### `/src/types/`
TypeScript definitions for type safety across the entire application.

### `/src/styles/`
Global CSS including Tailwind configuration and custom animations.

## Import Paths

With path aliases configured, you can import like this:

```typescript
// Absolute imports
import { GraphCanvas } from '@/components/graph';
import { useGraphStore } from '@/stores/graphStore';
import { useUiStore } from '@/stores/uiStore';
import { GraphNode } from '@/types/graph-data-structures';
import { cn } from '@/utils/cn';

// Or relative imports
import { GraphCanvas } from './components/graph';
```

## Dependencies Installed

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@xyflow/react": "^12.0.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.0"
  }
}
```

## Build Commands

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Environment

- **React**: 18.3.1
- **TypeScript**: 5.3.3
- **Vite**: 5.1.0
- **Node**: 16+ recommended

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

---

**All files are production-ready and fully typed with TypeScript!**
