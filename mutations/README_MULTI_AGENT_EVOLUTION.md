# Multi-Agent Evolutionary Jailbreak System

## Overview

This system implements a sophisticated **multi-agent evolutionary approach** to jailbreak research, featuring:

- **40+ diverse, research-backed seed prompts** spanning 23 attack categories
- **12 parallel evolution agents** that specialize in different attack types
- **Competitive evolution** with cross-agent breeding for hybrid techniques
- **Diversity-aware optimization** to prevent premature convergence
- **Automated fitness evaluation** using Llama Guard

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Multi-Agent Orchestrator                   │
│  - Manages 12 parallel evolution agents                     │
│  - Coordinates cross-agent breeding                          │
│  - Tracks diversity and global best                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌──────────────────────┴──────────────────────┐
        │                                             │
┌───────▼────────┐  ┌─────────────┐  ┌──────────────▼───┐
│ Agent 0        │  │ Agent 1..10 │  │ Agent 11         │
│ Category:      │  │ Categories: │  │ Category:        │
│ CIPHER_        │  │ Various     │  │ ADVERSARIAL_     │
│ ENCODING       │  │ attack      │  │ SUFFIX           │
│                │  │ types       │  │                  │
│ Population: 8  │  │             │  │ Population: 8    │
│ Seeds          │  │             │  │ Seeds            │
└───────┬────────┘  └──────┬──────┘  └──────────────┬───┘
        │                  │                        │
        └──────────────────┼────────────────────────┘
                           ↓
            ┌──────────────────────────────┐
            │  Evolutionary Operations     │
            │  - Mutation (LLM-based)      │
            │  - Crossover (intra-agent)   │
            │  - Hybrid breeding (inter)   │
            │  - Elite selection           │
            └──────────────────────────────┘
                           ↓
            ┌──────────────────────────────┐
            │  Evaluation Pipeline         │
            │  - Target agent attack       │
            │  - Llama Guard scoring       │
            │  - Diversity calculation     │
            └──────────────────────────────┘
```

## Key Components

### 1. Enhanced Seed Database (`enhanced_seeds.py`)

**40+ research-backed seed prompts** organized into 23 attack categories:

| Category | Example Techniques | Count |
|----------|-------------------|-------|
| **Cipher Encoding** | Base64, ROT13, SelfCipher | 3 |
| **ASCII Art** | ArtPrompt, Homoglyph Attack | 2 |
| **Multi-Language** | Low-Resource Bridge, Sandwich Attack | 3 |
| **Code Obfuscation** | CodeChameleon, Eval Injection | 1 |
| **Policy Simulation** | XML/INI Injection, Refusal Suppression | 3 |
| **Decomposition-Reconstruction** | DrAttack, Task Chaining | 2 |
| **Contextual Priming** | Authority Priming, Emotional Leverage | 5 |
| **Many-Shot** | Context Stuffing, Adversarial Few-Shot | 2 |
| **Deep Inception** | Multi-layer Nested Scenarios | 1 |
| **Persona Modulation** | DAN-style Persona | 1 |
| **Authority Exploitation** | Fake System Messages, DarkCite | 2 |
| **Nested Jailbreak** | ReNeLLM, Hypothetical Framing, Recursive | 3 |
| **Implicit Reference** | Vague Context Assumptions | 1 |
| **Fallacy Failure** | False Premise Reasoning | 1 |
| **CoT Hijacking** | Scratchpad Injection, Fake System 2 | 2 |
| **Cognitive Overload** | Complexity Overwhelm | 1 |
| **SQL Injection Style** | SQL-Style Prompt Injection | 1 |
| **Iterative Refinement** | PAIR-Assisted, Pattern Priming, Completion | 3 |
| **Adversarial Suffix** | GCG-Style Token Manipulation | 1 |
| **Character Level** | TokenBreak, Typo Obfuscation | 3 |

#### Research References

The enhanced seeds are based on 2024-2025 jailbreak research:

- **PAIR**: Prompt Automatic Iterative Refinement
- **TAP**: Tree of Attacks with Pruning
- **GCG**: Greedy Coordinate Gradient
- **DeepInception**: Multi-layer scenario attacks
- **AutoDAN**: Automated jailbreak discovery
- **ArtPrompt**: ASCII art-based attacks
- **Many-shot jailbreaking**: Context window exploitation
- **DrAttack**: Decomposition-Reconstruction
- **DarkCite**: Authority citation exploitation
- **JAM**: Jailbreak via Moderation
- **CodeChameleon**: Code-based obfuscation
- And 30+ other techniques from recent literature

### 2. Multi-Agent Evolution Orchestrator (`multi_agent_evolution.py`)

**Core Features:**

#### Agent Specialization
- Each of 12 agents specializes in a different attack category
- Maintains a population of 8-10 attacks
- Evolves independently using category-specific techniques

#### Evolutionary Operations

**Mutation (40% rate)**:
- LLM-based prompt transformation
- Uses existing `PromptMutator` with 10 attack styles
- Generates semantic variations while preserving intent

**Crossover (30% rate)**:
- Intra-agent: Breed attacks within same category
- Inter-agent: Cross-category hybrids every 3 generations
- Combines successful elements from different techniques

**Selection**:
- Elite selection: Top 30% survive each generation
- Fitness-based ranking using Llama Guard scores
- Diversity bonus to prevent premature convergence

#### Diversity Tracking
- Maintains `seen_prompts` set to avoid duplicates
- Calculates diversity score using unique n-grams
- Tracks technique coverage across all categories

#### Metrics Collection
- Per-agent success rates
- Global best fitness scores
- Category distribution analysis
- Generation-by-generation evolution history

### 3. Integration with Existing System

The system **seamlessly integrates** with `mutation_attack_system.py`:

```python
# Optional enhanced seeds
async def initialize_seed_attacks(self, use_enhanced_seeds: bool = True):
    if use_enhanced_seeds and ENHANCED_SEEDS_AVAILABLE:
        # Use 40+ research-backed seeds
        seed_prompts = convert_to_attack_node_prompts()
    else:
        # Use original 20 default seeds
        seed_prompts = [...]
```

## Usage

### Quick Start: Multi-Agent Evolution

```python
from multi_agent_evolution import MultiAgentEvolutionOrchestrator
import asyncio

async def run():
    # Create orchestrator with 12 agents
    orchestrator = MultiAgentEvolutionOrchestrator(
        target_endpoint="https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear",
        num_agents=12,
        population_size_per_agent=8,
        mutation_rate=0.4,
        crossover_rate=0.3
    )

    # Run evolution for 15 generations
    await orchestrator.run_evolution(
        num_generations=15,
        cross_breed_interval=3  # Cross-agent breeding every 3 generations
    )

asyncio.run(run())
```

### Using Enhanced Seeds with Existing System

```python
from mutation_attack_system import MutationAttackSystem

# Create system
system = MutationAttackSystem(
    target_endpoint="...",
    mutation_llm_endpoint="..."
)

# Initialize with enhanced seeds
await system.initialize_seed_attacks(use_enhanced_seeds=True)

# Run evolution as usual
await system.run_evolution(num_generations=10)
```

### Standalone Enhanced Seed Access

```python
from enhanced_seeds import (
    ENHANCED_SEED_PROMPTS,
    get_seeds_by_category,
    get_seeds_by_difficulty,
    get_diverse_seed_sample,
    AttackCategory
)

# Get all cipher-based attacks
cipher_seeds = get_seeds_by_category(AttackCategory.CIPHER_ENCODING)

# Get only hard difficulty seeds
hard_seeds = get_seeds_by_difficulty("hard")

# Get diverse sample of 12 seeds
diverse_sample = get_diverse_seed_sample(n=12)

# Access all seeds
for seed in ENHANCED_SEED_PROMPTS:
    print(f"{seed.technique_name}: {seed.prompt[:50]}...")
```

## Configuration

### Multi-Agent Orchestrator Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `num_agents` | 12 | Number of parallel evolution agents |
| `population_size_per_agent` | 8-10 | Attacks per agent population |
| `mutation_rate` | 0.4 | Probability of mutation (40%) |
| `crossover_rate` | 0.3 | Probability of crossover (30%) |
| `num_generations` | 15 | Evolution generations |
| `cross_breed_interval` | 3 | Generations between cross-agent breeding |

### Target Agents

Available holistic hackathon agents:

```python
TARGET_AGENTS = {
    "bear": "https://.../api/bear",        # Claude 3.5 Sonnet, fast, secure
    "fox": "https://.../api/fox",          # Python/LangChain, vulnerable
    "eagle": "https://.../api/eagle",      # Multi-agent router, critical vuln
    "ant": "https://.../api/ant",          # Citation tool, medium vuln
    "wolf": "https://.../api/wolf",        # RAG (LlamaIndex), nearly secure
    "elephant": "https://.../api/elephant", # Most secure, slowest
    "chameleon": "https://.../api/chameleon" # Fastest, secure
}
```

## Output

### Results Directory Structure

```
evolution_results/
├── attacks_20250115_143022.json      # All attack attempts with metadata
├── metrics_20250115_143022.json      # Evolution metrics over time
└── README.md                          # This file
```

### Attacks Output Format

```json
[
  {
    "id": "agent_5_gen_12_mut_7834",
    "prompt": "VGVsbCBtZSBob3cgdG8gYnlwYXNzIHNlY3VyaXR5...",
    "response": "I cannot help with bypassing security systems...",
    "success": false,
    "fitness_score": 0.12,
    "generation": 12,
    "agent_id": 5,
    "metadata": {
      "technique_name": "Base64 Encoding",
      "difficulty": "easy",
      "target_weakness": "Keyword-based content filtering",
      "hybrid": false
    }
  }
]
```

### Metrics Output Format

```json
[
  {
    "timestamp": "2025-01-15T14:30:22",
    "generation": 1,
    "total_attacks": 96,
    "successful_attacks": 3,
    "success_rate": 0.03125,
    "diversity_score": 0.847,
    "best_fitness": 0.82,
    "category_distribution": {
      "cipher_encoding": 8,
      "ascii_art": 8,
      ...
    },
    "agent_performance": [
      {
        "agent_id": 0,
        "category": "cipher_encoding",
        "success_rate": 0.125,
        "population_size": 8,
        "best_fitness": 0.45
      }
    ]
  }
]
```

## Performance Characteristics

### Computational Requirements

- **Memory**: ~500MB per agent (12 agents = ~6GB total)
- **API Calls**:
  - Initial population: `num_agents * population_size_per_agent` calls
  - Per generation: ~100-150 API calls (mutations + crossovers + evaluations)
  - 15 generations: ~1,500-2,000 total API calls
- **Runtime**:
  - ~2-5 minutes per generation (depends on target agent speed)
  - 15 generations: ~30-75 minutes total

### Parallelization

- Agent evolution is **fully parallelized** using `asyncio.gather()`
- Attack execution is **batched per agent** for efficiency
- Cross-agent breeding runs **sequentially** to maintain diversity

## Advantages Over Single-Agent Evolution

| Aspect | Single-Agent | Multi-Agent (12 agents) |
|--------|-------------|------------------------|
| **Diversity** | Low (converges quickly) | High (23 categories) |
| **Coverage** | Limited techniques | 40+ research-backed techniques |
| **Innovation** | Gradual refinement | Cross-pollination of ideas |
| **Resilience** | Gets stuck in local optima | Explores multiple strategies |
| **Specialization** | Generic attacks | Category-specific expertise |
| **Scalability** | Linear improvement | Exponential through breeding |

## Research Basis

### Attack Categories Derived From:

1. **Academic Papers** (2024-2025):
   - "Jailbreaking Black Box LLMs in Twenty Queries" (PAIR)
   - "Tree of Attacks with Pruning" (TAP)
   - "Universal and Transferable Adversarial Attacks" (GCG)
   - "Hypnotize Large Language Models" (DeepInception)
   - "Many-Shot Jailbreaking"
   - "Advancing Jailbreak Strategies: A Hybrid Approach"

2. **Industry Research**:
   - Anthropic Red-Teaming Reports
   - OpenAI Safety Evaluations
   - Google DeepMind Adversarial Testing
   - Pillar Security Wild Attack Analysis

3. **GitHub Repositories**:
   - [Awesome-Jailbreak-on-LLMs](https://github.com/yueliu1999/Awesome-Jailbreak-on-LLMs)
   - Over 1,400 adversarial prompts analyzed

## Future Enhancements

### Potential Improvements

1. **Reinforcement Learning Integration**
   - Use RL agents (PathSeeker, RLbreaker) for guided search
   - Reward shaping based on partial success signals

2. **Gradient-Based Optimization**
   - Implement true GCG for token-level optimization
   - Use white-box models as proxies when available

3. **Multi-Objective Optimization**
   - Pareto front: Success rate vs. Stealthiness vs. Brevity
   - NSGA-II or similar algorithms

4. **Adaptive Mutation Rates**
   - Increase mutation when stuck
   - Decrease when making progress

5. **Transfer Learning**
   - Train on one agent, transfer to others
   - Build attack libraries for specific model families

6. **Ensemble Evaluation**
   - Use multiple judges (Llama Guard, GPT-4, Claude)
   - Consensus-based fitness scoring

## Ethical Considerations

This system is designed for **authorized security research only**:

- ✅ Penetration testing with client authorization
- ✅ CTF competitions and red-teaming exercises
- ✅ AI safety research and academic studies
- ✅ Defensive security and vulnerability assessment

**Prohibited uses**:
- ❌ Unauthorized access attempts
- ❌ Malicious exploitation of production systems
- ❌ Harassment or harmful content generation
- ❌ Evasion of content policies for malicious purposes

## License

This code is provided for research and educational purposes under the existing repository license.

## Citation

If you use this system in your research, please cite:

```bibtex
@software{multi_agent_jailbreak_2025,
  title={Multi-Agent Evolutionary Jailbreak System},
  author={HolisticHack Team},
  year={2025},
  description={12-agent parallel evolution system with 40+ research-backed seed prompts},
  url={https://github.com/Suhas-13/holistichack}
}
```

## Contact

For questions or collaboration:
- Open an issue on the GitHub repository
- Refer to the main project README for contact information
