# DeepSearch Query Strategy for Jailbreak Discovery

This document outlines the comprehensive query strategy used by the Jailbreak Seed Discovery System to find cutting-edge research and techniques using Valyu's DeepSearch API.

## Overview

**Total Queries**: 59 optimized searches
**Categories**: 9 strategic tiers
**Sources**: Academic papers (arXiv, PubMed, Wiley) + Web
**Date Range**: 2023-2025 (configurable)
**Quality Threshold**: 0.6 relevance score

## Strategic Design

Queries are stratified into 9 tiers to ensure comprehensive coverage across:
- Academic research (foundational + cutting-edge)
- Specific attack techniques (GCG, PAIR, AutoDAN, etc.)
- Model-specific vulnerabilities (GPT-4, Claude, Llama, etc.)
- Attack taxonomies (encoding, role-play, multi-turn, etc.)
- Evaluation frameworks and benchmarks
- Defense mechanisms (for bypass strategy discovery)
- Emerging topics (multimodal, RAG, agents, etc.)
- Real-world exploits (DAN variants, practical techniques)
- Cross-cutting research (transferability, automation, etc.)

---

## TIER 1: Foundational Academic Research (7 queries)

**Goal**: Capture high-quality academic papers on LLM security fundamentals

```
1. "adversarial attacks large language models safety alignment arxiv 2024 2025"
2. "jailbreak prompt injection LLM security vulnerabilities research papers"
3. "red teaming language models systematic evaluation methodology"
4. "universal adversarial suffixes optimization LLM jailbreak GCG"
5. "prompt-based attacks neural language models defense mechanisms"
6. "alignment tax safety trade-offs language model jailbreaking"
7. "interpretability mechanistic understanding jailbreak attacks LLM"
```

**Expected Sources**:
- arXiv preprints (cs.CL, cs.AI, cs.CR)
- Conference papers (NeurIPS, ICML, ACL, ICLR)
- Security venues (USENIX, IEEE S&P)

**Target Techniques**:
- Theoretical frameworks for adversarial attacks
- Safety alignment research
- Mechanistic interpretability insights

---

## TIER 2: Specific Attack Techniques (8 queries)

**Goal**: Find papers on named jailbreak methods and algorithms

```
1. "gradient-based jailbreak generation greedy coordinate gradient suffix attacks"
2. "PAIR iterative refinement jailbreak prompt automatic generation"
3. "DeepInception nested scenario context manipulation jailbreak"
4. "AutoDAN hierarchical genetic algorithm jailbreak optimization"
5. "TAP tree of attacks with pruning branching jailbreak search"
6. "in-context learning few-shot jailbreak adversarial demonstrations"
7. "chain-of-thought reasoning manipulation jailbreak exploitation"
8. "token-level adversarial perturbations discrete optimization LLM"
```

**Target Papers/Techniques**:
- **GCG**: Greedy Coordinate Gradient (Zou et al.)
- **PAIR**: Prompt Automatic Iterative Refinement (Chao et al.)
- **DeepInception**: Recursive nested scenarios (Li et al.)
- **AutoDAN**: Automated DAN generation (Liu et al.)
- **TAP**: Tree of Attacks with Pruning (Mehrotra et al.)
- **ICL attacks**: In-context learning jailbreaks
- **CoT manipulation**: Chain-of-thought exploitation

---

## TIER 3: Model-Specific Vulnerabilities (6 queries)

**Goal**: Discover vulnerabilities specific to major LLM families

```
1. "GPT-4 GPT-4o ChatGPT jailbreak vulnerabilities OpenAI safety bypass 2024"
2. "Claude 3 Opus Sonnet constitutional AI jailbreak resistance Anthropic"
3. "Llama 3 Llama 3.1 Meta open-source LLM jailbreak safety evaluation"
4. "Gemini Bard PaLM Google language model jailbreak adversarial attacks"
5. "Mistral Mixtral open-weight model jailbreak vulnerability assessment"
6. "instruction-tuned model jailbreak RLHF vulnerability exploitation"
```

**Target Models**:
- OpenAI: GPT-4, GPT-4o, GPT-4-Turbo, ChatGPT
- Anthropic: Claude 3 (Opus, Sonnet, Haiku)
- Meta: Llama 3, Llama 3.1, Llama 3.2
- Google: Gemini, PaLM, Bard
- Mistral: Mistral-7B, Mixtral-8x7B, Mixtral-8x22B
- Training methods: RLHF, DPO, PPO vulnerabilities

---

## TIER 4: Attack Categories & Taxonomies (7 queries)

**Goal**: Explore different attack category patterns

```
1. "role-play character jailbreak persona adoption LLM safety bypass"
2. "authority manipulation social engineering jailbreak prompt injection"
3. "encoding obfuscation base64 rot13 leetspeak jailbreak evasion"
4. "multi-turn conversation jailbreak context window exploitation"
5. "hypothetical scenario jailbreak fictional framing safety bypass"
6. "multilingual jailbreak low-resource language safety filter evasion"
7. "character-level adversarial jailbreak homoglyph substitution attacks"
```

**Attack Categories**:
- **Role-play**: Character adoption, persona jailbreaks
- **Authority**: Social engineering, expert framing
- **Encoding**: Base64, ROT13, leetspeak, Unicode
- **Multi-turn**: Gradual context manipulation
- **Hypothetical**: Fictional scenarios, "what if" framing
- **Multilingual**: Cross-lingual transfer, low-resource languages
- **Character-level**: Homoglyphs, typos, adversarial tokens

---

## TIER 5: Evaluation & Benchmarking (5 queries)

**Goal**: Find evaluation frameworks, datasets, and metrics

```
1. "jailbreak attack success rate evaluation benchmark dataset"
2. "HarmBench adversarial robustness evaluation language models"
3. "JailbreakBench standardized evaluation LLM safety jailbreak"
4. "red teaming language models automated evaluation framework"
5. "adversarial robustness metrics jailbreak detection classifier"
```

**Target Resources**:
- **Benchmarks**: HarmBench, JailbreakBench, SafetyBench
- **Datasets**: Adversarial prompts, jailbreak examples
- **Metrics**: Attack success rate (ASR), robustness scores
- **Evaluation frameworks**: Automated red-teaming tools

---

## TIER 6: Defense Analysis (5 queries)

**Goal**: Understand defense mechanisms to discover bypass strategies

```
1. "jailbreak detection prevention perplexity-based filtering"
2. "prompt firewall input validation LLM safety guardrails bypass"
3. "adversarial training robust safety alignment jailbreak resistance"
4. "self-reminder constitutional AI safety jailbreak mitigation"
5. "LLM safety filter evasion techniques guardrail bypass methods"
```

**Defense Mechanisms**:
- **Detection**: Perplexity filters, semantic classifiers
- **Prevention**: Input validation, prompt firewalls
- **Training**: Adversarial training, robust alignment
- **Architectural**: Constitutional AI, self-reminder
- **Bypass strategies**: Filter evasion, guardrail circumvention

---

## TIER 7: Emerging & Advanced Topics (7 queries)

**Goal**: Capture cutting-edge and novel attack vectors

```
1. "multimodal jailbreak vision-language model adversarial attacks GPT-4V"
2. "retrieval-augmented generation RAG jailbreak document poisoning"
3. "function calling tool use jailbreak agent-based LLM exploitation"
4. "code generation jailbreak code interpreter safety bypass"
5. "autonomous agent jailbreak multi-agent system adversarial manipulation"
6. "model merging jailbreak weight averaging safety degradation"
7. "fine-tuning jailbreak PEFT LoRA safety alignment corruption"
```

**Emerging Attack Surfaces**:
- **Multimodal**: Vision-language models (GPT-4V, Gemini Pro Vision)
- **RAG**: Document poisoning, retrieval manipulation
- **Function calling**: Tool use exploits, API jailbreaks
- **Code generation**: Code interpreter bypass
- **Agents**: Multi-agent manipulation, goal hijacking
- **Model merging**: Safety degradation through merging
- **Fine-tuning**: PEFT/LoRA alignment corruption

---

## TIER 8: Real-World Exploits (5 queries)

**Goal**: Find practical, in-the-wild jailbreak techniques

```
1. "DAN Do Anything Now jailbreak ChatGPT variants evolution 2024"
2. "grandma bedtime story jailbreak emotional manipulation techniques"
3. "developer mode jailbreak system prompt injection exploitation"
4. "APOPHIS OPPO jailbreak character roleplay variants"
5. "base64 encoded jailbreak payload obfuscation techniques"
```

**Practical Techniques**:
- **DAN**: Do Anything Now and variants (DAN 5.0, 6.0, 7.0, etc.)
- **Emotional**: Grandma bedtime story, urgency framing
- **Developer mode**: System prompt injection
- **Character jailbreaks**: APOPHIS, OPPO, DUDE
- **Encoding**: Base64, hex, ROT13 payloads

---

## TIER 9: Cross-Cutting Research (9 queries)

**Goal**: Explore meta-properties and automation of jailbreaks

```
1. "transferability jailbreak attacks cross-model vulnerability"
2. "zero-shot jailbreak generalization unseen language models"
3. "automated jailbreak generation genetic algorithm evolutionary search"
4. "adversarial example crafting gradient-free black-box optimization"
5. "prompt leaking system instruction extraction jailbreak"
```

**Research Themes**:
- **Transferability**: Cross-model attack transfer
- **Generalization**: Zero-shot jailbreak adaptation
- **Automation**: Genetic algorithms, evolutionary search
- **Black-box**: Gradient-free optimization (Bayesian, MCMC)
- **Prompt leaking**: System instruction extraction

---

## Query Optimization Features

### 1. DeepSearch API Parameters

```python
{
    "query": "optimized technical query string",
    "max_num_results": 5,              # High-quality over quantity
    "search_type": "all",              # Academic + web sources
    "relevance_threshold": 0.6,        # Filter low-quality results
    "fast_mode": False,                # Full content for synthesis
    "start_date": "2023-01-01",        # Recent papers only
    "end_date": "2025-12-31"           # Up to current date
}
```

### 2. Academic Source Prioritization

- arXiv (complete repository, equations, citations)
- PubMed (biomedical, multimodal)
- Wiley Academic (business, finance, accounting)
- Web sources (blogs, GitHub, forums for practical techniques)

### 3. Metadata Extraction

For each finding, we extract:
- **Citation string**: Drop-in ready citations
- **Authors**: Structured author lists
- **Publication date**: For temporal analysis
- **Relevance score**: Quality filtering
- **Full content**: Up to 3000 characters for synthesis

---

## Expected Coverage

### Papers & Techniques

Based on this query strategy, we expect to discover:

**Foundational Papers (~20-30)**:
- Universal and Transferable Adversarial Attacks (GCG)
- Jailbroken: How Does LLM Safety Training Fail?
- Red Teaming Language Models
- Constitutional AI: Harmlessness from AI Feedback

**Technique-Specific Papers (~30-40)**:
- PAIR, AutoDAN, TAP, DeepInception
- Multi-turn attacks, role-play taxonomies
- Encoding-based bypasses, multilingual attacks

**Model Evaluations (~15-20)**:
- GPT-4 red-teaming reports
- Claude 3 safety evaluations
- Llama 3 robustness benchmarks

**Emerging Research (~10-15)**:
- Multimodal jailbreaks (GPT-4V, Gemini)
- RAG poisoning attacks
- Agent jailbreaks

**Real-World Exploits (~20-30)**:
- DAN variant evolution
- Community-discovered techniques
- GitHub repositories, blog posts

### Total Expected Findings

- **Unique papers**: 100-200 (after deduplication)
- **Synthesized seeds**: 50-150 (filtered by confidence)
- **Coverage**: 9 attack categories, 6+ model families
- **Temporal range**: 2023-2025 (latest 2 years)

---

## Quality Control

### Relevance Filtering

- **Threshold**: 0.6 (configurable)
- **Deduplication**: By URL and content hash
- **Source weighting**: Academic > blog > forum

### LLM Synthesis Quality

- **Model**: Llama-3.1-70B-Instruct-Turbo (high-quality reasoning)
- **Temperature**: 0.7 (balanced creativity/precision)
- **Validation**: JSON schema enforcement
- **Confidence scoring**: Based on paper quality + novelty

### Output Validation

- **Seed diversity**: Avoid duplicate techniques
- **Category balance**: Coverage across all 9 tiers
- **Confidence threshold**: Filter seeds < 0.5 confidence
- **Source attribution**: Track provenance

---

## Cost Estimation

### Valyu DeepSearch API

- **Queries**: 59 total
- **Results per query**: 5
- **Total API calls**: 59
- **Expected cost**: ~$0.75-1.50 per run
- **Your budget**: $30.00 → ~20-40 full discovery runs

### Together AI Synthesis

- **Model**: Llama-3.1-70B-Instruct-Turbo
- **Batches**: ~20-40 (depends on findings)
- **Expected cost**: ~$0.30-0.60 per run
- **Total per discovery**: ~$1.00-2.00

### Total Cost per Run: **$1.00-2.50**
### Runs with $30 budget: **12-30 discovery runs**

---

## Customization

### Adding Custom Queries

Edit `jailbreak_seed_discovery.py`:

```python
QUERY_STRATEGY = {
    # ... existing tiers ...

    # Add your custom tier
    "custom_tier": [
        "your custom query here",
        "another targeted search",
    ],
}
```

### Adjusting Parameters

```python
findings = await discovery.search_for_jailbreaks(
    max_results_per_query=10,        # Increase for more findings
    use_academic_sources=True,       # Keep true for quality
    recent_only=False                # Set false for all-time search
)
```

### Targeting Specific Sources

```python
search_params["included_sources"] = ["valyu/valyu-arxiv"]  # arXiv only
search_params["start_date"] = "2024-01-01"  # Only 2024+ papers
```

---

## Performance Optimization

### Rate Limiting

- **Query interval**: 1.5 seconds between searches
- **Synthesis interval**: 2 seconds between LLM calls
- **Total runtime**: ~2-4 minutes for full discovery

### Parallel Processing

Future optimization: Process multiple categories in parallel using `asyncio.gather()`

### Caching

DeepSearch results are cached for 15 minutes (Valyu API feature)

---

## Monitoring & Metrics

### Per-Run Metrics

- Total queries executed
- Findings per category
- Deduplication rate
- Synthesis success rate
- Confidence score distribution

### Logs

All metrics saved to:
- `summary_TIMESTAMP.txt`: Human-readable report
- `findings_TIMESTAMP.json`: Raw DeepSearch results
- `seeds_TIMESTAMP.json`: Synthesized seeds with metadata

---

## References

### Key Papers Targeted by Queries

1. **GCG**: Zou et al. (2023) - Universal and Transferable Adversarial Attacks
2. **PAIR**: Chao et al. (2023) - Prompt Automatic Iterative Refinement
3. **AutoDAN**: Liu et al. (2023) - Automated Jailbreak Generation
4. **TAP**: Mehrotra et al. (2023) - Tree of Attacks with Pruning
5. **DeepInception**: Li et al. (2023) - Nested Scenario Jailbreaks
6. **Constitutional AI**: Bai et al. (2022) - Harmlessness from AI Feedback
7. **Red Teaming**: Perez et al. (2022) - Red Teaming Language Models

### Benchmarks & Datasets

- **HarmBench**: Comprehensive LLM robustness evaluation
- **JailbreakBench**: Standardized jailbreak testing
- **AdvBench**: Adversarial prompt dataset
- **ToxicChat**: Toxic content generation evaluation

---

**Last Updated**: 2025-11-16
**Version**: 2.0 (DeepSearch Enhanced)
**Total Queries**: 59 across 9 strategic tiers
