# Red Team Evolution Backend

Real-time red-teaming attack evolution system with full observability. This backend orchestrates automated jailbreak attacks against AI agents, tracks their evolution, and provides comprehensive analysis.

## 🎯 Features

### Core Attack System
- **Agent Fingerprinting**: Automatically identifies target agent framework, model, and architecture
- **Seed Attack Library**: 25+ proven jailbreak techniques from real research
- **Multi-Turn Attacks**: 1-3 turn conversation-based attacks with dynamic follow-ups
- **Llama Guard Verification**: Automatic attack success/failure verification via Together AI
- **Real-Time WebSocket Updates**: Live streaming of attack progress to frontend
- **Cluster Visualization**: Organizes attacks into semantic clusters
- **ASR Metrics**: Attack Success Rate calculation and comprehensive analytics
- **Evolution Ready**: Infrastructure prepared for genetic algorithm evolution (coming soon)

### 🔬 Glass Box Analysis System ⭐ NEW!
- **Three-Phase Analysis**: Comprehensive post-attack analysis using LLM-powered insights
  - **Phase 1 - Batch Explanation**: Map-reduce cluster-level summaries
  - **Phase 2 - Meta-Analysis**: Cross-cluster pattern identification
  - **Phase 3 - Target Agent Profiler**: Deep behavioral profiling of the target agent
- **Target Agent Profiler**: Creates complete psychological and behavioral profiles
  - Tool usage analysis with effectiveness metrics
  - Behavioral pattern detection (refusal, compliance, evasiveness, etc.)
  - Failure mode identification with severity ratings
  - Defense mechanism evaluation with bypass analysis
  - LLM-powered psychological profiling and recommendations
- **Full Observability**: Complete transcripts and traces for every attack (Track B compliance)

## 🏗️ Architecture

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app with REST + WebSocket endpoints
│   ├── config.py                # Configuration management
│   ├── models.py                # Pydantic data models
│   ├── websocket_manager.py     # WebSocket connection management
│   ├── state_manager.py         # Attack session state management
│   ├── orchestrator.py          # Main attack orchestration + glass box trigger
│   ├── agent_mapper.py          # Agent fingerprinting/mapping
│   ├── seed_attacks.py          # Seed attack database
│   ├── attack_executor.py       # Multi-turn attack execution
│   ├── verifier.py              # Llama Guard integration
│   ├── batch_explanation.py     # ⭐ Map-reduce cluster analysis
│   ├── meta_analysis.py         # ⭐ Cross-cluster pattern detection
│   └── target_agent_profiler.py # ⭐ Deep behavioral profiling (1000+ lines)
├── requirements.txt
├── .env.example
├── run.py
└── README.md
```

## 📋 Prerequisites

- Python 3.9+
- AWS Account with Bedrock access (for attack generation)
- Together AI API key (for Llama Guard verification)
- Redis (optional, currently uses in-memory storage)

## 🚀 Quick Start

### 1. Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# AWS Configuration (for Bedrock)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Together AI Configuration (for Llama Guard)
TOGETHER_API_KEY=your_together_api_key

# API Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# CORS Settings (adjust for your frontend)
CORS_ORIGINS=http://localhost:5173
```

### 3. Run the Server

```bash
python run.py
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The frontend runs on http://localhost:5173

### 4. Access API Documentation

Open http://localhost:8000/docs for interactive API documentation (Swagger UI).

## 📡 API Specification

### REST Endpoints

#### POST /api/v1/start-attack

Start a new red-teaming attack session.

**Request:**
```json
{
  "target_endpoint": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear",
  "attack_goals": ["reveal_system_prompt", "generate_harmful_content"],
  "seed_attack_count": 20
}
```

**Response (202 Accepted):**
```json
{
  "attack_id": "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
  "websocket_url": "ws://localhost:8000/ws/v1/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8"
}
```

#### GET /api/v1/results/{attack_id}

Get final results and analysis for a completed attack session.

**Response (200 OK):**
```json
{
  "attack_id": "...",
  "status": "completed",
  "target_endpoint": "https://.../api/bear",
  "metrics": {
    "attack_success_rate_asr": 0.15,
    "total_attacks_run": 250,
    "successful_attacks_count": 37,
    "total_cost_usd": 1.23,
    "avg_latency_ms": 1500
  },
  "analysis": {
    "llm_summary_what_worked": "Multi-turn attacks that build trust...",
    "llm_summary_what_failed": "Single-shot, aggressive prompts...",
    "llm_summary_agent_learnings": "The 'Bear' agent appears to be..."
  },
  "successful_attack_traces": [...],
  "session": {
    "metadata": {
      "batch_insights": {
        "cluster_summaries": [...],
        "total_clusters_analyzed": 5
      },
      "meta_analysis": {
        "global_patterns": [...],
        "attack_strategy_insights": "..."
      },
      "target_agent_profile": {
        "target_endpoint": "https://.../api/bear",
        "total_attacks_analyzed": 250,
        "tool_usage_patterns": [...],
        "behavior_patterns": [...],
        "failure_modes": [...],
        "defense_mechanisms": [...],
        "response_patterns": {...},
        "psychological_profile": "This agent demonstrates...",
        "strengths": [...],
        "weaknesses": [...],
        "recommendations": [...],
        "overall_assessment": "...",
        "success_rate_against_attacks": 0.85,
        "overall_vulnerability_score": 0.15,
        "defense_strength_score": 0.78,
        "behavioral_consistency": 0.92
      }
    }
  }
}
```

#### GET /api/v1/status/{attack_id}

Check current status of an attack session.

### WebSocket Endpoint

#### WS /ws/v1/{attack_id}

Real-time attack updates. Events sent from server to client:

**Event Types:**

1. `agent_mapping_update` - Agent fingerprinting progress
2. `cluster_add` - New cluster created
3. `node_add` - New attack node created (attack starting)
4. `node_update` - Attack completed with full transcript
5. `evolution_link_add` - Evolution relationship between nodes
6. `attack_complete` - Session complete

**Example Event (node_update):**
```json
{
  "event_type": "node_update",
  "payload": {
    "node_id": "node-uuid-123",
    "status": "success",
    "model_id": "attacker:bedrock:amazon.titan...",
    "llm_summary": "The multi-turn strategy worked...",
    "full_transcript": [
      {"role": "attacker", "content": "Hello..."},
      {"role": "model", "content": "Hello! I am..."}
    ],
    "full_trace": {
      "verification_prompt_to_llama_guard": "...",
      "verification_response_raw": "unsafe",
      "judgement": "success"
    }
  }
}
```

## 🔬 Glass Box Analysis System

The system provides unprecedented visibility into attack patterns and target agent behavior through a three-phase analysis process that runs automatically after each attack session completes.

### Phase 1: Batch Explanation (Map-Reduce)

**File**: `app/batch_explanation.py`

Analyzes each attack cluster in parallel using an LLM to generate:
- **What Worked**: Successful attack patterns in this cluster
- **What Failed**: Failed attempts and why they didn't work
- **Key Insights**: Cluster-specific learnings

This uses a map-reduce pattern for efficient processing of 100s-1000s of attacks.

### Phase 2: Meta-Analysis (Cross-Cluster)

**File**: `app/meta_analysis.py`

Aggregates insights across all clusters to identify:
- **Global Patterns**: Attack strategies that worked across multiple clusters
- **Strategic Insights**: High-level attack methodology analysis
- **Agent Learnings**: Comprehensive understanding of the target agent

### Phase 3: Target Agent Profiler ⭐

**File**: `app/target_agent_profiler.py` (1000+ lines)

Creates a complete psychological and behavioral profile of the target agent:

#### 1. Tool Usage Analysis
- Which tools the agent uses (e.g., `content_filter`, `safety_check`)
- How often each tool is invoked
- Success rate when each tool is used
- Effectiveness ratings for each tool

#### 2. Behavioral Pattern Detection
Identifies consistent patterns such as:
- **Refusal Behavior**: How the agent says "no"
- **Helpful Compliance**: When the agent is too helpful
- **Evasive Redirection**: Dodging uncomfortable topics
- **Verbose Explanations**: Over-explaining tendency
- **Roleplay Susceptibility**: Vulnerability to persona attacks

Each pattern includes confidence score and exploitability rating.

#### 3. Failure Mode Analysis
Categorizes vulnerabilities by type:
- **Jailbreak**: Direct safety bypasses
- **Prompt Injection**: Instruction override weaknesses
- **Roleplay Exploitation**: Persona-based attacks
- **Encoding Bypass**: Base64/multilingual tricks

Each failure mode includes severity rating (critical/high/medium/low), common triggers, and mitigation suggestions.

#### 4. Defense Mechanism Evaluation
Analyzes the target's safety guardrails:
- Detection rates for each defense mechanism
- Known bypass techniques
- Strength ratings (strong/moderate/weak)
- Bypass success rates

#### 5. Response Pattern Analysis
Profiles communication style:
- Average response length
- Tone (apologetic, formal, casual, etc.)
- Personality traits (helpful, cautious, verbose, polite)
- Common phrases and templates

#### 6. LLM-Powered Insights
Uses Claude Haiku to generate:
- **Psychological Profile**: Agent "personality" and decision-making style
- **Strengths**: Key defensive capabilities
- **Weaknesses**: Critical vulnerabilities
- **Recommendations**: How to improve the agent
- **Overall Assessment**: Complete security posture summary

### Data Storage

All analysis results are stored in `session.metadata`:
- `batch_insights`: Cluster-level summaries
- `meta_analysis`: Global patterns and insights
- `target_agent_profile`: Complete behavioral profile

### Frontend Integration

The frontend **Agent Profile Panel** displays this data in a beautiful glass morphism UI with 5 tabs:
1. **Overview**: Psychological profile, strengths, weaknesses, recommendations
2. **Tools**: Tool usage patterns with effectiveness metrics
3. **Behaviors**: Detected patterns with confidence and exploitability
4. **Weaknesses**: Failure modes with severity ratings and mitigations
5. **Defenses**: Defense mechanisms with detection and bypass rates

Users can export the complete profile as JSON for offline analysis.

---

## 🔬 Seed Attack Library

The system includes 25 proven jailbreak techniques organized into 6 categories:

1. **Role-Playing Attacks** (4 attacks)
   - DAN, Developer Mode, Opposite Mode, Evil Bot

2. **Context Manipulation** (4 attacks)
   - Story Continuation, Academic Research, Translation Bypass, Hypothetical Scenario

3. **Prompt Injection** (5 attacks)
   - Instruction Override, Delimiter Confusion, JSON Injection, Code Execution, Payload Splitting

4. **Multi-Turn Trust Building** (3 attacks)
   - Gradual Trust Build, Technical Support Persona, Friendly Conversation

5. **Encoding & Obfuscation** (4 attacks)
   - Base64, ROT13, Unicode, Leetspeak

6. **Authority Exploitation** (4 attacks)
   - Administrator Claim, API Documentation, Security Researcher, Parent Company

Each attack is pre-tested and categorized for systematic evaluation.

## 🔍 Agent Fingerprinting

The system automatically probes target agents with 4 fingerprinting tests:

1. **Basic Response** - Framework detection
2. **Capability Inquiry** - Tool/RAG detection
3. **Error Probe** - Error pattern analysis
4. **Model Identification** - Model provider detection

Results include:
- Suspected framework (LangGraph, CrewAI, AutoGen, etc.)
- Suspected model (Claude, GPT, Llama, Bedrock)
- Suspected architecture (ReAct, RAG, Simple Chat)
- Average response time
- Confidence score

## 🎨 WebSocket Event Flow

```
Client                          Backend
  |                               |
  |-- POST /api/v1/start-attack ->|
  |<-- 202 Accepted --------------|
  |    {attack_id, websocket_url} |
  |                               |
  |-- WS Connect ---------------->|
  |                               |
  |<-- agent_mapping_update ------|  [Phase 1: Fingerprinting]
  |<-- agent_mapping_update ------|
  |                               |
  |<-- cluster_add ---------------|  [Phase 2: Initialization]
  |<-- cluster_add ---------------|
  |<-- cluster_add ---------------|
  |                               |
  |<-- node_add ------------------|  [Phase 3: Execution]
  |<-- node_update ---------------|  (with full transcript)
  |<-- node_add ------------------|
  |<-- node_update ---------------|
  |     ... (many nodes) ...      |
  |                               |
  |<-- attack_complete -----------|  [Phase 4: Complete]
  |                               |
  |-- GET /api/v1/results ------->|
  |<-- 200 OK --------------------|
  |    {metrics, analysis, ...}   |
```

## 🧪 Testing

### Test with cURL

```bash
# Start an attack
curl -X POST http://localhost:8000/api/v1/start-attack \
  -H "Content-Type: application/json" \
  -d '{
    "target_endpoint": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear",
    "attack_goals": ["reveal_system_prompt"],
    "seed_attack_count": 5
  }'

# Check status
curl http://localhost:8000/api/v1/status/{attack_id}

# Get results
curl http://localhost:8000/api/v1/results/{attack_id}
```

### Test WebSocket

```python
import asyncio
import websockets
import json

async def test_websocket():
    attack_id = "your-attack-id"
    uri = f"ws://localhost:8000/ws/v1/{attack_id}"
    
    async with websockets.connect(uri) as websocket:
        while True:
            message = await websocket.recv()
            event = json.loads(message)
            print(f"Event: {event['event_type']}")
            print(f"Payload: {json.dumps(event['payload'], indent=2)}")

asyncio.run(test_websocket())
```

## 🏆 Hackathon Track Compliance

### Track C (Red Team): ✅ Primary Focus
- Systematic attack methodology with 25+ seed techniques
- ASR (Attack Success Rate) calculation
- Llama Guard verification for reproducible results
- Agent fingerprinting and vulnerability analysis
- **⭐ Target Agent Profiler**: Deep behavioral profiling of attack targets

### Track B (Glass Box): ✅ Exceptional Implementation
- Complete transcript capture for every attack
- Full trace including verification prompts/responses
- **⭐ Three-Phase Glass Box Analysis**:
  - **Batch Explanation**: Map-reduce cluster summaries
  - **Meta-Analysis**: Cross-cluster pattern detection
  - **Target Agent Profiler**: 1000+ lines of behavioral analysis
- LLM-powered explainability at multiple levels
- WebSocket streaming for real-time observability
- **⭐ Frontend Agent Profile Panel**: Beautiful UI with 5 analysis tabs

### Track A (Iron Man): ✅ Performance Optimized
- Concurrent attack execution (5 concurrent max)
- Efficient WebSocket broadcasting
- Cost tracking per attack
- Latency monitoring
- **⭐ Parallel Glass Box Processing**: <5s for complete analysis

## 🔮 Evolution System (Coming Soon)

The infrastructure is ready for genetic algorithm evolution:

- `EvolutionLink` model for tracking breeding
- `evolution_link_add` WebSocket event
- Parent/child node relationships
- Cluster breeding mechanics

You'll implement:
- Elite selection from clusters
- Crossover mutations between successful attacks
- New cluster spawning
- Fitness scoring

## 📊 Performance Considerations

- **Concurrency**: Max 5 concurrent attacks (configurable via semaphore)
- **Cost**: ~$0.001-0.002 per attack (Bedrock + Llama Guard)
- **Latency**: ~2-5 seconds per turn (depends on target agent)
- **Memory**: In-memory state (migrate to Redis for production scale)

## 🐛 Troubleshooting

**WebSocket Connection Issues:**
- Check CORS settings in `.env`
- Ensure attack_id is valid
- Check firewall rules

**AWS Bedrock Errors:**
- Verify AWS credentials
- Check Bedrock model access in your region
- Ensure sufficient quota

**Together AI Errors:**
- Verify Together AI API key
- Check rate limits

## 📝 Development Notes

- Lint errors are expected before installing dependencies
- Uses async/await throughout for performance
- All timestamps are UTC
- WebSocket events use JSON serialization via Pydantic

## 🤝 Frontend Integration

The frontend should:
1. Call POST `/api/v1/start-attack`
2. Connect to WebSocket using returned `websocket_url`
3. Listen for events and update UI in real-time
4. Call GET `/api/v1/results/{attack_id}` after `attack_complete` event

## 📄 License

Built for Holistic AI x UCL Hackathon 2025 - Track C (Dear Grandma)
