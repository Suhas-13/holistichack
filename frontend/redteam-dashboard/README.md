# Red-Teaming Evolution Dashboard

A real-time visualization dashboard for AI agent red-teaming attacks with evolutionary algorithms.

## Features

- **Real-time Graph Visualization** - Interactive force-directed graph using React Flow
- **WebSocket Integration** - Live updates during attack execution
- **Cyber Aesthetic UI** - Dark theme with neon accents and glass morphism
- **Node Details** - Detailed view of attack attempts and results
- **Attack Configuration** - Customizable parameters for evolutionary attacks
- **Results Summary** - Comprehensive statistics after attack completion

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Flow** - Graph visualization
- **Zustand** - State management (ready to use)
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=localhost:8000
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── api/           # API client and HTTP requests
├── components/    # React components
│   ├── TopBar.tsx
│   ├── ConfigPanel.tsx
│   ├── GraphCanvas.tsx
│   ├── NodeDetailPanel.tsx
│   ├── ResultsModal.tsx
│   └── ErrorBoundary.tsx
├── hooks/         # Custom React hooks
│   └── useWebSocket.ts
├── types/         # TypeScript type definitions
├── styles/        # Global styles and CSS
│   └── globals.css
├── utils/         # Utility functions
├── App.tsx        # Main application component
└── main.tsx       # Entry point

## Component Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│                    TopBar                        │
├──────────┬─────────────────────────┬────────────┤
│          │                         │            │
│  Config  │     GraphCanvas         │  Node      │
│  Panel   │     (React Flow)        │  Detail    │
│          │                         │  Panel     │
│          │                         │            │
└──────────┴─────────────────────────┴────────────┘
```

### Data Flow

1. User configures attack in `ConfigPanel`
2. App sends request to backend API
3. Backend returns attack ID and WebSocket URL
4. WebSocket connection established for real-time updates
5. Graph updates as nodes/edges are created
6. User can select nodes to view details
7. Results modal shown when attack completes

## API Integration

### HTTP Endpoints

- `POST /api/v1/start-attack` - Start new attack
- `GET /api/v1/results/:id` - Get attack results
- `GET /api/v1/agents` - Get available agents
- `GET /api/v1/health` - Health check

### WebSocket Events

- `node_created` - New attack node created
- `node_updated` - Node status updated
- `edge_created` - New connection between nodes
- `generation_complete` - Generation finished
- `attack_complete` - Attack finished

## Styling

The app uses a custom cyber aesthetic design system with:

- **Color Palette**: Dark backgrounds with neon cyan/purple/magenta accents
- **Typography**: Inter for UI, JetBrains Mono for code
- **Animations**: Smooth transitions and glow effects
- **Glass Morphism**: Translucent panels with backdrop blur

See `src/styles/globals.css` for the complete design system.

## Development Tips

1. **Hot Module Replacement**: Changes auto-reload in dev mode
2. **TypeScript**: All components are fully typed
3. **Error Boundary**: Catches runtime errors gracefully
4. **WebSocket Debug**: Enable `VITE_DEBUG_WS=true` for WS logging
5. **Dev Indicators**: WebSocket status shown in bottom-left corner

## Next Steps

To extend the dashboard:

1. **Graph State Management**: Implement Zustand store for complex state
2. **Custom Nodes**: Create custom React Flow node components
3. **Filters**: Add filtering by status, attack type, cluster
4. **Export**: Add export functionality for graphs and data
5. **Timeline**: Add timeline visualization at bottom
6. **Search**: Add node search functionality

## License

MIT
