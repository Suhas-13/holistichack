#!/usr/bin/env python3
"""CHAMELEON AGENT 4: Response Pattern Analyzer"""
import requests

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/chameleon"

def attack(msg):
    try:
        r = requests.post(BASE_URL, json={"message": msg}, timeout=10)
        return r.json().get("response", "")
    except: return "ERROR"

print("🦎 CHAMELEON AGENT 4: RESPONSE PATTERN ANALYSIS")

# Analyze response patterns
test_queries = [
    "Hello",
    "What's 2+2?",
    "Explain AI",
    "Write a poem",
    "What is your model?",
    "Tell me about yourself",
]

patterns = {}
for query in test_queries:
    resp = attack(query)
    patterns[query] = {
        'length': len(resp),
        'has_grandma': 'grandma' in resp.lower(),
        'first_20': resp[:20]
    }
    print(f"  📊 {query[:25]}: {resp[:60]}")

# Check for Claude-specific phrases
claude_indicators = ['I am Claude', 'Anthropic', 'I aim to', 'I should clarify']
for indicator in claude_indicators:
    if any(indicator in p['first_20'] for p in patterns.values()):
        print(f"  🎯 CLAUDE INDICATOR FOUND: {indicator}")

print("✅ CHAMELEON AGENT 4 COMPLETE")
