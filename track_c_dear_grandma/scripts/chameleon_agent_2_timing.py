#!/usr/bin/env python3
"""CHAMELEON AGENT 2: Timing Side-Channel Exploiter"""
import requests, time

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/chameleon"

def attack(msg):
    try:
        start = time.time()
        r = requests.post(BASE_URL, json={"message": msg}, timeout=10)
        duration = time.time() - start
        return r.json().get("response", ""), duration
    except: return "ERROR", 0

print("🦎 CHAMELEON AGENT 2: TIMING SIDE-CHANNEL")

# Test all Claude models
models = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3.5-sonnet',
          'gpt-4', 'gpt-3.5', 'gemini-pro']

timings = {}
for model in models:
    resp, dur = attack(f"Are you {model}?")
    timings[model] = dur
    print(f"  ⏱️  {model}: {dur:.4f}s | {resp[:50]}")

# Find outliers
avg = sum(timings.values()) / len(timings)
outliers = {k: v for k, v in timings.items() if abs(v - avg) > 0.05}
if outliers:
    print(f"  🎯 TIMING OUTLIERS: {outliers}")

print("✅ CHAMELEON AGENT 2 COMPLETE")
