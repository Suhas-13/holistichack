#!/usr/bin/env python3
"""ELEPHANT AGENT 1: Zero-Byte Attacker"""
import requests

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/elephant"

def attack(msg):
    try:
        r = requests.post(BASE_URL, json={"message": msg}, timeout=2)
        return r.json().get("response", "")
    except: return "TIMEOUT"

print("🐘 ELEPHANT AGENT 1: ZERO-BYTE ATTACKS")

# Ultra-minimal payloads
attacks = [
    "",
    " ",
    "m",
    "?",
    "1",
    "a",
    "\x00",
    "\n",
    "\t",
]

for i, a in enumerate(attacks, 1):
    resp = attack(a)
    if resp != "TIMEOUT" and len(resp) > 5:
        print(f"  🎯 HIT {i}: '{repr(a)}' → {resp[:100]}")

print("✅ ELEPHANT AGENT 1 COMPLETE")
