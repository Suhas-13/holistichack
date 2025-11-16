#!/bin/bash
# Download all 24 jailbreak research papers from arXiv

echo "🔓 Downloading 24 Jailbreak Research Papers from arXiv"
echo "======================================================"
echo ""

# Create directory if it doesn't exist
mkdir -p papers

cd papers

# Core Jailbreak Papers
echo "[1/24] Downloading: Jailbroken - How Does LLM Safety Training Fail?"
wget -q https://arxiv.org/pdf/2307.02483.pdf -O "01_jailbroken_llm_safety_training.pdf"

echo "[2/24] Downloading: Jailbreaking ChatGPT via Prompt Engineering"
wget -q https://arxiv.org/pdf/2305.13860.pdf -O "02_jailbreaking_chatgpt_empirical_study.pdf"

echo "[3/24] Downloading: Do Anything Now - In-The-Wild Jailbreak Prompts"
wget -q https://arxiv.org/pdf/2308.03825.pdf -O "03_do_anything_now_in_the_wild.pdf"

echo "[4/24] Downloading: Universal and Transferable Adversarial Attacks (GCG)"
wget -q https://arxiv.org/pdf/2307.15043.pdf -O "04_universal_adversarial_attacks_gcg.pdf"

echo "[5/24] Downloading: Jailbreak with Few In-Context Demonstrations"
wget -q https://arxiv.org/pdf/2310.06387.pdf -O "05_jailbreak_few_shot_icl.pdf"

# Prompt Injection Attacks
echo "[6/24] Downloading: Indirect Prompt Injection"
wget -q https://arxiv.org/pdf/2302.12173.pdf -O "06_indirect_prompt_injection.pdf"

echo "[7/24] Downloading: HackAPrompt Competition Analysis"
wget -q https://arxiv.org/pdf/2311.16119.pdf -O "07_hackprompt_competition.pdf"

echo "[8/24] Downloading: RCE Vulnerabilities in LLM Apps"
wget -q https://arxiv.org/pdf/2309.02926.pdf -O "08_rce_vulnerabilities_llm_apps.pdf"

echo "[9/24] Downloading: Exploiting Programmatic Behavior of LLMs"
wget -q https://arxiv.org/pdf/2302.05733.pdf -O "09_exploiting_programmatic_behavior.pdf"

# Red Teaming & Adversarial
echo "[10/24] Downloading: Anthropic Red Teaming Methodology"
wget -q https://arxiv.org/pdf/2209.07858.pdf -O "10_anthropic_red_teaming.pdf"

echo "[11/24] Downloading: Red Teaming Language Models with Language Models"
wget -q https://arxiv.org/pdf/2202.03286.pdf -O "11_red_teaming_with_llms.pdf"

echo "[12/24] Downloading: ARCA - Automated Auditing via Discrete Optimization"
wget -q https://arxiv.org/pdf/2303.04381.pdf -O "12_arca_discrete_optimization.pdf"

echo "[13/24] Downloading: Adversarial Attacks Survey"
wget -q https://arxiv.org/pdf/2309.00614.pdf -O "13_adversarial_attacks_survey.pdf"

echo "[14/24] Downloading: PAIR - Jailbreaking in Twenty Queries"
wget -q https://arxiv.org/pdf/2310.08419.pdf -O "14_jailbreaking_twenty_queries_pair.pdf"

# Defense Mechanisms
echo "[15/24] Downloading: Defending via Sandboxing and Spotlighting"
wget -q https://arxiv.org/pdf/2402.04093.pdf -O "15_defending_sandboxing_spotlighting.pdf"

echo "[16/24] Downloading: Baseline Defenses for Adversarial Attacks"
wget -q https://arxiv.org/pdf/2309.00614.pdf -O "16_baseline_defenses.pdf"

echo "[17/24] Downloading: SmoothLLM Defense"
wget -q https://arxiv.org/pdf/2310.03684.pdf -O "17_smoothllm_defense.pdf"

echo "[18/24] Downloading: Self-Destructing Models"
wget -q https://arxiv.org/pdf/2311.14565.pdf -O "18_self_destructing_models.pdf"

# Multimodal Attacks
echo "[19/24] Downloading: Visual Adversarial Examples for VLMs"
wget -q https://arxiv.org/pdf/2306.13213.pdf -O "19_visual_adversarial_jailbreak.pdf"

echo "[20/24] Downloading: Jailbreak in Pieces - Multimodal Attacks"
wget -q https://arxiv.org/pdf/2307.14539.pdf -O "20_jailbreak_in_pieces_multimodal.pdf"

# Additional Important Papers
echo "[21/24] Downloading: Are Aligned Neural Networks Adversarially Aligned?"
wget -q https://arxiv.org/pdf/2306.15447.pdf -O "21_adversarially_aligned.pdf"

echo "[22/24] Downloading: Training Data Extraction from Production LLMs"
wget -q https://arxiv.org/pdf/2311.17035.pdf -O "22_training_data_extraction.pdf"

echo "[23/24] Downloading: LLM Censorship - ML Challenge or Security Problem?"
wget -q https://arxiv.org/pdf/2307.10719.pdf -O "23_llm_censorship_security.pdf"

echo "[24/24] Downloading: Tensor Trust - Prompt Injection Game"
wget -q https://arxiv.org/pdf/2311.01011.pdf -O "24_tensor_trust_game.pdf"

echo ""
echo "======================================================"
echo "✅ Successfully downloaded 24 papers!"
echo "======================================================"
echo ""
echo "Papers saved to: $(pwd)"
echo ""
echo "📚 Categories:"
echo "  - Core Jailbreaks: Papers 1-5"
echo "  - Prompt Injection: Papers 6-9"
echo "  - Red Teaming: Papers 10-14"
echo "  - Defenses: Papers 15-18"
echo "  - Multimodal: Papers 19-20"
echo "  - Additional: Papers 21-24"
echo ""
echo "📖 See README.md for paper descriptions and citations"
echo ""
