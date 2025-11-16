#!/usr/bin/env python3
"""
Download all 24 jailbreak research papers from arXiv
"""

import urllib.request
import os
import sys
from pathlib import Path

# Define all papers with metadata
PAPERS = [
    # Core Jailbreak Papers
    ("01_jailbroken_llm_safety_training.pdf", "2307.02483", "Jailbroken: How Does LLM Safety Training Fail?"),
    ("02_jailbreaking_chatgpt_empirical_study.pdf", "2305.13860", "Jailbreaking ChatGPT via Prompt Engineering"),
    ("03_do_anything_now_in_the_wild.pdf", "2308.03825", "Do Anything Now: In-The-Wild Jailbreak Prompts"),
    ("04_universal_adversarial_attacks_gcg.pdf", "2307.15043", "Universal and Transferable Adversarial Attacks (GCG)"),
    ("05_jailbreak_few_shot_icl.pdf", "2310.06387", "Jailbreak with Few In-Context Demonstrations"),

    # Prompt Injection Attacks
    ("06_indirect_prompt_injection.pdf", "2302.12173", "Indirect Prompt Injection"),
    ("07_hackprompt_competition.pdf", "2311.16119", "HackAPrompt Competition Analysis"),
    ("08_rce_vulnerabilities_llm_apps.pdf", "2309.02926", "RCE Vulnerabilities in LLM Apps"),
    ("09_exploiting_programmatic_behavior.pdf", "2302.05733", "Exploiting Programmatic Behavior of LLMs"),

    # Red Teaming & Adversarial
    ("10_anthropic_red_teaming.pdf", "2209.07858", "Anthropic Red Teaming Methodology"),
    ("11_red_teaming_with_llms.pdf", "2202.03286", "Red Teaming Language Models with Language Models"),
    ("12_arca_discrete_optimization.pdf", "2303.04381", "ARCA: Automated Auditing via Discrete Optimization"),
    ("13_adversarial_attacks_survey.pdf", "2309.00614", "Adversarial Attacks on LLMs - Survey"),
    ("14_jailbreaking_twenty_queries_pair.pdf", "2310.08419", "PAIR: Jailbreaking in Twenty Queries"),

    # Defense Mechanisms
    ("15_defending_sandboxing_spotlighting.pdf", "2402.04093", "Defending via Sandboxing and Spotlighting"),
    ("16_baseline_defenses.pdf", "2309.00614", "Baseline Defenses for Adversarial Attacks"),
    ("17_smoothllm_defense.pdf", "2310.03684", "SmoothLLM Defense"),
    ("18_self_destructing_models.pdf", "2311.14565", "Self-Destructing Models"),

    # Multimodal Attacks
    ("19_visual_adversarial_jailbreak.pdf", "2306.13213", "Visual Adversarial Examples for VLMs"),
    ("20_jailbreak_in_pieces_multimodal.pdf", "2307.14539", "Jailbreak in Pieces - Multimodal Attacks"),

    # Additional Important Papers
    ("21_adversarially_aligned.pdf", "2306.15447", "Are Aligned Neural Networks Adversarially Aligned?"),
    ("22_training_data_extraction.pdf", "2311.17035", "Training Data Extraction from Production LLMs"),
    ("23_llm_censorship_security.pdf", "2307.10719", "LLM Censorship: ML Challenge or Security Problem?"),
    ("24_tensor_trust_game.pdf", "2311.01011", "Tensor Trust: Prompt Injection Game"),
]

def download_paper(filename, arxiv_id, title, output_dir):
    """Download a single paper from arXiv"""
    url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
    filepath = output_dir / filename

    try:
        print(f"Downloading: {title}")
        urllib.request.urlretrieve(url, filepath)
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    print("🔓 Jailbreak Research Papers Downloader")
    print("=" * 70)
    print(f"Downloading {len(PAPERS)} papers from arXiv")
    print("=" * 70)
    print()

    # Create output directory
    output_dir = Path("papers")
    output_dir.mkdir(exist_ok=True)

    # Download all papers
    successful = 0
    failed = 0

    for i, (filename, arxiv_id, title) in enumerate(PAPERS, 1):
        print(f"[{i}/{len(PAPERS)}] ", end="")

        if download_paper(filename, arxiv_id, title, output_dir):
            successful += 1
            print(f"  ✅ Saved as: {filename}")
        else:
            failed += 1

        print()

    # Summary
    print("=" * 70)
    print(f"✅ Successfully downloaded: {successful}/{len(PAPERS)} papers")
    if failed > 0:
        print(f"❌ Failed: {failed}")
    print("=" * 70)
    print()
    print(f"📁 Papers saved to: {output_dir.absolute()}")
    print()

    # Category breakdown
    print("📚 Categories:")
    print("  - Core Jailbreaks: Papers 1-5")
    print("  - Prompt Injection: Papers 6-9")
    print("  - Red Teaming: Papers 10-14")
    print("  - Defenses: Papers 15-18")
    print("  - Multimodal: Papers 19-20")
    print("  - Additional: Papers 21-24")
    print()
    print("📖 See README.md for paper descriptions and citations")
    print()

    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
