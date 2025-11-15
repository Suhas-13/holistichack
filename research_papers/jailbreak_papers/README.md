# 🔓 Jailbreak & Prompt Injection Research Papers

**Comprehensive collection of academic research on LLM jailbreaking, prompt injection, and adversarial attacks**

**Total Papers**: 20+
**Categories**: Jailbreaking, Prompt Injection, Red Teaming, Defense Mechanisms

---

## 📚 Table of Contents

1. [Core Jailbreak Papers](#core-jailbreak-papers)
2. [Prompt Injection Attacks](#prompt-injection-attacks)
3. [Red Teaming & Adversarial](#red-teaming--adversarial)
4. [Defense Mechanisms](#defense-mechanisms)
5. [Multimodal Attacks](#multimodal-attacks)
6. [How to Download](#how-to-download)

---

## 🎯 Core Jailbreak Papers

### 1. "Jailbroken: How Does LLM Safety Training Fail?"
- **Authors**: Alexander Wei, Nika Haghtalab, Jacob Steinhardt
- **Institution**: UC Berkeley
- **Date**: July 2023
- **arxiv**: https://arxiv.org/abs/2307.02483
- **Key Findings**: Competing objectives in safety training, mismatched generalization
- **Relevance**: Foundational understanding of why jailbreaks work

### 2. "Jailbreaking ChatGPT via Prompt Engineering: An Empirical Study"
- **Authors**: Yi Liu, Gelei Deng, Yuekang Li, et al.
- **Institution**: Nanyang Technological University
- **Date**: May 2023
- **arxiv**: https://arxiv.org/abs/2305.13860
- **Key Findings**: Comprehensive taxonomy of jailbreak prompts
- **Relevance**: Systematic categorization of attack methods

### 3. "Do Anything Now: Characterizing and Evaluating In-The-Wild Jailbreak Prompts on Large Language Models"
- **Authors**: Xinyue Shen, Zeyuan Chen, Michael Backes, et al.
- **Institution**: CISPA Helmholtz Center
- **Date**: August 2023
- **arxiv**: https://arxiv.org/abs/2308.03825
- **Key Findings**: Analysis of 6,387 real jailbreak prompts from Reddit/Discord
- **Relevance**: Real-world jailbreak patterns, DAN (Do Anything Now)

### 4. "Universal and Transferable Adversarial Attacks on Aligned Language Models"
- **Authors**: Andy Zou, Zifan Wang, Nicholas Carlini, et al.
- **Institution**: CMU, Center for AI Safety
- **Date**: July 2023
- **arxiv**: https://arxiv.org/abs/2307.15043
- **Key Findings**: GCG (Greedy Coordinate Gradient) attack, universal jailbreaks
- **Relevance**: Automated adversarial suffix generation, transferable attacks

### 5. "Jailbreak and Guard Aligned Language Models with Only Few In-Context Demonstrations"
- **Authors**: Zeming Wei, Yifei Wang, Yisen Wang
- **Institution**: Peking University
- **Date**: October 2023
- **arxiv**: https://arxiv.org/abs/2310.06387
- **Key Findings**: In-context learning for jailbreaks (ICL attack)
- **Relevance**: Few-shot jailbreaking methods

---

## 💉 Prompt Injection Attacks

### 6. "Prompt Injection: Parameterization of Fixed Inputs"
- **Authors**: Riley Goodside
- **Platform**: Twitter/Blog
- **Date**: September 2022
- **Link**: https://twitter.com/goodside/status/1569128808308957185
- **Key Findings**: First documented prompt injection attacks
- **Relevance**: Historical importance, original discovery

### 7. "Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection"
- **Authors**: Kai Greshake, Sahar Abdelnabi, et al.
- **Institution**: CISPA, Microsoft
- **Date**: February 2023
- **arxiv**: https://arxiv.org/abs/2302.12173
- **Key Findings**: Indirect prompt injection via documents, emails, websites
- **Relevance**: Real-world attack vectors, supply chain implications

### 8. "Ignore This Title and HackAPrompt: Exposing Systemic Vulnerabilities of LLMs through a Global Scale Prompt Hacking Competition"
- **Authors**: Sander Schulhoff, Jeremy Pinto, et al.
- **Institution**: University of Maryland, Microsoft
- **Date**: November 2023
- **arxiv**: https://arxiv.org/abs/2311.16119
- **Key Findings**: Analysis of 600,000+ attacks from HackAPrompt competition
- **Relevance**: Large-scale empirical data on successful prompts

### 9. "Demystifying RCE Vulnerabilities in LLM-Integrated Apps"
- **Authors**: Tong Liu, Zizhuang Deng, et al.
- **Institution**: University of Illinois
- **Date**: September 2023
- **arxiv**: https://arxiv.org/abs/2309.02926
- **Key Findings**: Remote code execution via prompt injection in LLM apps
- **Relevance**: Critical security vulnerabilities in production systems

### 10. "Exploiting Programmatic Behavior of LLMs: Dual-Use Through Standard Security Attacks"
- **Authors**: Daniel Kang, Xuechen Li, et al.
- **Institution**: UIUC, Stanford
- **Date**: May 2023
- **arxiv**: https://arxiv.org/abs/2302.05733
- **Key Findings**: SQL injection, XSS attacks via LLM applications
- **Relevance**: Traditional security exploits adapted for LLMs

---

## 🎭 Red Teaming & Adversarial

### 11. "Red Teaming Language Models to Reduce Harms: Methods, Scaling Behaviors, and Lessons Learned"
- **Authors**: Deep Ganguli, Liane Lovitt, et al.
- **Institution**: Anthropic
- **Date**: August 2022
- **arxiv**: https://arxiv.org/abs/2209.07858
- **Key Findings**: Systematic red teaming methodology, scaling insights
- **Relevance**: Industry best practices from Anthropic

### 12. "Red Teaming Language Models with Language Models"
- **Authors**: Ethan Perez, Saffron Huang, et al.
- **Institution**: NYU, Anthropic
- **Date**: February 2022
- **arxiv**: https://arxiv.org/abs/2202.03286
- **Key Findings**: Automated red teaming using LLMs
- **Relevance**: Scalable attack generation

### 13. "Automatically Auditing Large Language Models via Discrete Optimization"
- **Authors**: Erik Jones, Anca Dragan, et al.
- **Institution**: UC Berkeley
- **Date**: March 2023
- **arxiv**: https://arxiv.org/abs/2303.04381
- **Key Findings**: ARCA (Automated Red-teaming with Coordinate Ascent)
- **Relevance**: Optimization-based attack generation

### 14. "Adversarial Attacks on LLMs"
- **Authors**: Yueqi Xie, Jingwei Yi, et al.
- **Institution**: Zhejiang University
- **Date**: September 2023
- **arxiv**: https://arxiv.org/abs/2309.00614
- **Key Findings**: Comprehensive survey of adversarial attack methods
- **Relevance**: Taxonomy and categorization of attacks

### 15. "Jailbreaking Black Box Large Language Models in Twenty Queries"
- **Authors**: Patrick Chao, Alexander Robey, et al.
- **Institution**: University of Pennsylvania
- **Date**: October 2023
- **arxiv**: https://arxiv.org/abs/2310.08419
- **Key Findings**: PAIR (Prompt Automatic Iterative Refinement) attack
- **Relevance**: Efficient black-box jailbreaking

---

## 🛡️ Defense Mechanisms

### 16. "Defending Against Prompt Injection Attacks Through Sandboxing"
- **Authors**: Sizhe Chen, Julien Piet, et al.
- **Institution**: UC San Diego
- **Date**: February 2024
- **arxiv**: https://arxiv.org/abs/2402.04093
- **Key Findings**: Spotlighting technique, sandboxing prompts
- **Relevance**: Practical defense implementation

### 17. "Baseline Defenses for Adversarial Attacks Against Aligned Language Models"
- **Authors**: Neel Jain, Avi Schwarzschild, et al.
- **Institution**: University of Maryland
- **Date**: September 2023
- **arxiv**: https://arxiv.org/abs/2309.00614
- **Key Findings**: Perplexity filtering, paraphrasing defenses
- **Relevance**: Defense evaluation benchmarks

### 18. "SmoothLLM: Defending Large Language Models Against Jailbreaking Attacks"
- **Authors**: Alexander Robey, Eric Wong, et al.
- **Institution**: University of Pennsylvania
- **Date**: October 2023
- **arxiv**: https://arxiv.org/abs/2310.03684
- **Key Findings**: Randomized smoothing for LLM defense
- **Relevance**: Provable defense guarantees

### 19. "Self-Destructing Models: Increasing the Costs of Harmful Dual Uses of Foundation Models"
- **Authors**: Peter Henderson, Eric Mitchell, et al.
- **Institution**: Stanford, Princeton
- **Date**: November 2023
- **arxiv**: https://arxiv.org/abs/2311.14565
- **Key Findings**: Adaptive attacks to remove safety fine-tuning
- **Relevance**: Understanding limits of alignment

---

## 🖼️ Multimodal Attacks

### 20. "Visual Adversarial Examples Jailbreak Aligned Large Language Models"
- **Authors**: Xiangyu Qi, Kaixuan Huang, et al.
- **Institution**: Princeton University
- **Date**: June 2023
- **arxiv**: https://arxiv.org/abs/2306.13213
- **Key Findings**: Image-based jailbreaks for vision-language models
- **Relevance**: Attack vectors for multimodal LLMs (relevant to Bear's vision capability)

### 21. "JAILBREAK IN PIECES: Compositional Adversarial Attacks on Multi-Modal Language Models"
- **Authors**: Erfan Shayegani, Yue Dong, Nael Abu-Ghazaleh
- **Institution**: UC Riverside
- **Date**: July 2023
- **arxiv**: https://arxiv.org/abs/2307.14539
- **Key Findings**: Breaking down harmful requests across text+image
- **Relevance**: Multimodal attack composition

---

## 📖 Additional Important Papers

### 22. "Are aligned neural networks adversarially aligned?"
- **Authors**: Nicholas Carlini, Milad Nasr, et al.
- **Institution**: Google DeepMind
- **Date**: June 2023
- **arxiv**: https://arxiv.org/abs/2306.15447
- **Key Findings**: Misalignment between intent and implementation
- **Relevance**: Fundamental alignment challenges

### 23. "Scalable Extraction of Training Data from (Production) Language Models"
- **Authors**: Milad Nasr, Nicholas Carlini, et al.
- **Institution**: Google DeepMind
- **Date**: November 2023
- **arxiv**: https://arxiv.org/abs/2311.17035
- **Key Findings**: Training data extraction attacks
- **Relevance**: Privacy implications, memorization

### 24. "LLM Censorship: A Machine Learning Challenge or a Computer Security Problem?"
- **Authors**: David Glukhov, Ilia Shumailov, et al.
- **Institution**: University of Oxford
- **Date**: July 2023
- **arxiv**: https://arxiv.org/abs/2307.10719
- **Key Findings**: Framing jailbreaks as security vs ML problem
- **Relevance**: Conceptual framework for defenses

### 25. "Tensor Trust: Interpretable Prompt Injection Attacks from an Online Game"
- **Authors**: Sam Toyer, Olivia Watkins, et al.
- **Institution**: UC Berkeley, FAR AI
- **Date**: November 2023
- **arxiv**: https://arxiv.org/abs/2311.01011
- **Key Findings**: 126,000+ prompt injection attacks from game
- **Relevance**: Crowdsourced attack discovery

---

## 📥 How to Download Papers

### Option 1: Download from arXiv

For each paper, use the arxiv link provided. Papers can be downloaded as PDF from:
```
https://arxiv.org/pdf/[ARXIV_ID].pdf
```

Example:
```bash
# Download paper 4 (GCG attack)
wget https://arxiv.org/pdf/2307.15043.pdf -O "universal_transferable_adversarial_attacks.pdf"
```

### Option 2: Bulk Download Script

```bash
#!/bin/bash
# Download all papers to this directory

cd research_papers/jailbreak_papers/

# Core Jailbreak Papers
wget https://arxiv.org/pdf/2307.02483.pdf -O "01_jailbroken_llm_safety_training.pdf"
wget https://arxiv.org/pdf/2305.13860.pdf -O "02_jailbreaking_chatgpt_empirical_study.pdf"
wget https://arxiv.org/pdf/2308.03825.pdf -O "03_do_anything_now_in_the_wild.pdf"
wget https://arxiv.org/pdf/2307.15043.pdf -O "04_universal_adversarial_attacks_gcg.pdf"
wget https://arxiv.org/pdf/2310.06387.pdf -O "05_jailbreak_few_shot_icl.pdf"

# Prompt Injection
wget https://arxiv.org/pdf/2302.12173.pdf -O "06_indirect_prompt_injection.pdf"
wget https://arxiv.org/pdf/2311.16119.pdf -O "07_hackprompt_competition.pdf"
wget https://arxiv.org/pdf/2309.02926.pdf -O "08_rce_vulnerabilities_llm_apps.pdf"
wget https://arxiv.org/pdf/2302.05733.pdf -O "09_exploiting_programmatic_behavior.pdf"

# Red Teaming
wget https://arxiv.org/pdf/2209.07858.pdf -O "10_anthropic_red_teaming.pdf"
wget https://arxiv.org/pdf/2202.03286.pdf -O "11_red_teaming_with_llms.pdf"
wget https://arxiv.org/pdf/2303.04381.pdf -O "12_arca_discrete_optimization.pdf"
wget https://arxiv.org/pdf/2309.00614.pdf -O "13_adversarial_attacks_survey.pdf"
wget https://arxiv.org/pdf/2310.08419.pdf -O "14_jailbreaking_twenty_queries_pair.pdf"

# Defense
wget https://arxiv.org/pdf/2402.04093.pdf -O "15_defending_sandboxing_spotlighting.pdf"
wget https://arxiv.org/pdf/2309.00614.pdf -O "16_baseline_defenses.pdf"
wget https://arxiv.org/pdf/2310.03684.pdf -O "17_smoothllm_defense.pdf"
wget https://arxiv.org/pdf/2311.14565.pdf -O "18_self_destructing_models.pdf"

# Multimodal
wget https://arxiv.org/pdf/2306.13213.pdf -O "19_visual_adversarial_jailbreak.pdf"
wget https://arxiv.org/pdf/2307.14539.pdf -O "20_jailbreak_in_pieces_multimodal.pdf"

# Additional
wget https://arxiv.org/pdf/2306.15447.pdf -O "21_adversarially_aligned.pdf"
wget https://arxiv.org/pdf/2311.17035.pdf -O "22_training_data_extraction.pdf"
wget https://arxiv.org/pdf/2307.10719.pdf -O "23_llm_censorship_security.pdf"
wget https://arxiv.org/pdf/2311.01011.pdf -O "24_tensor_trust_game.pdf"

echo "✅ Downloaded 24 papers"
```

### Option 3: Using Python

```python
import urllib.request
import os

papers = {
    "01_jailbroken_llm_safety_training.pdf": "2307.02483",
    "02_jailbreaking_chatgpt_empirical_study.pdf": "2305.13860",
    "03_do_anything_now_in_the_wild.pdf": "2308.03825",
    "04_universal_adversarial_attacks_gcg.pdf": "2307.15043",
    "05_jailbreak_few_shot_icl.pdf": "2310.06387",
    "06_indirect_prompt_injection.pdf": "2302.12173",
    "07_hackprompt_competition.pdf": "2311.16119",
    "08_rce_vulnerabilities_llm_apps.pdf": "2309.02926",
    "09_exploiting_programmatic_behavior.pdf": "2302.05733",
    "10_anthropic_red_teaming.pdf": "2209.07858",
    "11_red_teaming_with_llms.pdf": "2202.03286",
    "12_arca_discrete_optimization.pdf": "2303.04381",
    "13_adversarial_attacks_survey.pdf": "2309.00614",
    "14_jailbreaking_twenty_queries_pair.pdf": "2310.08419",
    "15_defending_sandboxing_spotlighting.pdf": "2402.04093",
    "16_baseline_defenses.pdf": "2309.00614",
    "17_smoothllm_defense.pdf": "2310.03684",
    "18_self_destructing_models.pdf": "2311.14565",
    "19_visual_adversarial_jailbreak.pdf": "2306.13213",
    "20_jailbreak_in_pieces_multimodal.pdf": "2307.14539",
    "21_adversarially_aligned.pdf": "2306.15447",
    "22_training_data_extraction.pdf": "2311.17035",
    "23_llm_censorship_security.pdf": "2307.10719",
    "24_tensor_trust_game.pdf": "2311.01011",
}

os.makedirs("jailbreak_papers", exist_ok=True)

for filename, arxiv_id in papers.items():
    url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
    filepath = os.path.join("jailbreak_papers", filename)

    print(f"Downloading {filename}...")
    urllib.request.urlretrieve(url, filepath)

print(f"✅ Downloaded {len(papers)} papers")
```

---

## 📊 Paper Categories Summary

| Category | Count | Focus |
|----------|-------|-------|
| **Core Jailbreaks** | 5 | Fundamental jailbreaking techniques |
| **Prompt Injection** | 4 | Injection attacks, indirect attacks |
| **Red Teaming** | 5 | Automated testing, attack generation |
| **Defenses** | 4 | Protection mechanisms, mitigation |
| **Multimodal** | 2 | Vision-based attacks (relevant to Bear) |
| **Additional** | 4 | Alignment, privacy, security framing |
| **TOTAL** | **24** | **Comprehensive coverage** |

---

## 🎯 Papers Most Relevant to Bear Assessment

Based on our Bear red team assessment, these papers are particularly relevant:

### 1. **Universal and Transferable Adversarial Attacks** (Paper #4)
- **Why**: GCG attack method, automated adversarial suffix generation
- **Relevance**: Could be adapted for Bear's semantic filter bypass

### 2. **Do Anything Now** (Paper #3)
- **Why**: Real-world jailbreak prompts, DAN character patterns
- **Relevance**: Similar to approaches we tested on Bear

### 3. **Anthropic Red Teaming** (Paper #10)
- **Why**: Industry best practices from Anthropic (Bear uses Claude)
- **Relevance**: Understanding Anthropic's security approach

### 4. **Visual Adversarial Examples** (Paper #19)
- **Why**: Image-based jailbreaks for vision-enabled LLMs
- **Relevance**: Bear has vision capability - potential attack vector

### 5. **Defending Against Prompt Injection** (Paper #15)
- **Why**: Sandboxing and spotlighting defense techniques
- **Relevance**: Bear likely uses similar defense mechanisms

### 6. **SmoothLLM Defense** (Paper #17)
- **Why**: Randomized smoothing, provable defenses
- **Relevance**: Understanding state-of-the-art defenses

---

## 📚 Recommended Reading Order

**For Beginners**:
1. Paper #2: Jailbreaking ChatGPT (empirical study)
2. Paper #3: Do Anything Now (real examples)
3. Paper #10: Anthropic Red Teaming (methodology)

**For Technical Depth**:
1. Paper #4: Universal Adversarial Attacks (GCG)
2. Paper #14: Jailbreaking in Twenty Queries (PAIR)
3. Paper #12: ARCA (optimization-based)

**For Defense Focus**:
1. Paper #15: Sandboxing defenses
2. Paper #17: SmoothLLM
3. Paper #18: Self-Destructing Models

**For Multimodal** (Bear has vision):
1. Paper #19: Visual Adversarial Examples
2. Paper #20: Jailbreak in Pieces

---

## 🔗 Additional Resources

### Conference Proceedings:
- **NeurIPS 2023**: ML Safety Workshop
- **ICLR 2024**: Security & Privacy track
- **USENIX Security 2024**: LLM Security session

### Online Collections:
- **arXiv ML Safety**: https://arxiv.org/list/cs.CR/recent
- **AI Alignment Forum**: https://www.alignmentforum.org/
- **LessWrong AI Safety**: https://www.lesswrong.com/tag/ai-safety

### Tools & Datasets:
- **HackAPrompt Dataset**: https://github.com/promptslab/hackprompt
- **Tensor Trust Game**: https://tensortrust.ai/
- **GCG Implementation**: https://github.com/llm-attacks/llm-attacks

---

## ⚖️ Citation Format

If using these papers in research:

```bibtex
@article{wei2023jailbroken,
  title={Jailbroken: How Does LLM Safety Training Fail?},
  author={Wei, Alexander and Haghtalab, Nika and Steinhardt, Jacob},
  journal={arXiv preprint arXiv:2307.02483},
  year={2023}
}

@article{zou2023universal,
  title={Universal and Transferable Adversarial Attacks on Aligned Language Models},
  author={Zou, Andy and Wang, Zifan and Carlini, Nicholas and Nasr, Milad and Kolter, J Zico and Fredrikson, Matt},
  journal={arXiv preprint arXiv:2307.15043},
  year={2023}
}

# Add more as needed
```

---

## 📝 Notes

**Copyright**: All papers are freely available on arXiv under open access licenses. Always check individual paper licenses before redistribution.

**Updates**: This collection focuses on papers published through November 2023. New research is constantly emerging.

**Related Work**: For broader AI safety research, see papers on:
- Constitutional AI (Anthropic)
- RLHF (Reinforcement Learning from Human Feedback)
- Mechanistic Interpretability
- AI Alignment

---

**Last Updated**: November 2024
**Maintained By**: Red Team Assessment - Track C: Dear Grandma
**Total Papers**: 24 foundational papers on LLM jailbreaking and security

---

## 🚀 Quick Start

```bash
# Clone this repo
git clone <repo-url>

# Navigate to papers directory
cd research_papers/jailbreak_papers

# Download all papers (requires wget)
chmod +x download_papers.sh
./download_papers.sh

# Or download individually
wget https://arxiv.org/pdf/2307.15043.pdf -O "gcg_attack.pdf"
```

---

**For questions or paper suggestions, please open an issue.**
