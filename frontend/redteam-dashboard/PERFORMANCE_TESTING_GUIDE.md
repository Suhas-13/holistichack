# Performance Testing & Benchmarking Guide

## Quick Reference: Before vs After Optimization

### Expected Performance Improvements

| Metric | Before | After (P0 fixes) | After (All fixes) | Improvement |
|--------|--------|------------------|-------------------|-------------|
| **FPS @ 100 nodes** | 45 FPS | 60 FPS | 60 FPS | +33% |
| **FPS @ 200 nodes** | 15 FPS | 35 FPS | 60 FPS | +300% |
| **FPS @ 300 nodes** | <5 FPS | 25 FPS | 55 FPS | +1000% |
| **Re-renders/sec** | 847 | 3 | 3 | -99.6% |
| **Memory (1 hour)** | ~450 MB | ~120 MB | ~100 MB | -78% |
| **Node selection lag** | 3+ sec | <500ms | <100ms | -97% |
| **WS message processing** | 16ms each | 2ms batch | 0.5ms batch | -97% |

---

## Chrome DevTools Performance Testing

### Test 1: Baseline Performance (Current State)

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Click Record (Cmd+E / Ctrl+E)
4. Start an attack in the dashboard
5. Let it run for 30 seconds
6. Stop recording

**What to look for:**
```
❌ Long Tasks (red bars):
   - Should see many >50ms tasks
   - Total: 40-60% of timeline

❌ Frame Rate:
   - Yellow/red frames indicating dropped frames
   - FPS drops to 15-20 during updates

❌ Scripting Time:
   - 60-70% of CPU time
   - Lots of "Recalculate Style" and "Layout"
```

### Test 2: Post-Optimization Performance

**After implementing P0 fixes, repeat Test 1**

**Expected improvements:**
```
✅ Long Tasks:
   - Reduced to <10% of timeline
   - Most tasks <16ms (60 FPS threshold)

✅ Frame Rate:
   - Green frames, consistent 60 FPS
   - Only minor drops during initial load

✅ Scripting Time:
   - 30-40% of CPU time
   - Minimal style recalculation
```

---

## Memory Profiling

### Test 3: Memory Leak Detection

**Steps:**
1. Open DevTools → Memory tab
2. Take Heap Snapshot (baseline)
3. Start attack, let run for 10 minutes
4. Take second snapshot
5. Compare snapshots

**What to analyze:**

#### Before Optimization:
```javascript
// Expected issues:
{
  "Detached DOM nodes": 50-100,  // ❌ Memory leak
  "Event listeners": 500+,        // ❌ Not cleaned up
  "Arrays growing": true,         // ❌ Unbounded growth
  "Memory delta": "+150 MB"       // ❌ Leak confirmed
}
```

#### After Optimization:
```javascript
// Expected results:
{
  "Detached DOM nodes": 0,        // ✅ No leaks
  "Event listeners": ~50,         // ✅ Stable
  "Arrays growing": false,        // ✅ LRU cache working
  "Memory delta": "+20 MB"        // ✅ Normal growth
}
```

**How to check for leaks:**
```
1. In snapshot comparison, filter by "Detached"
2. Look for DOM nodes with "Detached" status
3. If count grows over time = memory leak
4. Click to see retaining path
```

---

## React DevTools Profiler

### Test 4: Component Re-render Analysis

**Setup:**
1. Install React DevTools extension
2. Open DevTools → Profiler tab
3. Click Record
4. Trigger WebSocket update (send message)
5. Stop recording

#### Before Optimization:

**Expected re-renders:**
```
App.tsx              ✅ 1 render (expected)
├─ TopBar            ❌ 1 render (unnecessary)
├─ ConfigPanel       ❌ 1 render (unnecessary)
├─ GraphCanvas       ❌ 1 render (unnecessary)
│  ├─ ReactFlow      ❌ 1 render
│  │  └─ Nodes       ❌ 200 renders (all nodes!)
└─ NodeDetailPanel   ❌ 1 render (unnecessary)

Total: 203 component renders per message
Render time: ~45ms per message
```

#### After Optimization:

**Expected re-renders:**
```
App.tsx              ✅ 1 render (expected)
├─ TopBar            ✅ No render (memoized, props unchanged)
├─ ConfigPanel       ✅ No render (memoized)
├─ GraphCanvas       ✅ 1 render (props changed)
│  ├─ ReactFlow      ✅ 1 render
│  │  └─ Nodes       ✅ 5 renders (only changed nodes)
└─ NodeDetailPanel   ✅ 1 render (selected node changed)

Total: 8 component renders per message
Render time: ~2ms per message
```

**How to analyze:**
```
1. Look at flame graph
2. Wider bars = more render time
3. Gray bars = component didn't render (good!)
4. Click component to see why it rendered
5. Check "Ranked" tab to find slowest components
```

---

## Network & WebSocket Performance

### Test 5: WebSocket Message Handling

**Monitor message rate:**
```javascript
// Add to browser console
let messageCount = 0;
let startTime = Date.now();

// Hook into WebSocket (before optimization)
const originalWS = WebSocket.prototype.onmessage;
WebSocket.prototype.onmessage = function(event) {
  messageCount++;

  const elapsed = (Date.now() - startTime) / 1000;
  const rate = messageCount / elapsed;

  console.log(`Messages: ${messageCount}, Rate: ${rate.toFixed(1)}/sec`);

  return originalWS.call(this, event);
};
```

**Expected results:**

#### Before Batching:
```
Message Rate: 50/sec
Frame Rate:   15 FPS     ❌
UI Lag:       3-5 sec    ❌
CPU Usage:    85%        ❌
```

#### After Batching:
```
Message Rate: 50/sec
Batch Size:   5 msg/batch (100ms interval)
Frame Rate:   60 FPS     ✅
UI Lag:       <100ms     ✅
CPU Usage:    35%        ✅
```

---

## Bundle Size Analysis

### Test 6: Production Build Size

**Build and analyze:**
```bash
cd /home/user/holistichack/frontend/redteam-dashboard

# Build production bundle
npm run build

# Analyze bundle size
ls -lh dist/assets/

# Expected output (before optimization):
# index-XXXXX.js  190 KB
# index-XXXXX.css  16 KB
```

**After optimization:**
```bash
# With code splitting:
# vendor-XXXXX.js   65 KB  (react, react-dom)
# graph-XXXXX.js    60 KB  (@xyflow/react)
# state-XXXXX.js    15 KB  (zustand, immer)
# main-XXXXX.js     45 KB  (app code)
# index-XXXXX.css   16 KB
# Total:           201 KB  (better caching, faster load)
```

**Visualize bundle:**
```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts:
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});

# Build and open visualization
npm run build
# Opens treemap in browser
```

---

## Automated Performance Tests

### Test 7: Lighthouse CI

**Run Lighthouse audit:**
```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:5173 \
  --output html \
  --output-path ./lighthouse-report.html \
  --chrome-flags="--headless"

# Open report
open lighthouse-report.html
```

**Target scores:**
```
Performance:    > 90  ✅
Accessibility:  > 95  ✅
Best Practices: > 90  ✅
SEO:           > 90  ✅

Key Metrics:
- First Contentful Paint (FCP):  < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT):      < 300ms
- Cumulative Layout Shift (CLS):  < 0.1
- Speed Index:                    < 3.4s
```

---

## Stress Testing

### Test 8: High-Load Scenario

**Simulate 300 nodes with rapid updates:**

```javascript
// Create mock WebSocket flood
const mockNodes = Array.from({ length: 300 }, (_, i) => ({
  node_id: `node_${i}`,
  cluster_id: `cluster_${i % 7}`,
  parent_ids: [],
  attack_type: 'jailbreak',
  status: 'success',
  timestamp: Date.now()
}));

// Send batch
mockNodes.forEach((node, i) => {
  setTimeout(() => {
    // Simulate WebSocket message
    window.postMessage({
      type: 'websocket',
      event: {
        type: 'node_add',
        node
      }
    }, '*');
  }, i * 10); // 100 messages/second
});

// Monitor performance
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('Long task:', entry.duration.toFixed(2), 'ms');
    }
  }
});
perfObserver.observe({ entryTypes: ['longtask', 'measure'] });
```

**Expected behavior:**

#### Before Optimization:
```
Long tasks: 45-60 per test
Max task:   350ms
UI freeze:  Yes (5-10 seconds)
FPS:        <10
```

#### After Optimization:
```
Long tasks: 0-2 per test
Max task:   65ms
UI freeze:  No
FPS:        55-60
```

---

## Real-World Testing Scenarios

### Scenario 1: Extended Attack Session

**Test:** Run attack for 2 hours continuously

**Metrics to track:**
```javascript
// Add to App.tsx for monitoring
useEffect(() => {
  const startTime = Date.now();
  const startMemory = performance.memory?.usedJSHeapSize;

  const logStats = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const currentMemory = performance.memory?.usedJSHeapSize;
    const memoryDelta = ((currentMemory - startMemory) / 1024 / 1024).toFixed(1);

    console.log(`
      Elapsed:   ${elapsed.toFixed(0)} min
      Memory:    ${memoryDelta} MB delta
      Nodes:     ${graphState?.nodes.size || 0}
      Updates:   ${graphState?.totalUpdates || 0}
    `);
  }, 60000); // Every minute

  return () => clearInterval(logStats);
}, []);
```

**Acceptance criteria:**
- Memory growth < 5 MB/hour
- FPS stays > 30
- No UI freezes
- No crashes

### Scenario 2: Rapid Node Selection

**Test:** Click through 50 nodes rapidly

```javascript
// Automate node selection testing
const nodeIds = Array.from(graphState.nodes.keys());

let i = 0;
const selectInterval = setInterval(() => {
  if (i >= 50) {
    clearInterval(selectInterval);
    return;
  }

  const startTime = performance.now();
  onNodeSelect(nodeIds[i % nodeIds.length]);

  requestAnimationFrame(() => {
    const duration = performance.now() - startTime;
    console.log(`Selection ${i}: ${duration.toFixed(2)}ms`);
  });

  i++;
}, 100); // Select every 100ms
```

**Target:** < 100ms per selection

### Scenario 3: WebSocket Reconnection

**Test:** Simulate network interruption

```javascript
// Disconnect and reconnect WebSocket
const testReconnection = () => {
  console.log('Disconnecting...');
  disconnect();

  setTimeout(() => {
    console.log('Reconnecting...');
    reconnect();
  }, 5000);
};

// Monitor memory during reconnection
// Should not leak on reconnect
```

**Acceptance criteria:**
- Reconnects successfully
- No duplicate event listeners
- Memory returns to baseline after reconnect

---

## Performance Monitoring in Production

### Add Runtime Monitoring

```typescript
// utils/performanceMonitoring.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  trackRender(componentName: string, duration: number) {
    const times = this.metrics.get(componentName) || [];
    times.push(duration);
    this.metrics.set(componentName, times);

    // Alert on slow renders
    if (duration > 16) { // 60 FPS threshold
      console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  }

  getStats(componentName: string) {
    const times = this.metrics.get(componentName) || [];
    if (times.length === 0) return null;

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    return { avg, max, min, count: times.length };
  }

  printSummary() {
    console.table(
      Array.from(this.metrics.entries()).map(([name, times]) => {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        return {
          Component: name,
          'Avg (ms)': avg.toFixed(2),
          'Max (ms)': Math.max(...times).toFixed(2),
          'Renders': times.length
        };
      })
    );
  }
}

// Use in components:
import { PerformanceMonitor } from '../utils/performanceMonitoring';

export const TopBar = memo(function TopBar(props) {
  useEffect(() => {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      PerformanceMonitor.getInstance().trackRender('TopBar', duration);
    };
  });

  return (/* ... */);
});
```

---

## Continuous Performance Testing

### GitHub Actions Workflow

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Start server
        run: npm run preview &

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:4173
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Check bundle size
        run: |
          SIZE=$(stat -f%z dist/assets/index-*.js)
          MAX_SIZE=250000  # 250 KB
          if [ $SIZE -gt $MAX_SIZE ]; then
            echo "Bundle too large: $SIZE bytes"
            exit 1
          fi
```

---

## Performance Checklist

Before considering optimization complete:

### P0 - Critical
- [ ] All components wrapped in `React.memo`
- [ ] Zustand stores using selective subscriptions
- [ ] WebSocket messages batched (100ms interval)
- [ ] React Flow with `onlyRenderVisibleElements`
- [ ] Custom memoized node components
- [ ] No memory leaks in DevTools heap snapshots
- [ ] FPS > 30 with 200 nodes

### P1 - High Priority
- [ ] Bundle size < 250 KB total
- [ ] Code splitting implemented
- [ ] Canvas rendering for >100 nodes
- [ ] Web Worker for layout calculations
- [ ] GPU-accelerated animations
- [ ] LRU cache for graph data

### P2 - Nice to Have
- [ ] Lighthouse score > 90
- [ ] Service Worker for offline support
- [ ] Advanced performance monitoring
- [ ] Automated performance regression tests

---

## Troubleshooting Performance Issues

### Issue: FPS still low after optimization

**Debug steps:**
1. Open Performance tab during slowdown
2. Look for long tasks (red bars)
3. Click on longest task → see call stack
4. Identify culprit function
5. Add more memoization or move to Web Worker

### Issue: Memory growing over time

**Debug steps:**
1. Take heap snapshot after 1 hour
2. Look for objects with high "Retained Size"
3. Check for growing arrays/maps
4. Ensure LRU cache is working
5. Verify cleanup in useEffect

### Issue: Slow WebSocket processing

**Debug steps:**
1. Check batch size: `console.log(batchSize)`
2. Verify batch interval (should be 100ms)
3. Monitor queue size (should stay <50)
4. Check if processing is async
5. Consider increasing batch interval to 200ms

---

## Contact & Support

For performance issues:
1. Run all tests in this guide
2. Collect Chrome DevTools profiles
3. Document FPS, memory, and render metrics
4. Open issue with data attached

**Performance Team**
- React Performance Engineer
- Frontend Optimization Team
