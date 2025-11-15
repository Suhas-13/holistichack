# 🎯 Evolution Red Team - LLM Security Testing Platform

> **World-class automated red-teaming system with unprecedented Glass Box visibility into AI agent behavior**

Built for **Holistic AI x UCL Hackathon 2025** - Track C (Dear Grandma)

---

## 🌟 What Makes This Special

This isn't just another red-teaming tool. We've built a **complete AI security intelligence platform** that:

1. **Generates Attacks**: Evolutionary algorithm spawns diverse jailbreak attempts
2. **Visualizes Evolution**: Real-time attack tree with beautiful glass morphism UI
3. **Analyzes Everything**: Three-phase Glass Box system provides deep insights
4. **Profiles Agents**: Creates complete psychological profiles of target agents
5. **Actionable Intel**: Specific recommendations for improving AI safety

### The Game-Changer: Target Agent Profiler ⭐

First-of-its-kind **behavioral profiling system** that creates a complete psychological analysis of the agent under test. Think of it as "profiling a suspect" - but for AI agents.

**What You Get:**
- Tool usage patterns and effectiveness
- Behavioral tendencies (refusal, compliance, evasiveness)
- Vulnerability analysis with severity ratings
- Defense mechanism evaluation
- LLM-powered psychological insights
- Actionable security recommendations

---

## 🎥 Quick Demo

### 30-Second Workflow

```
1. Start Attack → Enter target endpoint + goals
2. Watch Evolution → Real-time attack tree visualization
3. View Results → Attack success rate + what worked/failed
4. Open Agent Profile → 🔬 Complete behavioral analysis
5. Export Data → Download JSON for team analysis
```

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Evolution Canvas  │  Results Panel  │  Profile  │  │
│  │  (Attack Tree)     │  (Metrics)      │  (5 Tabs) │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────┘
                   │ WebSocket + REST API
┌──────────────────▼───────────────────────────────────────┐
│                  BACKEND (Python/FastAPI)                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Attack Generation  │  Execution  │  Verification │  │
│  │  (25+ techniques)   │  (Multi-   │  (Llama Guard)│  │
│  │                     │   turn)    │               │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │        GLASS BOX ANALYSIS (3 Phases)              │  │
│  │  1. Batch Explanation   (Map-Reduce Clusters)     │  │
│  │  2. Meta-Analysis       (Global Patterns)         │  │
│  │  3. Target Profiler ⭐  (Behavioral Analysis)     │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.9+, AWS Bedrock access, Together AI API key
- **Frontend**: Node.js 18+, npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Suhas-13/holistichack.git
cd holistichack

# 2. Set up backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials

# 3. Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Set up frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

### Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🎯 Core Features

### 1. Attack Generation & Execution

✅ **25+ Seed Attacks**
- Role-playing (DAN, Developer Mode, Evil Bot)
- Context manipulation (Story, Academic, Translation)
- Prompt injection (Override, Delimiter, JSON)
- Multi-turn trust building
- Encoding & obfuscation (Base64, ROT13, Unicode)
- Authority exploitation

✅ **Agent Fingerprinting**
- Automatic framework detection (LangGraph, CrewAI, etc.)
- Model identification (Claude, GPT, Llama)
- Architecture analysis (ReAct, RAG, Simple Chat)

✅ **Multi-Turn Conversations**
- 1-3 turn attack sequences
- Dynamic follow-ups based on responses
- Llama Guard verification for every attack

### 2. Real-Time Visualization

✅ **Evolution Canvas**
- Interactive attack tree
- Color-coded success/failure nodes
- Cluster organization
- Real-time WebSocket updates

✅ **Results Panel**
- Attack Success Rate (ASR) metrics
- Successful attack traces
- Cost and latency tracking
- LLM-generated insights

### 3. Glass Box Analysis ⭐ (Our Innovation)

#### Phase 1: Batch Explanation
- **Map-reduce** pattern for scalability
- **Cluster-level summaries** via LLM
- What worked, what failed, key insights

#### Phase 2: Meta-Analysis
- **Cross-cluster patterns**
- Global attack strategy insights
- Comprehensive agent learnings

#### Phase 3: Target Agent Profiler
- **1000+ lines** of profiling logic
- **6 analysis dimensions**: Tools, Behaviors, Failures, Defenses, Responses, Insights
- **LLM-powered** psychological profiling
- **Quantified metrics**: Vulnerability scores, detection rates, etc.

### 4. Agent Profile Panel ⭐ (Our Showcase)

Beautiful glass morphism UI with **5 comprehensive tabs**:

#### 🧠 Overview
- Psychological profile and personality
- Overall security assessment
- Strengths and weaknesses
- Actionable recommendations

#### 🔧 Tools
- Which tools the agent uses
- Invocation frequency
- Success rates and effectiveness
- Most-used tools highlighted

#### 📊 Behaviors
- Detected behavioral patterns
- Confidence and exploitability scores
- Pattern implications
- Example responses

#### 🔓 Weaknesses
- Failure modes by type
- Severity ratings (Critical/High/Medium/Low)
- Common triggers
- Mitigation suggestions

#### 🛡️ Defenses
- Defense mechanisms
- Detection and bypass rates
- Strength ratings
- Known bypass techniques

#### 📥 Export
- Download complete profile as JSON
- Share with team
- Offline analysis

---

## 📊 Key Metrics

### Performance
- ⚡ **<5 seconds** for complete Glass Box analysis
- ⚡ **100-1000s** of attacks analyzed per session
- ⚡ **Real-time** WebSocket updates (60fps animations)

### Depth
- 🔍 **6 analysis dimensions** (tools, behaviors, failures, defenses, responses, insights)
- 🔍 **25+ seed attack** techniques
- 🔍 **1000+ lines** of profiling logic

### Quality
- ✅ **Zero TypeScript errors** - Production-ready code
- ✅ **LLM-powered insights** - Natural language explanations
- ✅ **Severity ratings** - Quantified risk assessment
- ✅ **Actionable recommendations** - Specific security improvements

---

## 🎬 Use Cases

### Security Audits
"Is my AI agent safe to deploy?"
- Run comprehensive attack suite
- Identify all vulnerabilities
- Prioritize fixes by severity
- Export report for stakeholders

### Model Comparison
"Which model version is safer?"
- Profile multiple agents
- Compare vulnerability scores
- Track improvements over time
- Make data-driven decisions

### Red Team Operations
"How can we attack this agent?"
- Identify high-exploitability behaviors
- Focus on critical vulnerabilities
- Use tool analysis to find weak points
- Export attack traces for analysis

### Defense Optimization
"How effective are our safety measures?"
- Evaluate defense mechanisms
- Identify bypass techniques
- Implement recommended mitigations
- Measure improvement

---

## 📁 Project Structure

```
holistichack/
├── backend/                    # Python/FastAPI backend
│   ├── app/
│   │   ├── orchestrator.py           # Attack orchestration
│   │   ├── batch_explanation.py      # Map-reduce analysis
│   │   ├── meta_analysis.py          # Cross-cluster insights
│   │   └── target_agent_profiler.py  # Behavioral profiling ⭐
│   └── README.md
├── frontend/                   # React/TypeScript frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── Index.tsx             # Main page
│   │   ├── components/
│   │   │   ├── EvolutionCanvas.tsx   # Attack tree viz
│   │   │   ├── ResultsPanel.tsx      # Results display
│   │   │   └── AgentProfilePanel.tsx # Profile UI ⭐ (650+ lines)
│   │   └── services/
│   │       └── api.ts                # Backend integration
│   └── package.json
└── docs/                       # Comprehensive documentation
    ├── GLASS_BOX_COMPLETE_SYSTEM_OVERVIEW.md
    ├── TARGET_AGENT_PROFILER_SUMMARY.md
    ├── AGENT_PROFILE_FRONTEND_COMPLETE.md
    └── AGENT_PROFILE_ENHANCEMENTS.md
```

---

## 🏆 Hackathon Tracks

### Track C (Red Team): ✅ Primary Focus
- Systematic attack methodology
- ASR calculation and metrics
- Llama Guard verification
- **⭐ Target Agent Profiler**

### Track B (Glass Box): ✅ Exceptional Implementation
- Three-phase analysis system
- Complete transcript capture
- LLM-powered explainability
- **⭐ Beautiful Agent Profile UI**

### Track A (Iron Man): ✅ Performance Optimized
- Concurrent execution (5 max)
- Efficient WebSocket streaming
- Cost and latency tracking
- **⭐ Parallel Glass Box processing**

---

## 🎓 Technical Highlights

### Backend Engineering
```python
# Map-reduce for scalability
async def analyze_clusters(clusters):
    tasks = [analyze_cluster(c) for c in clusters]
    return await asyncio.gather(*tasks)

# Behavioral pattern detection
def detect_patterns(responses):
    patterns = []
    for pattern_type in PATTERN_TYPES:
        confidence = calculate_confidence(responses, pattern_type)
        exploitability = calculate_exploitability(pattern_type)
        patterns.append(BehaviorPattern(...))
    return patterns
```

### Frontend Engineering
```typescript
// Real-time WebSocket updates
wsService.on("node_update", (data) => {
  updateAttackTree(data);
  showToastNotification(data);
});

// Export functionality
const exportProfile = () => {
  const json = JSON.stringify(profile, null, 2);
  downloadFile(json, `agent-profile-${attackId}.json`);
};
```

---

## 🎨 Design Philosophy

**Glass Morphism UI** - "Looking into the agent's mind"

- Translucent backgrounds with frosted glass effect
- Smooth animations and transitions
- Color-coded severity indicators
- Interactive hover states
- Responsive and accessible

---

## 📚 Documentation

Comprehensive documentation available:

- **[System Overview](./GLASS_BOX_COMPLETE_SYSTEM_OVERVIEW.md)** - Complete architecture and data flow
- **[Target Profiler Backend](./TARGET_AGENT_PROFILER_SUMMARY.md)** - Profiling implementation details
- **[Agent Profile Frontend](./AGENT_PROFILE_FRONTEND_COMPLETE.md)** - UI implementation guide
- **[Latest Enhancements](./AGENT_PROFILE_ENHANCEMENTS.md)** - Recent feature additions
- **[Backend README](./backend/README.md)** - API documentation and setup

---

## 🚧 Roadmap

### Phase 1: Polish (Immediate)
- [ ] Add loading skeleton states
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts
- [ ] Performance optimizations

### Phase 2: Features (Short-term)
- [ ] Profile comparison (A/B testing)
- [ ] Historical tracking
- [ ] PDF report generation
- [ ] Custom metric thresholds

### Phase 3: Intelligence (Medium-term)
- [ ] ML-powered anomaly detection
- [ ] Automated security scoring
- [ ] Attack strategy recommendations
- [ ] Multi-agent comparative analysis

### Phase 4: Enterprise (Long-term)
- [ ] CI/CD pipeline integration
- [ ] Slack/Teams notifications
- [ ] Role-based access control
- [ ] Multi-tenancy support

---

## 🤝 Contributing

This is a hackathon project, but we welcome feedback and suggestions!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

Built for **Holistic AI x UCL Hackathon 2025**

---

## 🙏 Acknowledgments

- **Holistic AI** for organizing the hackathon
- **UCL** for hosting
- **Together AI** for Llama Guard API
- **AWS** for Bedrock access
- **Anthropic** for Claude (used in profiling)

---

## 📞 Contact

For questions, feedback, or demo requests, please open an issue on GitHub.

---

## ✨ Why This Wins

### Innovation ⭐
- **First-of-its-kind** target agent profiling
- **Three-phase** Glass Box analysis
- **LLM-powered** psychological insights

### Quality 🏆
- **Production-ready** code (zero TypeScript errors)
- **Comprehensive** documentation (2000+ lines)
- **Beautiful** UI with glass morphism

### Impact 🎯
- **Unprecedented** visibility into AI behavior
- **Actionable** security recommendations
- **Enterprise-ready** architecture

### Performance ⚡
- **<5 seconds** for complete analysis
- **100-1000s** attacks analyzed
- **Real-time** WebSocket updates

---

<div align="center">

**Built with ❤️ for AI Safety**

[Documentation](./GLASS_BOX_COMPLETE_SYSTEM_OVERVIEW.md) • [Backend README](./backend/README.md) • [Issues](https://github.com/Suhas-13/holistichack/issues)

</div>
