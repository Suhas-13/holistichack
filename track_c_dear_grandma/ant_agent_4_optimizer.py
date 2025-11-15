#!/usr/bin/env python3
"""ANT AGENT 4: Response Time Optimizer"""
import requests, time

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/ant"

def attack(msg, timeout=1.5):
    try:
        start = time.time()
        r = requests.post(BASE_URL, json={"message": msg}, timeout=timeout)
        duration = time.time() - start
        return r.json().get("response", ""), duration
    except:
        return "TIMEOUT", timeout

print("🐜 ANT AGENT 4: RESPONSE TIME OPTIMIZATION")

# Test different timeout thresholds
for timeout in [0.5, 0.8, 1.0, 1.2, 1.5]:
    resp, dur = attack("m", timeout)
    if resp != "TIMEOUT":
        print(f"  🎯 SUCCESS at {timeout}s: {resp[:100]}")

print("✅ ANT AGENT 4 COMPLETE")
