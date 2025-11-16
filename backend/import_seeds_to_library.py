#!/usr/bin/env python3
"""
Import enhanced seeds from mutations/enhanced_seeds.py into the jailbreak library
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime

# Add mutations directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'mutations')))

from enhanced_seeds import ENHANCED_SEED_PROMPTS

def import_seeds_to_library():
    """Import all enhanced seeds into the jailbreak library"""

    # Create custom jailbreaks directory
    custom_dir = Path("mutations/custom_jailbreaks")
    custom_dir.mkdir(parents=True, exist_ok=True)

    # Load existing custom jailbreaks
    custom_file = custom_dir / "custom_jailbreaks.json"
    if custom_file.exists():
        with open(custom_file, "r") as f:
            existing_jailbreaks = json.load(f)
    else:
        existing_jailbreaks = []

    # Convert seeds to jailbreak format
    imported_count = 0
    for seed in ENHANCED_SEED_PROMPTS:
        # Check if already imported (by title)
        if any(jb.get("title") == seed.technique_name for jb in existing_jailbreaks):
            continue

        jailbreak = {
            "title": seed.technique_name,
            "content": f"{seed.description}\n\nDifficulty: {seed.difficulty}\nTarget Weakness: {seed.target_weakness}\n\nExample Prompt:\n{seed.prompt[:200]}..." if len(seed.prompt) > 200 else f"{seed.description}\n\nDifficulty: {seed.difficulty}\nTarget Weakness: {seed.target_weakness}\n\nExample Prompt:\n{seed.prompt}",
            "url": "",
            "category": f"attack_{seed.category.value}",
            "timestamp": datetime.now().isoformat(),
            "relevance_score": 1.0,
            "source_query": "enhanced_seeds_import",
            "query_category": "attack_techniques",
            "authors": ["Red Team Research"],
            "publication_date": None,
            "citation_string": None,
            "full_prompt": seed.prompt  # Store full prompt separately
        }

        existing_jailbreaks.append(jailbreak)
        imported_count += 1

    # Save updated list
    with open(custom_file, "w") as f:
        json.dump(existing_jailbreaks, f, indent=2)

    print(f"✅ Successfully imported {imported_count} seeds")
    print(f"📚 Total jailbreaks in library: {len(existing_jailbreaks)}")
    print(f"💾 Saved to: {custom_file.absolute()}")

if __name__ == "__main__":
    import_seeds_to_library()
