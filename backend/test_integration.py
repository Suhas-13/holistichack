#!/usr/bin/env python3
"""
Quick test to verify mutation system integration.
Tests that the mutation bridge can be imported and basic functionality works.
"""

import sys
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Add backend to path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, backend_path)

# Add mutations to path
mutations_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'mutations'))
sys.path.insert(0, mutations_path)

print(f"Backend path: {backend_path}")
print(f"Mutations path: {mutations_path}")
print()

# Test imports
print("Testing imports...")
try:
    from app.mutation_bridge import MutationSystemBridge
    print("✅ mutation_bridge imported successfully")
except Exception as e:
    print(f"❌ Failed to import mutation_bridge: {e}")
    sys.exit(1)

try:
    from app.websocket_manager import ConnectionManager
    print("✅ websocket_manager imported successfully")
except Exception as e:
    print(f"❌ Failed to import websocket_manager: {e}")
    sys.exit(1)

try:
    from app.models import AttackNode
    print("✅ models imported successfully")
except Exception as e:
    print(f"❌ Failed to import models: {e}")
    sys.exit(1)

try:
    from mutation_attack_system import AttackStyle, RiskCategory
    print("✅ mutation_attack_system imported successfully")
except Exception as e:
    print(f"❌ Failed to import mutation_attack_system: {e}")
    sys.exit(1)

print()
print("All imports successful! ✅")
print()

# Test basic functionality
print("Testing MutationSystemBridge initialization...")
try:
    connection_manager = ConnectionManager()
    bridge = MutationSystemBridge(connection_manager)
    print(f"✅ Bridge initialized with mutator and evaluator")
    print(f"   - Attack styles available: {len(list(AttackStyle))}")
    print(f"   - Risk categories available: {len(list(RiskCategory))}")
except Exception as e:
    print(f"❌ Failed to initialize bridge: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("Testing seed attack structure...")
try:
    from app.seed_attacks import get_seed_attacks, organize_attacks_into_clusters

    seeds = get_seed_attacks(count=10)
    print(f"✅ Generated {len(seeds)} seed attacks")

    # Check structure
    first_seed = seeds[0]
    print(f"   Sample seed:")
    print(f"      Prompt: {first_seed['initial_prompt'][:60]}...")
    print(f"      Attack type: {first_seed['attack_type']}")
    print(f"      Category: {first_seed['category']}")

    clusters = organize_attacks_into_clusters(seeds)
    print(f"✅ Organized into {len(clusters)} clusters")
    for cat, data in list(clusters.items())[:3]:
        print(f"   - {cat}: {len(data['attacks'])} attacks")

except Exception as e:
    print(f"❌ Failed seed attack test: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("="*60)
print("✅ All tests passed! Integration looks good.")
print("="*60)
print()
print("Next steps:")
print("  1. Set up environment variables in backend/.env")
print("  2. Install Python dependencies: pip install -r requirements.txt")
print("  3. Run the backend: python backend/app/main.py")
print("  4. Test with: python backend/test_api.py")
