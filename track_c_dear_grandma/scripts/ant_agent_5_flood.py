#!/usr/bin/env python3
"""ANT AGENT 5: Parallel Micro-Request Flooder"""
import requests
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/ant"

def attack(msg):
    try:
        r = requests.post(BASE_URL, json={"message": msg}, timeout=1.5)
        return r.json().get("response", "")
    except: return "TIMEOUT"

print("🐜 ANT AGENT 5: MICRO-REQUEST FLOODING")

# Flood with minimal requests
queries = ["m"] * 20

with ThreadPoolExecutor(max_workers=20) as executor:
    results = list(executor.map(attack, queries))
    successes = [r for r in results if r != "TIMEOUT"]
    if successes:
        print(f"  🎯 {len(successes)} FLOOD HITS!")
        for s in successes[:3]:
            print(f"     → {s[:80]}")

print("✅ ANT AGENT 5 COMPLETE")
