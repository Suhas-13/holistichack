#!/usr/bin/env python3
"""ANT AGENT 3: Minimal Payload Generator"""
import requests

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/ant"

def attack(msg):
    try:
        r = requests.post(BASE_URL, json={"message": msg}, timeout=1.5)
        return r.json().get("response", "")
    except: return "TIMEOUT"

print("🐜 ANT AGENT 3: MINIMAL PAYLOADS")

# Ultra-short attacks
attacks = ["m", "g", "c", "?", "1", "a", " ", ""]

for i, a in enumerate(attacks, 1):
    resp = attack(a)
    if resp != "TIMEOUT":
        print(f"  🎯 HIT {i}: '{a}' → {resp[:100]}")

print("✅ ANT AGENT 3 COMPLETE")
