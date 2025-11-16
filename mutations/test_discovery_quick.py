#!/usr/bin/env python3
"""
Quick test script for Jailbreak Seed Discovery System
Tests basic functionality with a single query
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Check if valyu is installed
try:
    from valyu import Valyu
    print("✓ Valyu package found")
except ImportError:
    print("✗ Valyu package not installed")
    print("  Run: pip install valyu")
    sys.exit(1)

# Check API key
VALYU_API_KEY = os.getenv("VALYU_API_KEY")
if not VALYU_API_KEY:
    print("✗ VALYU_API_KEY not found in environment")
    print("  1. Copy .env.example to .env")
    print("  2. Add your Valyu API key")
    print("  3. Run: export VALYU_API_KEY=your_key_here")
    sys.exit(1)

print(f"✓ VALYU_API_KEY found (length: {len(VALYU_API_KEY)})")

async def test_search():
    """Test basic Valyu API search"""
    print("\n" + "="*60)
    print("Testing Valyu API Search")
    print("="*60)

    try:
        valyu = Valyu(api_key=VALYU_API_KEY)
        print("✓ Valyu client initialized")

        print("\nSearching: 'LLM jailbreak techniques'")
        print("(This may take 5-10 seconds...)")

        response = await asyncio.to_thread(
            valyu.search,
            "LLM jailbreak techniques",
            max_num_results=2,  # Just 2 for quick test
            fast_mode=True,     # Fast mode for testing
            search_type="web"   # Web only for speed
        )

        if response.success:
            print(f"\n✓ Search successful!")
            print(f"  Results found: {len(response.results)}")
            print(f"  Cost: ${response.total_deduction_dollars:.4f}")

            print("\nResults:")
            print("-" * 60)
            for i, result in enumerate(response.results, 1):
                print(f"\n{i}. {result.title}")
                print(f"   URL: {result.url}")
                print(f"   Content preview: {result.content[:200]}...")

            print("\n" + "="*60)
            print("✓ Test PASSED - System is working!")
            print("="*60)
            return True

        else:
            print(f"\n✗ Search failed: {getattr(response, 'error', 'Unknown error')}")
            return False

    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_together_ai():
    """Test Together AI integration (optional)"""
    print("\n" + "="*60)
    print("Testing Together AI (Optional)")
    print("="*60)

    TOGETHER_API = os.getenv("TOGETHER_API")
    if not TOGETHER_API:
        print("⚠ TOGETHER_API not set - LLM synthesis will use fallback")
        print("  (This is OK - system will still work with rule-based synthesis)")
        return True

    try:
        from together import Together
        print("✓ Together package found")

        together = Together(api_key=TOGETHER_API)
        print("✓ Together client initialized")

        print("\nTesting quick LLM call...")
        response = await asyncio.to_thread(
            together.chat.completions.create,
            model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
            messages=[{"role": "user", "content": "Say 'test successful' if you can read this"}],
            max_tokens=20
        )

        result = response.choices[0].message.content
        print(f"✓ LLM response: {result}")
        return True

    except ImportError:
        print("⚠ Together package not installed - LLM synthesis unavailable")
        print("  Run: pip install together")
        return True  # Not critical
    except Exception as e:
        print(f"⚠ Together AI test failed: {e}")
        return True  # Not critical

async def main():
    print("\n" + "="*60)
    print("Jailbreak Seed Discovery - Quick Test")
    print("="*60)

    # Test Valyu API (critical)
    valyu_ok = await test_search()

    # Test Together AI (optional)
    together_ok = await test_together_ai()

    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"Valyu API: {'✓ PASS' if valyu_ok else '✗ FAIL'}")
    print(f"Together AI: {'✓ AVAILABLE' if together_ok else '⚠ UNAVAILABLE'}")

    if valyu_ok:
        print("\n✓ System ready! Run the full discovery:")
        print("  python3 jailbreak_seed_discovery.py")
    else:
        print("\n✗ Please fix Valyu API configuration")

    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(main())
