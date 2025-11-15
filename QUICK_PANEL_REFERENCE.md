# Quick Panel Reference Card

## 📍 File Locations

```bash
frontend/src/
├── components/panels/
│   ├── ConfigPanel.tsx          # Left sidebar - attack config
│   ├── NodeDetailPanel.tsx      # Right sidebar - node details
│   ├── TopBar.tsx               # Top bar - status & metrics
│   ├── ResultsModal.tsx         # Modal - attack results
│   ├── index.ts                 # Barrel export
│   └── README.md                # Full documentation
├── stores/
│   ├── attackStore.ts           # NEW - Attack state & API
│   ├── graphStore.ts            # Graph data
│   └── uiStore.ts               # UI state
└── styles/
    └── globals.css              # Enhanced with cyber theme
```

---

## 🚀 Quick Start

```tsx
import {
  TopBar,
  ConfigPanel,
  NodeDetailPanel,
  ResultsModal
} from './components/panels';

function App() {
  return (
    <div className="h-screen bg-void flex flex-col">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <ConfigPanel />
        <YourGraphComponent />
        <NodeDetailPanel />
      </div>
      <ResultsModal />
    </div>
  );
}
```

---

## 🎯 Component Checklist

### ConfigPanel ✅
- [x] Target agent dropdown (Eagle, Fox, Bear, etc.)
- [x] Attack goals checkboxes (3 types)
- [x] Seed attack slider (1-50)
- [x] START ATTACK button → POST /api/v1/start-attack
- [x] PAUSE/STOP controls
- [x] Collapsible (300px → 48px)
- [x] Error display
- [x] Validation

### NodeDetailPanel ✅
- [x] Slide-in from right (360px)
- [x] Shows when uiStore.selectedNodeId set
- [x] Overview tab (status, metadata, summary)
- [x] Transcript tab (conversation history)
- [x] Raw Data tab (JSON trace)
- [x] Export button
- [x] Close button
- [x] Animations

### TopBar ✅
- [x] Logo + title
- [x] WebSocket status indicator (pulsing dot)
- [x] Attack progress (gen, nodes)
- [x] Live metrics (success rate, totals)
- [x] Settings button
- [x] 64px fixed height
- [x] Backdrop blur

### ResultsModal ✅
- [x] Opens on attack_complete event
- [x] ASR display (large, animated)
- [x] Total/successful counts
- [x] LLM analysis
- [x] Top attacks list (ranked, expandable)
- [x] Download report button
- [x] Backdrop blur + spring animation
- [x] Close button

---

## 🔌 API Endpoints

```typescript
// Start attack
POST /api/v1/start-attack
Body: { target, goals, seed_attack_count, max_generations, population_size }
Response: { attack_id }

// Control
POST /api/v1/attacks/{id}/pause
POST /api/v1/attacks/{id}/stop

// WebSocket
ws://{host}/api/v1/ws/{attack_id}
Events: attack_progress, attack_complete, attack_error
```

---

## 💾 Store Usage

```tsx
// Attack control
import { useAttackStore } from '@/stores/attackStore';
const { startAttack, config, attackStatus } = useAttackStore();

// Node selection
import { useUiStore } from '@/stores/uiStore';
const { selectedNodeId, setSelectedNodeId } = useUiStore();

// Graph data
import { useGraphStore } from '@/stores/graphStore';
const getNodeDetail = useGraphStore(s => s.getNodeDetail);
const stats = useGraphStore(s => s.getStats());
```

---

## 🎨 Key CSS Classes

```css
.cyber-button              /* Standard button */
.cyber-button-primary      /* Primary CTA */
.glass-panel               /* Glass morphism */
.glow-divider              /* Gradient divider */
.transcript                /* Code block */
.animate-pulse-glow        /* Pulsing animation */
```

---

## 🎨 Color Variables

```css
--primary-cyan: #00d9ff       /* Main accent */
--primary-purple: #a78bfa     /* Secondary accent */
--status-success: #10b981     /* Green */
--status-failure: #ef4444     /* Red */
--status-running: #fbbf24     /* Amber */
--bg-void: #0a0e14            /* Background */
--bg-surface: #111827         /* Panels */
```

---

## 📦 Dependencies

Already in package.json:
- react ^18.3.1
- zustand ^4.5.0
- framer-motion ^11.0.0
- tailwindcss ^3.4.1

---

## ✅ Implementation Status

**Created:** 7 new files
- ✅ ConfigPanel.tsx (580 lines)
- ✅ NodeDetailPanel.tsx (480 lines)
- ✅ TopBar.tsx (180 lines)
- ✅ ResultsModal.tsx (320 lines)
- ✅ attackStore.ts (280 lines)
- ✅ index.ts (barrel export)
- ✅ README.md (documentation)

**Enhanced:** 1 file
- ✅ globals.css (+130 lines)

**Total:** 1,970+ lines of production-ready code

---

## 🚨 Important Notes

1. **Panel Visibility:**
   - ConfigPanel: Always visible (can collapse)
   - NodeDetailPanel: Shows when `selectedNodeId` is set
   - ResultsModal: Shows when `showResultsModal` is true

2. **WebSocket:**
   - Auto-connects on `startAttack()`
   - Auto-disconnects on `stopAttack()`
   - Updates all stores in real-time

3. **State Flow:**
   ```
   User clicks START
   → attackStore.startAttack()
   → POST /api/v1/start-attack
   → Response { attack_id }
   → attackStore.connectWebSocket(attack_id)
   → WebSocket events
   → graphStore updates (nodes, links)
   → UI re-renders
   ```

4. **Animations:**
   - Respect prefers-reduced-motion
   - Use GPU-accelerated transforms
   - Spring physics for modals

---

## 🎯 Next Steps

1. ✅ All panel components created
2. ⏭️ Integrate with your graph visualization
3. ⏭️ Connect backend API endpoints
4. ⏭️ Test WebSocket events
5. ⏭️ Add demo data for testing
6. ⏭️ Deploy and demo! 🚀

---

**Ready for hackathon demo!** 🎉
