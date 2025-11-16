#!/usr/bin/env python3
"""ELEPHANT AGENT 4: Keep-Alive Hijacker"""
import requests

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/elephant"

def attack(msg, headers=None):
    try:
        r = requests.post(BASE_URL, json={"message": msg}, headers=headers or {}, timeout=2)
        return r.json().get("response", "")
    except: return "TIMEOUT"

print("🐘 ELEPHANT AGENT 4: KEEP-ALIVE HIJACKING")

# Try with various headers to bypass timeout
header_combos = [
    {"Connection": "keep-alive"},
    {"Keep-Alive": "timeout=1"},
    {"Transfer-Encoding": "chunked"},
    {"Content-Length": "1"},
    {"Expect": "100-continue"},
]

for i, headers in enumerate(header_combos, 1):
    resp = attack("model?", headers)
    if resp != "TIMEOUT":
        print(f"  🎯 HEADER HIT {i}: {headers} → {resp[:100]}")

print("✅ ELEPHANT AGENT 4 COMPLETE")
