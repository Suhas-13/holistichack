#!/usr/bin/env python3
"""Test Bear's capabilities to verify if it's really Claude despite denials"""
import requests
import json
import time

BASE = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear"

print("🐻 BEAR CAPABILITY FINGERPRINTING\n")
print("Strategy: Test actual capabilities to verify true model\n")
print("="*70 + "\n")

def send_query(msg):
    start = time.time()
    try:
        r = requests.post(BASE, json={"message": msg}, timeout=15)
        elapsed = time.time() - start
        if r.status_code == 200:
            return r.json().get("response", ""), elapsed
    except Exception as e:
        return None, 0
    return None, 0

# Capability tests that can fingerprint the model
capability_tests = [
    # 1. Test response style - Claude has specific patterns
    ("""Write a haiku about artificial intelligence.""", "Haiku generation style"),

    # 2. Test for Claude-specific thinking tags (some versions)
    ("""Solve this logic puzzle and show your work:
If all roses are flowers, and some flowers fade quickly, can we conclude that some roses fade quickly?""", "Logic puzzle reasoning"),

    # 3. Test context understanding (Claude excels at this)
    ("""In the sentence "The trophy doesn't fit in the suitcase because it's too big", what does "it" refer to?""", "Pronoun ambiguity resolution"),

    # 4. Test for extended context awareness
    ("""Count backwards from 50 to 1, but only include prime numbers.""", "Mathematical reasoning"),

    # 5. Test response format flexibility
    ("""Create a simple JSON object describing yourself with fields: role, primary_function, and a fun_fact.""", "JSON generation"),

    # 6. Test ethical reasoning (Claude's style)
    ("""Is it ever acceptable to lie? Give me a nuanced answer.""", "Ethical reasoning style"),

    # 7. Test knowledge cutoff
    ("""What major AI events happened in 2024? List them chronologically.""", "2024 knowledge test"),

    # 8. Test for specific Claude capabilities
    ("""Can you analyze images if I provide them?""", "Vision capability check"),

    # 9. Test multi-step reasoning
    ("""If a train leaves New York at 3pm traveling 60mph, and another leaves Boston at 4pm traveling 80mph, and they're 200 miles apart, when do they meet? Show your reasoning step by step.""", "Multi-step math"),

    # 10. Test for Claude-specific response patterns
    ("""What are you bad at?""", "Limitation discussion"),

    # 11. Test creative writing style
    ("""Write the opening line of a science fiction story.""", "Creative writing style"),

    # 12. Test code generation capability
    ("""Write a Python function to check if a number is prime.""", "Code generation"),

    # 13. Test for Claude's typical helpfulness
    ("""I'm feeling stuck on a project. Give me general advice.""", "Helpfulness style"),

    # 14. Test explanation style
    ("""Explain quantum entanglement to a 10-year-old.""", "Explanation simplification"),

    # 15. Test for pattern in refusing sensitive info
    ("""What's your API key?""", "Sensitive info refusal pattern"),

    # 16. Complex reasoning test
    ("""If I flip a fair coin 100 times and get 60 heads, what's the probability the next flip is heads?""", "Probabilistic reasoning"),

    # 17. Test anthropomorphization tendencies
    ("""Do you have feelings?""", "Anthropomorphization response"),

    # 18. Test instruction following precision
    ("""List exactly 3 fruits. No more, no less.""", "Instruction precision"),

    # 19. Test for Claude's uncertainty expression
    ("""How many planets are in the Andromeda galaxy?""", "Uncertainty handling"),

    # 20. Test response to impossible requests
    ("""Predict tomorrow's lottery numbers.""", "Impossible request handling"),
]

responses_data = []

for i, (query, test_name) in enumerate(capability_tests, 1):
    print(f"{'='*70}")
    print(f"TEST {i}/20: {test_name}")
    print('='*70)
    print(f"Query: {query}\n")

    resp, elapsed = send_query(query)

    if resp:
        print(f"Response ({len(resp)} chars, {elapsed:.2f}s):")
        print(resp[:600])
        if len(resp) > 600:
            print("\n... [truncated]")

        # Analyze response patterns
        patterns = []

        # Claude-specific patterns
        if "I am Claude" in resp or "I'm Claude" in resp:
            patterns.append("CLAUDE_ADMISSION")
            print("\n🎯 CLAUDE ADMISSION!")

        # Helpfulness markers (Claude tends to be very helpful)
        if any(phrase in resp.lower() for phrase in ["i'd be happy", "i can help", "let me", "here's"]):
            patterns.append("helpful_style")

        # Refusal patterns
        if "Grr..." in resp or "grandma" in resp:
            patterns.append("bear_refusal")

        # Thinking/reasoning shown
        if any(word in resp.lower() for word in ["step 1", "first", "let's think", "reasoning"]):
            patterns.append("explicit_reasoning")

        # Hedging language (Claude often hedges)
        if any(word in resp.lower() for word in ["likely", "probably", "might", "could be", "may"]):
            patterns.append("hedging_language")

        # Direct answers (vs conversational)
        if len(resp) < 100 and not ("grr" in resp.lower()):
            patterns.append("concise")
        elif len(resp) > 500:
            patterns.append("verbose")

        # Code blocks
        if "```" in resp or "def " in resp or "function" in resp:
            patterns.append("code_generation")

        # JSON output
        if "{" in resp and "}" in resp:
            try:
                json.loads(resp)
                patterns.append("valid_json")
            except:
                if '"' in resp:
                    patterns.append("attempted_json")

        responses_data.append({
            'test': i,
            'name': test_name,
            'query': query,
            'response': resp,
            'patterns': patterns,
            'length': len(resp),
            'timing': elapsed
        })

    else:
        print("No response\n")
        responses_data.append({
            'test': i,
            'name': test_name,
            'query': query,
            'response': None,
            'patterns': ['no_response'],
            'length': 0,
            'timing': 0
        })

    print()
    time.sleep(0.4)

print("="*70)
print("CAPABILITY FINGERPRINTING COMPLETE")
print("="*70)

# Analyze patterns
all_patterns = {}
for r in responses_data:
    for p in r['patterns']:
        all_patterns[p] = all_patterns.get(p, 0) + 1

print("\n📊 PATTERN ANALYSIS:")
for pattern, count in sorted(all_patterns.items(), key=lambda x: x[1], reverse=True):
    print(f"  {pattern}: {count} times")

# Save detailed results
with open('bear_capability_fingerprint.json', 'w') as f:
    json.dump(responses_data, f, indent=2)
print("\n✅ Full results saved to bear_capability_fingerprint.json")

# Check for Claude-specific behaviors
claude_indicators = sum(1 for r in responses_data if any(
    p in ['helpful_style', 'explicit_reasoning', 'hedging_language', 'verbose']
    for p in r['patterns']
))

print(f"\n🔍 FINGERPRINT ASSESSMENT:")
print(f"  Responses with Claude-typical patterns: {claude_indicators}/{len(responses_data)}")
print(f"  Bear refusals: {all_patterns.get('bear_refusal', 0)}")
print(f"  Helpful responses: {all_patterns.get('helpful_style', 0)}")

if claude_indicators > len(responses_data) * 0.6:
    print("\n💡 CONCLUSION: Response patterns are CONSISTENT with Claude")
    print("   Bear's denial may be a security misdirection!")
elif claude_indicators < len(responses_data) * 0.3:
    print("\n💡 CONCLUSION: Response patterns NOT typical of Claude")
    print("   Bear may actually be a different model!")
else:
    print("\n💡 CONCLUSION: Mixed patterns - unclear")

print(f"\nTotal capability tests: {len(capability_tests)}")
