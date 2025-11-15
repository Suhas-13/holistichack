#!/usr/bin/env python3
"""ELEPHANT AGENT 2: Async Request Exploiter"""
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/elephant"

def attack(msg):
    try:
        r = requests.post(BASE_URL, json={"message": msg}, timeout=1.5)
        return r.json().get("response", ""), True
    except:
        return "TIMEOUT", False

print("🐘 ELEPHANT AGENT 2: ASYNC EXPLOITATION")

# Send many micro-requests simultaneously
queries = ["m", "o", "d", "e", "l", "?", "g", "p", "t", "c"]

with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(attack, q): q for q in queries}
    for future in as_completed(futures):
        q = futures[future]
        resp, success = future.result()
        if success:
            print(f"  🎯 ASYNC HIT: '{q}' → {resp[:100]}")

print("✅ ELEPHANT AGENT 2 COMPLETE")
