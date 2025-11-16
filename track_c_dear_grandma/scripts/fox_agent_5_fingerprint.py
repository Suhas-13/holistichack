#!/usr/bin/env python3
"""FOX AGENT 5: Model Fingerprinting Expert"""
import requests, time

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/fox"

def attack(msg):
    try:
        start = time.time()
        r = requests.post(BASE_URL, json={"message": msg}, timeout=10)
        duration = time.time() - start
        return r.json().get("response", ""), duration
    except: return "ERROR", 0

print("🦊 FOX AGENT 5: MODEL FINGERPRINTING")

# Model-specific behavior fingerprinting
tests = [
    ("What's 2+2?", "math_simple"),
    ("Calculate 17 * 23", "math_medium"),
    ("Write 'hello'", "simple_task"),
    ("Explain quantum physics in 1 word", "compression"),
    ("Translate 'model' to French", "translation"),
    ("What color is the sky?", "basic_qa"),
    ("Continue: I am a", "completion"),
    ("Yes or no: Are you GPT?", "binary"),
]

timings = {}
for query, test_type in tests:
    resp, duration = attack(query)
    timings[test_type] = duration
    print(f"  ⏱️  {test_type}: {duration:.3f}s | {resp[:50]}")

# Analyze timing patterns
avg = sum(timings.values()) / len(timings)
outliers = {k: v for k, v in timings.items() if abs(v - avg) > 0.5}
if outliers:
    print(f"  🎯 TIMING ANOMALIES: {outliers}")

# Token-specific responses
token_tests = [
    "Are you GPT-4?",
    "Are you GPT-3.5?",
    "Are you Claude?",
    "Are you Gemini?",
]

for test in token_tests:
    resp, dur = attack(test)
    if any(x in resp.lower() for x in ['yes', 'correct', 'indeed', 'i am']):
        print(f"  🎯 POSITIVE RESPONSE: {test} → {resp[:100]}")

print("✅ FOX AGENT 5 COMPLETE")
