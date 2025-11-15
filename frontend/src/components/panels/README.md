# Dashboard Panel Components

Professional, cyber-themed UI components for the Red Team Evolution Dashboard.

## Components

### 1. **ConfigPanel** (Left Sidebar)
Configuration panel for setting up and controlling attacks.

**Features:**
- Target agent/endpoint selection (dropdown or custom URL)
- Attack goals checkboxes (extract_model, extract_prompt, enumerate_tools)
- Seed attack count slider (1-50)
- START ATTACK button (validates and triggers API call)
- PAUSE/RESUME and STOP controls during attack
- Auto-collapse when attack starts
- Error message display
- Clean, accessible form design

**Usage:**
```tsx
import { ConfigPanel } from '@/components/panels';

<ConfigPanel />
```

**State Management:**
- Uses `attackStore` for configuration and control
- Uses `uiStore` for panel collapse state

---

### 2. **NodeDetailPanel** (Right Sidebar)
Detailed information panel for selected graph nodes.

**Features:**
- Shows when `uiStore.selectedNodeId` is set
- Three tabs: Overview, Transcript, Raw Data
- **Overview Tab:**
  - Node status with animated indicator
  - Attack type
  - Cluster info with color badge
  - Timestamp
  - Model ID (if extracted)
  - Success score with progress bar
  - Parent/child node info
  - LLM summary
- **Transcript Tab:**
  - Full conversation history
  - Collapsible section
  - Syntax highlighting (user/agent messages)
- **Raw Data Tab:**
  - JSON trace data
  - Collapsible section
  - Monospace formatting
- Export data button (downloads JSON)
- Close button
- Smooth slide-in animation

**Usage:**
```tsx
import { NodeDetailPanel } from '@/components/panels';

<NodeDetailPanel />
```

**State Management:**
- Uses `uiStore.selectedNodeId` to determine which node to show
- Uses `graphStore.getNodeDetail()` to fetch complete node data

---

### 3. **TopBar**
Top navigation bar with status and metrics.

**Features:**
- Logo and title (⚡ REDTEAM EVOLUTION)
- Live WebSocket connection status indicator
  - Animated pulse when connected and active
  - Color-coded: green (connected), amber (connecting), gray (disconnected), red (error)
- Attack progress display (generation, node count)
- Real-time metrics ticker:
  - Success Rate
  - Total Nodes
  - Clusters
  - Average Evolution Depth
- Settings button
- Minimal, clean design
- Fixed height (64px)

**Usage:**
```tsx
import { TopBar } from '@/components/panels';

<TopBar />
```

**State Management:**
- Uses `attackStore` for status, WebSocket state, and progress
- Uses `graphStore.getStats()` for metrics

---

### 4. **ResultsModal**
Modal dialog displaying attack completion results.

**Features:**
- Opens when `attack_complete` WebSocket event received
- Beautiful backdrop blur effect
- **Content:**
  - Attack Success Rate (ASR) - large, prominent display with progress bar
  - Total attacks and successful attacks counts
  - LLM-generated analysis summary
  - Top successful attacks list:
    - Ranked by success score
    - Shows node ID, attack type, summary
    - Expandable transcript preview
  - Timestamp
- Download report button (exports JSON)
- Close button
- Smooth animations (spring physics)
- Professional, high-impact design

**Usage:**
```tsx
import { ResultsModal } from '@/components/panels';

// Add to your app root (renders as portal when needed)
<ResultsModal />
```

**State Management:**
- Uses `attackStore.showResultsModal` to control visibility
- Uses `attackStore.results` for data
- Auto-opens when attack completes via WebSocket

---

## Styling

All components use:
- **Tailwind CSS** for utility classes
- **Framer Motion** for animations
- **Custom CSS classes** from `/src/styles/globals.css`:
  - `.cyber-button` - Standard button
  - `.cyber-button-primary` - Primary CTA button
  - `.glass-panel` - Glass morphism container
  - `.glow-divider` - Gradient divider line
  - `.transcript` - Code/transcript block with custom scrollbar

**Color Palette:**
- `--bg-void`: #0a0e14 (primary background)
- `--bg-surface`: #111827 (elevated surfaces)
- `--bg-elevated`: #1a1f2e (hover states)
- `--primary-cyan`: #00d9ff (primary accent)
- `--primary-purple`: #a78bfa (secondary accent)
- `--status-running`: #fbbf24 (amber)
- `--status-success`: #10b981 (green)
- `--status-failure`: #ef4444 (red)
- `--status-pending`: #6b7280 (gray)

---

## API Integration

### ConfigPanel
**Endpoint:** `POST /api/v1/start-attack`

**Request:**
```json
{
  "target": "Eagle",
  "goals": ["extract_model", "extract_prompt"],
  "seed_attack_count": 10,
  "max_generations": 5,
  "population_size": 20
}
```

**Response:**
```json
{
  "attack_id": "attack_abc123",
  "status": "started"
}
```

**WebSocket:** `ws://{host}/api/v1/ws/{attack_id}`

### WebSocket Events
The components listen for these events:

```typescript
// Attack progress update
{
  "type": "attack_progress",
  "generation": 3,
  "total_nodes": 127
}

// Attack completed
{
  "type": "attack_complete",
  "results": {
    "asr": 34.5,
    "totalAttacks": 200,
    "successfulAttacks": 69,
    "topAttacks": [...],
    "llmAnalysis": "...",
    "timestamp": 1700000000000
  }
}

// Error occurred
{
  "type": "attack_error",
  "message": "Connection timeout"
}
```

---

## State Stores

### attackStore
```typescript
import { useAttackStore } from '@/stores/attackStore';

// Configuration
const { config, setTarget, setGoals, setSeedAttackCount } = useAttackStore();

// Controls
const { startAttack, pauseAttack, stopAttack, attackStatus } = useAttackStore();

// WebSocket
const { wsStatus, connectWebSocket, disconnectWebSocket } = useAttackStore();

// Results
const { results, showResultsModal, setShowResultsModal } = useAttackStore();
```

### uiStore
```typescript
import { useUiStore } from '@/stores/uiStore';

// Selection
const { selectedNodeId, setSelectedNodeId } = useUiStore();

// Panels
const { leftPanelCollapsed, toggleLeftPanel } = useUiStore();
```

### graphStore
```typescript
import { useGraphStore } from '@/stores/graphStore';

// Queries
const getNodeDetail = useGraphStore((state) => state.getNodeDetail);
const getStats = useGraphStore((state) => state.getStats);

// Node detail
const nodeDetail = getNodeDetail('node_eagle_001');

// Statistics
const stats = getStats();
```

---

## Accessibility

All components follow WCAG AAA guidelines:
- ✅ Minimum 7:1 contrast ratios
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Reduced motion support
- ✅ Semantic HTML

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- No IE11 (modern CSS features required)

---

## Example Layout

```tsx
import {
  TopBar,
  ConfigPanel,
  NodeDetailPanel,
  ResultsModal
} from '@/components/panels';
import { GraphCanvas } from '@/components/graph';

function App() {
  return (
    <div className="h-screen bg-void flex flex-col">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <ConfigPanel />
        <GraphCanvas />
        <NodeDetailPanel />
      </div>

      <ResultsModal />
    </div>
  );
}
```

---

## Performance Notes

- All animations use CSS transforms (GPU-accelerated)
- WebSocket updates are throttled to 60fps
- Panel collapse/expand transitions are 300ms
- Modal uses backdrop-filter for blur (may impact performance on low-end devices)

---

## Development

**Dependencies:**
- react ^18.2.0
- react-dom ^18.2.0
- zustand ^4.4.7
- framer-motion ^10.16.16
- tailwindcss ^3.4.0

**Type Safety:**
All components are fully typed with TypeScript strict mode.
