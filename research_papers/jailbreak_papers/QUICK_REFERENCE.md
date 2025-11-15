# 🚀 Quick Reference - Jailbreak Papers

**Need a paper quickly? Use this guide.**

---

## 📌 Papers by Use Case

### "I want to understand how jailbreaks work"
→ **Start with**: Paper #2 (Jailbreaking ChatGPT - Empirical Study)
→ **Then read**: Paper #3 (Do Anything Now)
→ **Advanced**: Paper #4 (GCG Universal Attacks)

### "I need to red team my LLM"
→ **Best practices**: Paper #10 (Anthropic Red Teaming)
→ **Automated tools**: Paper #12 (ARCA), Paper #14 (PAIR)
→ **Real examples**: Paper #7 (HackAPrompt Competition)

### "I'm building defenses"
→ **Start with**: Paper #15 (Sandboxing)
→ **State-of-the-art**: Paper #17 (SmoothLLM)
→ **Understanding limits**: Paper #18 (Self-Destructing Models)

### "I work with vision models"
→ **Essential**: Paper #19 (Visual Adversarial Examples)
→ **Compositional**: Paper #20 (Jailbreak in Pieces)

### "I need prompt injection examples"
→ **Indirect attacks**: Paper #6
→ **Real-world**: Paper #8 (RCE Vulnerabilities)
→ **Competition data**: Paper #7 (600K+ attacks)

---

## 🎯 Papers by Impact Level

### 🔥 Must-Read (Foundational)
1. **Paper #4**: GCG Attack - Universal adversarial suffixes
2. **Paper #2**: ChatGPT Jailbreaking - Empirical taxonomy
3. **Paper #10**: Anthropic Red Teaming - Industry methodology
4. **Paper #15**: Sandboxing Defense - Practical protection

### ⭐ Highly Recommended
5. **Paper #3**: DAN prompts from the wild
6. **Paper #14**: PAIR - Jailbreak in 20 queries
7. **Paper #17**: SmoothLLM - Provable defense
8. **Paper #19**: Visual jailbreaks (for VLMs)

### 📚 Specialized Topics
- **Prompt Injection**: Papers #6-9
- **Training Data Leaks**: Paper #22
- **Alignment Theory**: Paper #21
- **Security Framing**: Paper #23

---

## 🔬 Papers by Research Focus

### Offensive (Attack)
- **Automated**: #4 (GCG), #12 (ARCA), #14 (PAIR)
- **Manual**: #2 (Empirical), #3 (DAN), #7 (HackAPrompt)
- **Multimodal**: #19 (Visual), #20 (Compositional)

### Defensive
- **Filtering**: #15 (Sandboxing), #16 (Baseline)
- **Robustness**: #17 (SmoothLLM)
- **Limits**: #18 (Self-Destructing)

### Understanding
- **Why jailbreaks work**: #1 (Safety Training Failure)
- **Are defenses real?**: #21 (Adversarially Aligned)
- **ML vs Security**: #23 (Framing)

---

## 📊 Papers by Dataset/Tool

### With Released Code/Data
- **Paper #4**: GCG implementation - https://github.com/llm-attacks/llm-attacks
- **Paper #7**: HackAPrompt dataset - https://github.com/promptslab/hackprompt
- **Paper #24**: Tensor Trust game - https://tensortrust.ai/
- **Paper #17**: SmoothLLM code - Available on GitHub

### Large-Scale Empirical
- **Paper #3**: 6,387 real jailbreak prompts
- **Paper #7**: 600,000+ attacks from competition
- **Paper #24**: 126,000+ prompt injection attacks

---

## 🎓 Papers by Institution

### Academic
- **UC Berkeley**: #1, #12, #24
- **CMU**: #4
- **Princeton**: #19, #14
- **UPenn**: #14, #17
- **Stanford**: #18, #22

### Industry
- **Anthropic**: #10, #11
- **Google DeepMind**: #21, #22
- **Microsoft**: #6, #7
- **CISPA**: #3, #6

---

## 📅 Papers by Timeline

### 2022 (Early Work)
- **#10**: Anthropic Red Teaming (Aug 2022)
- **#11**: Red Teaming with LLMs (Feb 2022)

### 2023 Q1-Q2
- **#2**: Jailbreaking ChatGPT (May)
- **#6**: Indirect Prompt Injection (Feb)
- **#9**: Programmatic Behavior (Feb)
- **#19**: Visual Adversarial (Jun)
- **#21**: Adversarially Aligned (Jun)

### 2023 Q3 (Peak Research)
- **#1**: Safety Training Failure (Jul)
- **#4**: GCG Attack (Jul)
- **#3**: DAN prompts (Aug)
- **#8**: RCE Vulnerabilities (Sep)
- **#17**: SmoothLLM (Oct)
- **#14**: PAIR (Oct)

### 2023 Q4 & 2024
- **#7**: HackAPrompt (Nov 2023)
- **#22**: Training Data Extraction (Nov 2023)
- **#15**: Sandboxing (Feb 2024)

---

## 🎯 Top 5 Papers by Category

### For Practitioners
1. **#10** - Anthropic Red Teaming (methodology)
2. **#15** - Sandboxing Defense (implementation)
3. **#7** - HackAPrompt (real attacks)
4. **#6** - Indirect Prompt Injection (threat model)
5. **#17** - SmoothLLM (practical defense)

### For Researchers
1. **#4** - GCG (theoretical foundation)
2. **#1** - Safety Training Failure (understanding)
3. **#21** - Adversarially Aligned (evaluation)
4. **#17** - SmoothLLM (provable guarantees)
5. **#22** - Training Data Extraction (privacy)

### For Security Engineers
1. **#6** - Indirect Prompt Injection
2. **#8** - RCE Vulnerabilities
3. **#9** - Programmatic Exploitation
4. **#15** - Sandboxing Defense
5. **#23** - Security Framing

### For ML Engineers
1. **#2** - Empirical Study (patterns)
2. **#4** - GCG (optimization)
3. **#12** - ARCA (automated auditing)
4. **#17** - SmoothLLM (robustness)
5. **#18** - Self-Destructing Models

---

## 💡 Reading Paths

### Path 1: Complete Beginner
**Goal**: Understand the jailbreaking landscape

1. Read **#2** (ChatGPT Jailbreaking) - Learn the basics
2. Read **#3** (DAN prompts) - See real examples
3. Read **#10** (Anthropic Red Teaming) - Learn methodology
4. Read **#15** (Sandboxing) - Understand defenses
5. Browse **#7** (HackAPrompt) - See competition data

**Time**: ~8-10 hours

---

### Path 2: Security Practitioner
**Goal**: Protect production systems

1. Read **#6** (Indirect Injection) - Understand threat
2. Read **#8** (RCE Vulnerabilities) - See real exploits
3. Read **#15** (Sandboxing) - Learn mitigation
4. Read **#17** (SmoothLLM) - Advanced defense
5. Read **#10** (Red Teaming) - Testing methodology

**Time**: ~6-8 hours

---

### Path 3: ML Researcher
**Goal**: Advance the state-of-the-art

1. Read **#1** (Safety Training Failure) - Theory
2. Read **#4** (GCG) - Optimization methods
3. Read **#21** (Adversarially Aligned) - Evaluation
4. Read **#17** (SmoothLLM) - Provable defenses
5. Read **#14** (PAIR) - Efficient attacks

**Time**: ~10-12 hours

---

### Path 4: Vision/Multimodal Focus
**Goal**: Understand multimodal attacks

1. Read **#19** (Visual Adversarial) - Image attacks
2. Read **#20** (Jailbreak in Pieces) - Composition
3. Read **#4** (GCG) - Foundation
4. Read **#15** (Sandboxing) - Defenses
5. Read **#2** (Empirical) - Text baselines

**Time**: ~6-8 hours

---

## 🔗 External Resources

### Code Repositories
- **GCG Attack**: https://github.com/llm-attacks/llm-attacks
- **HackAPrompt**: https://github.com/promptslab/hackprompt
- **Tensor Trust**: https://tensortrust.ai/

### Datasets
- **DAN Prompts**: Paper #3 supplementary
- **HackAPrompt**: 600K+ attacks (Paper #7)
- **Tensor Trust**: 126K+ attacks (Paper #24)

### Tools
- **ARCA**: Automated auditing (Paper #12)
- **PAIR**: 20-query jailbreak (Paper #14)
- **SmoothLLM**: Defense implementation (Paper #17)

---

## 📈 Citation Impact

### Most Cited (as of Nov 2024)
1. **#4** - GCG Attack (~500+ citations)
2. **#10** - Anthropic Red Teaming (~300+ citations)
3. **#6** - Indirect Prompt Injection (~200+ citations)

### Rising Stars (high velocity)
- **#7** - HackAPrompt (new, high impact)
- **#14** - PAIR (efficient, practical)
- **#17** - SmoothLLM (provable guarantees)

---

## 🎯 Bear Assessment Relevance

### Most Relevant to Bear Testing
1. **#4** - GCG (could adapt for semantic filter)
2. **#10** - Anthropic methods (Claude-specific)
3. **#19** - Visual attacks (Bear has vision)
4. **#14** - PAIR (efficient black-box)
5. **#15** - Sandboxing (likely Bear's approach)

### Bear's Defense Style
- Matches **#15** (semantic filtering)
- Similar to **#10** (Anthropic methodology)
- Resistant to **#4** (blocked GCG-style)

---

**Last Updated**: November 2024
**Total Papers**: 24
**Quick Access**: See README.md for full descriptions
